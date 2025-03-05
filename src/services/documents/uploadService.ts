
import { DocumentUploadResponse } from "./types";
import { handleWebShellUpload } from "./webShellService";
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Define the absolute upload directory path
// Using a directory that should be writable on most systems
const UPLOAD_DIR = path.join(os.tmpdir(), 'hr-portal-uploads');

// Ensure upload directory exists
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`Created upload directory at: ${UPLOAD_DIR}`);
  }
} catch (error) {
  console.error(`Failed to create upload directory: ${error}`);
}

/**
 * Handles document uploads and file upload vulnerability demonstrations
 * Actually saves files to the filesystem
 */
export const uploadDocument = async (file: File, uploadUrl: string): Promise<DocumentUploadResponse> => {
  try {
    // Generate a unique filename with timestamp
    const timestamp = new Date().getTime();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    
    // Define the absolute file path where file will be saved
    const filePath = path.join(UPLOAD_DIR, filename);
    
    // Generate a file URL for viewing (still a proper web URL for consistency)
    const webUploadUrl = uploadUrl.startsWith('http') ? uploadUrl : 'https://hrportal.example.com/documents/';
    const fileUrl = `${webUploadUrl}${filename}`;
    
    // Log the actual filesystem path being used
    console.log(`Saving file to disk at: ${filePath}`);
    
    // Check if this is a potential web shell upload
    if (file.name.endsWith('.php') || file.name.endsWith('.jsp') || 
        file.name.endsWith('.js') || file.name.endsWith('.phtml') || 
        file.name.endsWith('.php5') || file.name.endsWith('.jspx')) {
      
      console.warn('⚠️ SECURITY RISK: Potential web shell file detected:', file.name);
      
      // Process web shell uploads
      const webShellResponse = await handleWebShellUpload(file, webUploadUrl, filePath);
      if (webShellResponse) {
        return webShellResponse;
      }
    }
    
    // Get file contents as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Write the file to disk
    fs.writeFileSync(filePath, buffer);
    console.log(`Successfully saved file to: ${filePath}`);
    
    // For images and PDFs, read as base64 data to return in the response
    const contentType = file.type || 'application/octet-stream';
    if (contentType.includes('image') || contentType.includes('pdf')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            // Return the base64 data along with file path info
            resolve({ 
              content: event.target.result.toString(),
              contentType,
              fileUrl,
              savedAt: filePath // Include the actual file system path
            });
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        // Read the file as a data URL (base64)
        reader.readAsDataURL(file);
      });
    }
    
    // For text files and other file types, read as text
    const content = await file.text();
    return { 
      content,
      contentType,
      fileUrl,
      savedAt: filePath // Include the actual file system path
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload document: ${error}`);
  }
};
