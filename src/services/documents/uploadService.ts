
import { DocumentUploadResponse } from "./types";
import { handleWebShellUpload } from "./webShellService";

/**
 * Handles document uploads and file upload vulnerability demonstrations
 */
export const uploadDocument = async (file: File, uploadUrl: string): Promise<DocumentUploadResponse> => {
  try {
    // Ensure the uploadUrl is a web URL, not a file path
    let webUploadUrl = uploadUrl;
    if (!uploadUrl.startsWith('http')) {
      // Convert to a web URL if given a local path
      webUploadUrl = 'https://hrportal.example.com/documents/';
      console.warn('Converting local path to web URL for security demonstration purposes');
    }
    
    // Generate a file URL for viewing (always a proper web URL)
    const timestamp = new Date().getTime();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    const fileUrl = `${webUploadUrl}${filename}`;
    
    // Check if this is a potential web shell upload
    if (file.name.endsWith('.php') || file.name.endsWith('.jsp') || 
        file.name.endsWith('.js') || file.name.endsWith('.phtml') || 
        file.name.endsWith('.php5') || file.name.endsWith('.jspx')) {
      
      console.warn('⚠️ SECURITY RISK: Potential web shell file detected:', file.name);
      
      // Check for web shell uploads targeting the local machine
      const webShellResponse = await handleWebShellUpload(file, webUploadUrl);
      if (webShellResponse) {
        return webShellResponse;
      }
    }
    
    // For regular file uploads, handle different file types appropriately
    const contentType = file.type || 'application/octet-stream';
    
    // For images and PDFs, read as base64 data
    if (contentType.includes('image') || contentType.includes('pdf')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            // Return the base64 data
            resolve({ 
              content: event.target.result.toString(),
              contentType,
              fileUrl
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
      fileUrl
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload document');
  }
};
