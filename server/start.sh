
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
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('employee', 'manager', 'hr') NOT NULL DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    \`);
    
    console.log('Creating user_profiles table...');
    await connection.execute(\`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        phone VARCHAR(20),
        position VARCHAR(100),
        department VARCHAR(100),
        manager VARCHAR(100),
        join_date DATE,
        bio TEXT,
        avatar VARCHAR(255),
        street_address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(50),
        zip_code VARCHAR(20),
        country VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    \`);
    
    console.log('Creating career_history table...');
    await connection.execute(\`
      CREATE TABLE IF NOT EXISTS career_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        company VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    \`);
    
    console.log('Creating documents table...');
    await connection.execute(\`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT,
        upload_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    \`);

    console.log('Creating skills table...');
    await connection.execute(\`
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    \`);

    console.log('Creating education table...');
    await connection.execute(\`
      CREATE TABLE IF NOT EXISTS education (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        institution VARCHAR(255) NOT NULL,
        degree VARCHAR(100) NOT NULL,
        field_of_study VARCHAR(100),
        graduation_year VARCHAR(4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    
    // Insert a sample admin user
    console.log('Checking for admin user...');
    const [adminCheck] = await connection.execute('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
    
    if (adminCheck.length === 0) {
      console.log('Creating admin user...');
      const adminResult = await connection.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        ['admin@example.com', '$2a$10$zGqHcFXPLxjGUUQFc0LKVeEIRlVOx7uJPJMlchkCltGUhCv2efTNS', 'hr'] // password: admin123
      );
      
      const adminId = adminResult[0].insertId;
      
      await connection.execute(
        'INSERT INTO user_profiles (user_id, first_name, last_name, position, department, manager, join_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [adminId, 'Admin', 'User', 'HR Administrator', 'Human Resources', 'CEO', '2020-01-01']
      );
      
      console.log('Admin user created with ID:', adminId);
    } else {
      console.log('Admin user already exists');
    }
    
    // Insert a sample employee user
    console.log('Checking for employee user...');
    const [employeeCheck] = await connection.execute('SELECT * FROM users WHERE email = ?', ['employee@example.com']);
    
    if (employeeCheck.length === 0) {
      console.log('Creating employee user...');
      const employeeResult = await connection.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        ['employee@example.com', '$2a$10$6PX1E/WikDg0iLGnxnEn5.LbVvnGcTWAeJbxl6O5qwpLpSI6sBG4m', 'employee'] // password: employee123
      );
      
      const employeeId = employeeResult[0].insertId;
      
      await connection.execute(
        'INSERT INTO user_profiles (user_id, first_name, last_name, position, department, manager, join_date, bio, street_address, city, state, zip_code, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [employeeId, 'Alex', 'Johnson', 'Senior Developer', 'Engineering', 'Sarah Williams', '2020-03-15', 'Experienced software developer with a passion for building scalable web applications.', '123 Tech Lane', 'San Francisco', 'CA', '94107', 'USA']
      );
      
      // Add career history
      await connection.execute(
        'INSERT INTO career_history (user_id, company, position, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)',
        [employeeId, 'TechPro Solutions', 'Senior Developer', '2020-03-15', null, 'Leading development of customer-facing applications']
      );
      
      await connection.execute(
        'INSERT INTO career_history (user_id, company, position, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)',
        [employeeId, 'Innovate Tech', 'Software Developer', '2018-01-15', '2020-02-28', 'Developed web applications using React and Node.js']
      );
      
      // Add documents
      await connection.execute(
        'INSERT INTO documents (user_id, name, type, upload_date, content) VALUES (?, ?, ?, ?, ?)',
        [employeeId, 'Employment Contract', 'Legal', '2020-03-15', 'This employment contract is made between TechPro Solutions and Alex Johnson...']
      );
      
      await connection.execute(
        'INSERT INTO documents (user_id, name, type, upload_date, content) VALUES (?, ?, ?, ?, ?)',
        [employeeId, 'Performance Review 2021', 'Review', '2021-12-10', 'Annual performance review for Alex Johnson. Overall rating: Exceeds Expectations...']
      );
      
      // Add skills
      await connection.execute('INSERT INTO skills (user_id, name) VALUES (?, ?)', [employeeId, 'JavaScript']);
      await connection.execute('INSERT INTO skills (user_id, name) VALUES (?, ?)', [employeeId, 'React']);
      await connection.execute('INSERT INTO skills (user_id, name) VALUES (?, ?)', [employeeId, 'Node.js']);
      await connection.execute('INSERT INTO skills (user_id, name) VALUES (?, ?)', [employeeId, 'TypeScript']);
      
      // Add education
      await connection.execute(
        'INSERT INTO education (user_id, institution, degree, field_of_study, graduation_year) VALUES (?, ?, ?, ?, ?)',
        [employeeId, 'Stanford University', 'Master\\'s', 'Computer Science', '2018']
      );
      
      console.log('Employee user created with ID:', employeeId);
    } else {
      console.log('Employee user already exists');
    }
    
    await connection.end();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup error:', error);
    process.exit(1);
  }
}

setupDatabase();
"

# Seed the database with employee records (will only run if the above setup was successful)
echo "Seeding the database with employee records..."
cd /app/server && node db/seedEmployees.js

# Start the app
echo "Starting HR Portal server..."
node /app/server/index.js
