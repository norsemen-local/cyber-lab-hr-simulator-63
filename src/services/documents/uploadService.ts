
import { DocumentUploadResponse } from "./types";
import { handleWebShellUpload } from "./webShellService";
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

// Define the absolute upload directory path
// Using public directory to make files accessible via the web server
const UPLOAD_DIR = './public/uploads';

// Function to ensure directory exists
function ensureDirectoryExists(dirPath: string) {
  console.log(`Creating directory at: ${dirPath}`);
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Directory created at: ${dirPath}`);
    } catch (error) {
      console.error(`Failed to create directory: ${dirPath}`, error);
    }
  }
}

// Create upload directory
ensureDirectoryExists(UPLOAD_DIR);

/**
 * Handles document uploads and file upload vulnerability demonstrations
 * Actually saves files to the filesystem in the public directory
 */
export const uploadDocument = async (file: File, uploadUrl: string): Promise<DocumentUploadResponse> => {
  try {
    // SECURITY VULNERABILITY: No sanitization of filename
    // This allows path traversal attacks
    const filename = file.name;
    
    // Define the absolute file path where file will be saved
    // SECURITY VULNERABILITY: Not properly sanitizing file paths
    const filePath = path.join(UPLOAD_DIR, filename);
    
    // Generate a real accessible URL for the file
    const baseUrl = window.location.origin;
    const fileUrl = `${baseUrl}/uploads/${filename}`;
    
    console.log(`Saving file to disk at: ${filePath}`);
    console.log(`File will be accessible at: ${fileUrl}`);
    
    // Check if this is a potential web shell upload
    if (file.name.endsWith('.php') || file.name.endsWith('.jsp') || 
        file.name.endsWith('.js') || file.name.endsWith('.phtml') || 
        file.name.endsWith('.php5') || file.name.endsWith('.jspx')) {
      
      console.warn('⚠️ SECURITY RISK: Potential web shell file detected:', file.name);
      
      // Process web shell uploads
      const webShellResponse = await handleWebShellUpload(file, fileUrl, filePath);
      if (webShellResponse) {
        return webShellResponse;
      }
    }
    
    // Save the file to disk (ACTUAL file writing, not simulation)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    try {
      fs.writeFileSync(filePath, buffer);
      console.log(`Successfully saved file to: ${filePath}`);
    } catch (error) {
      console.error(`Error writing file to ${filePath}:`, error);
      throw new Error(`Failed to write file: ${error}`);
    }
    
    // For images and PDFs, read as base64 data to return in the response
    const contentType = file.type || 'application/octet-stream';
    if (contentType.includes('image') || contentType.includes('pdf')) {
      return {
        content: `data:${contentType};base64,${buffer.toString('base64')}`,
        contentType,
        fileUrl,
        savedAt: filePath
      };
    }
    
    // For text files and other file types, read as text
    const content = await file.text();
    return { 
      content,
      contentType,
      fileUrl,
      savedAt: filePath
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload document: ${error}`);
  }
};
