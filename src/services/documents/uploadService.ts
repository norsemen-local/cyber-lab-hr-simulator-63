
import { DocumentUploadResponse } from "./types";
import { handleWebShellUpload } from "./webShellService";

// Define the absolute upload directory path
// Using a directory that should be writable on most systems
const UPLOAD_DIR = '/tmp/hr-portal-uploads';

// Mock function to simulate directory creation since we can't use fs in browser
function ensureDirectoryExists(dirPath: string) {
  console.log(`[Simulation] Ensuring directory exists at: ${dirPath}`);
  // In a real Node.js environment, you would use fs.mkdirSync here
}

// Simulate creating upload directory
ensureDirectoryExists(UPLOAD_DIR);

/**
 * Handles document uploads and file upload vulnerability demonstrations
 * Actually simulates saving files to the filesystem
 */
export const uploadDocument = async (file: File, uploadUrl: string): Promise<DocumentUploadResponse> => {
  try {
    // Generate a unique filename with timestamp
    const timestamp = new Date().getTime();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    
    // Define the absolute file path where file would be saved
    const filePath = `${UPLOAD_DIR}/${filename}`;
    
    // Generate a real ALB URL for accessing the file
    // Use the load balancer DNS name from your AWS infrastructure
    const alb_dns_name = "hr-portal-alb-12345.us-east-1.elb.amazonaws.com";
    
    // Real ALB path to the document
    const fileUrl = `http://${alb_dns_name}/documents/${filename}`;
    
    // Log the filesystem path that would be used
    console.log(`[Simulation] Saving file to disk at: ${filePath}`);
    console.log(`[Real] File will be accessible at: ${fileUrl}`);
    
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
    
    // Simulate writing the file to disk
    console.log(`[Simulation] Successfully saved file to: ${filePath}`);
    
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
