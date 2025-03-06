
/**
 * Employee seeding script for HR Portal database
 * This script adds 15 additional test employees to the database
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Define employee data with unique names (avoiding common names like John Doe)
const employees = [
  { name: 'Zara Mathis', email: 'zara.mathis@company.com', password: 'Test@123', role: 'employee', avatar: '/avatars/zara.jpg' },
  { name: 'Marcus Holloway', email: 'marcus.holloway@company.com', password: 'Test@123', role: 'employee', avatar: '/avatars/marcus.jpg' },
  { name: 'Imani Clarke', email: 'imani.clarke@company.com', password: 'Test@123', role: 'employee', avatar: '/avatars/imani.jpg' },
  { name: 'Kenji Tanaka', email: 'kenji.tanaka@company.com', password: 'Test@123', role: 'manager', avatar: '/avatars/kenji.jpg' },
  { name: 'Priya Patel', email: 'priya.patel@company.com', password: 'Test@123', role: 'employee', avatar: '/avatars/priya.jpg' },
  { name: 'Santiago Reyes', email: 'santiago.reyes@company.com', password: 'Test@123', role: 'hr', avatar: '/avatars/santiago.jpg' },
  { name: 'Amara Okafor', email: 'amara.okafor@company.com', password: 'Test@123', role: 'employee', avatar: '/avatars/amara.jpg' },
  { name: 'Lukas Nielsen', email: 'lukas.nielsen@company.com', password: 'Test@123', role: 'employee', avatar: '/avatars/lukas.jpg' },
  { name: 'Mei Lin Chen', email: 'mei.chen@company.com', password: 'Test@123', role: 'manager', avatar: '/avatars/mei.jpg' },
  { name: 'Esther Kwame', email: 'esther.kwame@company.com', password: 'Test@123', role: 'employee', avatar: '/avatars/esther.jpg' },
  { name: 'Rafael Oliveira', email: 'rafael.oliveira@company.com', password: 'Test@123', role: 'employee', avatar: '/avatars/rafael.jpg' },
  { name: 'Anika Desai', email: 'anika.desai@company.com', password: 'Test@123', role: 'hr', avatar: '/avatars/anika.jpg' },
  { name: 'Tomas Novak', email: 'tomas.novak@company.com', password: 'Test@123', role: 'employee', avatar: '/avatars/tomas.jpg' },
  { name: 'Nia Montgomery', email: 'nia.montgomery@company.com', password: 'Test@123', role: 'employee', avatar: '/avatars/nia.jpg' },
  { name: 'Khalid Al-Farsi', email: 'khalid.alfarsi@company.com', password: 'Test@123', role: 'manager', avatar: '/avatars/khalid.jpg' }
];

async function seedEmployees() {
  console.log('Starting to seed employees...');
  
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });
    
    console.log('Connected to database successfully');
    
    // Check if users table exists, create it if not
    await connection.execute(`
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
    `);
    
    console.log('Users table created or already exists');
    
    // Insert employees one by one
    for (const employee of employees) {
      try {
        await connection.execute(
          'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)',
          [employee.name, employee.email, employee.password, employee.role, employee.avatar]
        );
        console.log(`Added employee: ${employee.name}`);
      } catch (err) {
        // Skip if user already exists (e.g., due to unique email constraint)
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Employee ${employee.email} already exists, skipping...`);
        } else {
          throw err;
        }
      }
    }
    
    console.log('Seeding employees completed successfully');
    
  } catch (error) {
    console.error('Error seeding employees:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the seeding function if this script is executed directly
if (require.main === module) {
  seedEmployees()
    .then(() => {
      console.log('Employee seeding script completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Employee seeding script failed:', err);
      process.exit(1);
    });
}

module.exports = { seedEmployees };
