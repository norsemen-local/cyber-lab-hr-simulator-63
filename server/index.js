
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Set up multer for file uploads with VULNERABLE configuration
// This demonstrates the path traversal vulnerability
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // VULNERABLE: We're not sanitizing the uploadPath, allowing path traversal
    const uploadPath = req.body.uploadPath || UPLOAD_DIR;
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      try {
        fs.mkdirSync(uploadPath, { recursive: true });
      } catch (err) {
        console.error('Failed to create directory:', err);
        // Fall back to default upload directory
        return cb(null, UPLOAD_DIR);
      }
    }
    
    console.log(`Uploading to: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // VULNERABLE: We're using the original filename without sanitization
    const filename = file.originalname;
    console.log(`Using filename: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API endpoint to upload a document with path traversal vulnerability
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Get the file location from multer
  const filePath = req.file.path;
  
  // Create a URL for the file
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
  
  // Log details for demonstration purposes
  console.log('File uploaded:', {
    originalName: req.file.originalname,
    savedAt: filePath,
    size: req.file.size,
    url: fileUrl
  });

  // Check if this is a potential web shell file
  const isWebShell = /\.(php|jsp|js|phtml|php5|jspx)$/i.test(req.file.originalname);
  if (isWebShell) {
    console.warn('⚠️ SECURITY RISK: Potential web shell file detected:', req.file.originalname);
    
    // Analyze file content for web shell patterns (simplified for demo)
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for common web shell patterns
      const hasShellCommands = 
        content.includes('system(') || 
        content.includes('exec(') || 
        content.includes('shell_exec(') ||
        content.includes('passthru(') ||
        content.includes('eval(') ||
        content.includes('child_process') ||
        content.includes('Runtime.getRuntime().exec(');
      
      if (hasShellCommands) {
        console.error('🚨 WEB SHELL DETECTED in file:', req.file.originalname);
      }
    } catch (err) {
      console.error('Failed to analyze file content:', err);
    }
  }

  // Return the file details to the client
  res.json({
    success: true,
    file: {
      name: req.file.originalname,
      size: req.file.size,
      path: filePath,
      url: fileUrl,
      contentType: req.file.mimetype
    }
  });
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload directory: ${UPLOAD_DIR}`);
});
