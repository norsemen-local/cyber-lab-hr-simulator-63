
#!/bin/bash

# This script deploys the server code to the EC2 instance
# It should be run from the project root directory

# Exit on error
set -e

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Get EC2 instance ID from terraform output
echo "Getting EC2 instance ID..."
cd terraform
INSTANCE_ID=$(terraform output -raw instance_id)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
cd ..

if [ -z "$INSTANCE_ID" ]; then
    echo "Failed to get instance ID. Make sure the infrastructure is deployed."
    exit 1
fi

echo "Deploying to EC2 instance: $INSTANCE_ID"
echo "Using RDS endpoint: $RDS_ENDPOINT"

# Create a deployment package
echo "Creating deployment package..."
cd server
zip -r ../deployment.zip .
cd ..

# Upload the deployment package to the instance
echo "Uploading deployment package..."
aws ec2-instance-connect send-ssh-public-key \
    --instance-id $INSTANCE_ID \
    --availability-zone us-east-1a \
    --instance-os-user ec2-user \
    --ssh-public-key file://~/.ssh/id_rsa.pub

# Get the instance's public IP address
INSTANCE_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query "Reservations[0].Instances[0].PublicIpAddress" \
    --output text)

# SSH to the instance and deploy the code
echo "Deploying code to instance at $INSTANCE_IP..."
scp -o StrictHostKeyChecking=no deployment.zip ec2-user@$INSTANCE_IP:~/

# Get database credentials from terraform (securely)
DB_USERNAME=$(cd terraform && terraform output -raw db_username)
DB_PASSWORD=$(cd terraform && terraform output -raw db_password)

# Escape special characters
DB_PASSWORD_ESCAPED=$(echo "$DB_PASSWORD" | sed 's/\\/\\\\/g; s/\//\\\//g; s/&/\\&/g')

ssh -o StrictHostKeyChecking=no ec2-user@$INSTANCE_IP << EOF
    # Extract deployment package
    mkdir -p ~/hr-server
    unzip -o ~/deployment.zip -d ~/hr-server
    cd ~/hr-server
    
    # Install Node.js if not already installed
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
        sudo yum install -y nodejs
    fi
    
    # Install dependencies
    npm install
    
    # Set up environment file with RDS credentials
    cat > .env << ENVFILE
DB_HOST=$RDS_ENDPOINT
DB_USER=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD_ESCAPED
DB_NAME=hr_portal
DB_PORT=3306
PORT=80
NODE_ENV=production
ENVFILE

    # Create API endpoint for database stats
    cat > routes/database.js << ROUTEFILE
const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database stats API endpoint
router.get('/stats', async (req, res) => {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });
    
    // Get user count
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    await connection.end();
    
    res.json({
      success: true,
      userCount: rows[0].count
    });
  } catch (error) {
    console.error('Database stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve database statistics'
    });
  }
});

module.exports = router;
ROUTEFILE

    # Register the database routes in the main app
    sed -i '/const app = express();/a const databaseRoutes = require("./routes/database");' index.js
    sed -i '/app.use(cors());/a app.use("/api/database", databaseRoutes);' index.js

    # Run the database setup script to create tables and seed data
    echo "Setting up database tables and seeding data..."
    node -e "$(cat << 'SCRIPTEND'
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  console.log('Connecting to database:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });
    
    console.log('Connected to database successfully');
    
    console.log('Creating users table...');
    await connection.execute(\`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('employee', 'manager', 'hr') NOT NULL DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    \`);
    
    // Insert a sample admin user if it doesn't exist
    console.log('Checking for admin user...');
    const [adminCheck] = await connection.execute('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
    
    if (adminCheck.length === 0) {
      console.log('Creating admin user...');
      await connection.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        ['admin@example.com', '$2a$10$zGqHcFXPLxjGUUQFc0LKVeEIRlVOx7uJPJMlchkCltGUhCv2efTNS', 'hr']
      );
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
    
    // Add more users for testing
    for (let i = 1; i <= 10; i++) {
      try {
        await connection.execute(
          'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
          [\`test.user\${i}@example.com\`, '$2a$10$zGqHcFXPLxjGUUQFc0LKVeEIRlVOx7uJPJMlchkCltGUhCv2efTNS', 'employee']
        );
        console.log(\`Created test user \${i}\`);
      } catch (err) {
        // Skip if user already exists
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(\`User test.user\${i}@example.com already exists\`);
        } else {
          throw err;
        }
      }
    }
    
    await connection.end();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup error:', error);
    process.exit(1);
  }
}

setupDatabase();
SCRIPTEND
)"

    # Seed the database with employee records
    echo "Seeding the database with employee records..."
    node db/seedEmployees.js

    # Update systemd service to use env file
    sudo bash -c 'cat > /etc/systemd/system/hr-server.service << SERVICEEOF
[Unit]
Description=HR Portal Server
After=network.target

[Service]
ExecStart=/usr/bin/node /home/ec2-user/hr-server/index.js
Restart=always
User=ec2-user
EnvironmentFile=/home/ec2-user/hr-server/.env
WorkingDirectory=/home/ec2-user/hr-server

[Install]
WantedBy=multi-user.target
SERVICEEOF'

    # Reload systemd, enable and start service
    sudo systemctl daemon-reload
    sudo systemctl enable hr-server
    sudo systemctl restart hr-server
    echo "Deployment complete, service started"
EOF

# Clean up
rm deployment.zip

echo "Deployment completed successfully!"
echo "Server should be running at http://$INSTANCE_IP"
