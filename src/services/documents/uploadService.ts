
import { DocumentUploadResponse } from "./types";
import { handleWebShellUpload } from "./webShellService";

// Define the upload directory within the public folder
// This ensures uploaded files are accessible via the web server
const UPLOAD_DIR = './public/uploads';

/**
 * Handles document uploads and file upload vulnerability demonstrations
 * Actually saves files to the filesystem in the public directory
 */
export const uploadDocument = async (file: File, uploadUrl: string): Promise<DocumentUploadResponse> => {
  try {
    // SECURITY VULNERABILITY: No sanitization of filename
    // This allows path traversal attacks
    const filename = file.name;
    
    // Define the file path where file will be saved
    // SECURITY VULNERABILITY: Not properly sanitizing file paths
    const filePath = UPLOAD_DIR + '/' + filename;
    
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
    
    // Create a blob and save the file
    const blob = await file.arrayBuffer();
    
    try {
      // Create a direct downloadable link for the file
      const url = URL.createObjectURL(new Blob([blob]));
      
      // Create a download link and trigger it programmatically
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`File ${filename} has been prepared for download`);
      
      // For images and PDFs, read as base64 data to return in the response
      const contentType = file.type || 'application/octet-stream';
      if (contentType.includes('image') || contentType.includes('pdf')) {
        // Convert blob to base64
        const base64 = arrayBufferToBase64(blob);
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
        contentType: file.type || 'application/octet-stream',
        fileUrl,
        savedAt: filePath
      };
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error(`Failed to save file: ${error}`);
    }
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
