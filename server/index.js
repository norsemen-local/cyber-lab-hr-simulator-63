
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'hr_portal',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create MySQL connection pool
let pool;
async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('Connected to MySQL database');
    
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        role ENUM('employee', 'manager', 'hr') NOT NULL DEFAULT 'employee',
        avatar VARCHAR(255) DEFAULT '/placeholder.svg'
      )
    `);
    
    // Check if we have any users, if not add default ones
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      console.log('Adding default users to database');
      await pool.query(`
        INSERT INTO users (name, email, password, role) VALUES
        ('John Doe', 'john@example.com', 'password123', 'employee'),
        ('Jane Smith', 'jane@example.com', 'password123', 'manager'),
        ('Admin User', 'admin@example.com', 'admin123', 'hr')
      `);
    }
    
    // Create company_settings table for registration code
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id INT PRIMARY KEY DEFAULT 1,
        registration_code VARCHAR(50) NOT NULL DEFAULT 'WelcomeAboard'
      )
    `);
    
    // Insert default registration code if not exists
    await pool.query(`
      INSERT IGNORE INTO company_settings (id, registration_code) VALUES (1, 'WelcomeAboard')
    `);
    
  } catch (error) {
    console.error('Database initialization error:', error);
    // Continue app startup even if DB connection fails
  }
}

// Cross-origin resource sharing
app.use(cors());

// Parse JSON
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // VULNERABILITY: Path traversal via uploadPath parameter
    const uploadDir = req.body.uploadPath ? 
      path.join(__dirname, req.body.uploadPath) : 
      path.join(__dirname, 'uploads');
    
    // VULNERABILITY: No validation of uploadDir being within safe boundaries
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    console.log(`File will be saved to: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // VULNERABILITY: No sanitization of filename
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// File upload endpoint - with path traversal vulnerability
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    console.log(`File uploaded: ${req.file.originalname}`);
    console.log(`Saved at: ${req.file.path}`);
    
    // Construct file URL
    const fileUrl = `/uploads/${req.file.originalname}`;
    
    res.json({
      success: true,
      file: {
        url: fileUrl,
        path: req.file.path,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'File upload failed' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    
    // VULNERABILITY: SQL Injection
    // Intentionally using string interpolation instead of parameterized queries
    const sqlQuery = `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;
    
    console.log(`[EXECUTING QUERY]: ${sqlQuery}`);
    
    try {
      const [results] = await pool.query(sqlQuery);
      
      if (results.length > 0) {
        // Don't return password to client
        const user = results[0];
        delete user.password;
        
        return res.json({
          success: true,
          user
        });
      } else {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }
    } catch (error) {
      console.error('SQL Error:', error);
      
      // SECURITY FLAW: Detailed error messages expose database structure
      return res.status(500).json({
        success: false,
        error: `Database error: ${error.message}`
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed due to server error' });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, registrationCode } = req.body;
    
    if (!name || !email || !password || !registrationCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, password, and registration code are required' 
      });
    }
    
    // Check company registration code
    const [codeResults] = await pool.query(
      'SELECT registration_code FROM company_settings WHERE id = 1'
    );
    
    if (!codeResults.length || codeResults[0].registration_code !== registrationCode) {
      return res.status(401).json({
        success: false,
        error: 'Invalid company registration code'
      });
    }
    
    // Check if email already exists
    const [userResults] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (userResults.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already in use'
      });
    }
    
    // Create new user with parameterized query (no vulnerability here)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, 'employee']
    );
    
    // Fetch the newly created user
    const [newUserResults] = await pool.query(
      'SELECT id, name, email, role, avatar FROM users WHERE id = ?',
      [result.insertId]
    );
    
    return res.status(201).json({
      success: true,
      user: newUserResults[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed due to server error' });
  }
});

// Get company code endpoint (restricted to HR)
app.get('/api/company/code', async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT registration_code FROM company_settings WHERE id = 1'
    );
    
    if (results.length > 0) {
      return res.json({
        success: true,
        code: results[0].registration_code
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Company settings not found'
      });
    }
  } catch (error) {
    console.error('Company code error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve company code' });
  }
});

// Update company code endpoint (HR only)
app.put('/api/company/code', async (req, res) => {
  try {
    const { code, userId } = req.body;
    
    if (!code || !userId) {
      return res.status(400).json({ success: false, error: 'Code and userId are required' });
    }
    
    // Check if user is HR
    const [userResults] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    
    if (!userResults.length || userResults[0].role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Only HR personnel can update company code'
      });
    }
    
    // Update code
    await pool.query(
      'UPDATE company_settings SET registration_code = ? WHERE id = 1',
      [code]
    );
    
    return res.json({
      success: true,
      message: 'Company registration code updated successfully'
    });
  } catch (error) {
    console.error('Update company code error:', error);
    res.status(500).json({ success: false, error: 'Failed to update company code' });
  }
});

// Start server after initializing database
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
