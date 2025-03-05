
import { DocumentUploadResponse } from "./types";
import { handleWebShellUpload } from "./webShellService";

// Simulate an upload directory
const UPLOAD_DIR = './public/uploads';

// In-memory storage to simulate file system
const simulatedFileSystem = new Map();

/**
 * Handles document uploads and file upload vulnerability demonstrations
 * Simulates saving files to the filesystem in the public directory
 */
export const uploadDocument = async (file: File, uploadUrl: string): Promise<DocumentUploadResponse> => {
  try {
    // SECURITY VULNERABILITY: No sanitization of filename
    // This allows path traversal attacks
    const filename = file.name;
    
    // Define the absolute file path where file would be saved
    // SECURITY VULNERABILITY: Not properly sanitizing file paths
    const filePath = UPLOAD_DIR + '/' + filename;
    
    // Generate a real accessible URL for the file
    const baseUrl = window.location.origin;
    const fileUrl = `${baseUrl}/uploads/${filename}`;
    
    console.log(`Simulating saving file to disk at: ${filePath}`);
    console.log(`File would be accessible at: ${fileUrl}`);
    
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
    
    // Simulate saving the file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Store in our simulated file system
    simulatedFileSystem.set(filePath, buffer);
    console.log(`Successfully simulated saving file to: ${filePath}`);
    
    // For images and PDFs, read as base64 data to return in the response
    const contentType = file.type || 'application/octet-stream';
    if (contentType.includes('image') || contentType.includes('pdf')) {
      // Convert buffer to base64
      const base64 = arrayBufferToBase64(arrayBuffer);
      return {
        content: `data:${contentType};base64,${base64}`,
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

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
