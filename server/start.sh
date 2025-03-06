
#!/bin/sh
# Set up error handling
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL database at ${DB_HOST}..."
# More reliable wait-for-it approach
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  echo "Attempting to connect to database (attempt $((ATTEMPT+1))/${MAX_ATTEMPTS})..."
  if nc -z ${DB_HOST:-localhost} ${DB_PORT:-3306}; then
    echo "Database connection successful!"
    break
  fi
  ATTEMPT=$((ATTEMPT+1))
  sleep 5
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo "Failed to connect to database after ${MAX_ATTEMPTS} attempts."
  exit 1
fi

# Create database tables with debugging info
echo "Creating database tables..."
node -e "
const mysql = require('mysql2/promise');
const fs = require('fs');

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
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('employee', 'manager', 'hr') NOT NULL DEFAULT 'employee',
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    \`);
    
    console.log('Creating company_settings table...');
    await connection.execute(\`
      CREATE TABLE IF NOT EXISTS company_settings (
        id INT PRIMARY KEY DEFAULT 1,
        registration_code VARCHAR(50) NOT NULL DEFAULT 'WelcomeAboard'
      )
    \`);
    
    console.log('Inserting default company settings...');
    await connection.execute(\`
      INSERT IGNORE INTO company_settings (id, registration_code) VALUES (1, 'WelcomeAboard')
    \`);
    
    await connection.end();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup error:', error);
    process.exit(1);
  }
}

setupDatabase();
"

# Seed the database with employee records
echo "Seeding the database with employee records..."
cd /app/server && node db/seedEmployees.js

# Start the app
echo "Starting HR Portal server..."
node /app/server/index.js
