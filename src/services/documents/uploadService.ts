
import { DocumentUploadResponse } from "./types";
import { handleWebShellUpload } from "./webShellService";

// Define the backend server URL
// In production, this would come from environment variables
const API_URL = 'http://localhost:3000'; // Default to localhost for development

/**
 * Handles document uploads and file upload vulnerability demonstrations
 * Demonstrates path traversal vulnerability in file downloads
 */
export const uploadDocument = async (file: File, uploadUrl: string): Promise<DocumentUploadResponse> => {
  try {
    // SECURITY VULNERABILITY: No sanitization of filename
    // This allows path traversal attacks
    const filename = file.name;
    
    // Create form data for the file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // SECURITY VULNERABILITY: Path traversal in upload path
    // This allows an attacker to specify any directory on the server
    const uploadPath = '../' + (uploadUrl.replace('https://', '').replace('http://', ''));
    formData.append('uploadPath', uploadPath);
    
    console.log(`Attempting to upload to path: ${uploadPath}`);
    
    // Check if this is a potential web shell upload
    if (file.name.endsWith('.php') || file.name.endsWith('.jsp') || 
        file.name.endsWith('.js') || file.name.endsWith('.phtml') || 
        file.name.endsWith('.php5') || file.name.endsWith('.jspx')) {
      
      console.warn('⚠️ SECURITY RISK: Potential web shell file detected:', file.name);
      
      // Process web shell uploads
      const webShellResponse = await handleWebShellUpload(file, uploadUrl, uploadPath);
      if (webShellResponse) {
        return webShellResponse;
      }
    }
    
    try {
      // Upload the file to our server
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Upload response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      // For images and PDFs, fetch the file content to display in the preview
      const contentType = file.type || 'application/octet-stream';
      if (contentType.includes('image') || contentType.includes('pdf')) {
        // Convert file to base64
        const blob = await file.arrayBuffer();
        const base64 = arrayBufferToBase64(blob);
        
        return {
          content: `data:${contentType};base64,${base64}`,
          contentType,
          fileUrl: data.file.url,
          savedAt: data.file.path
        };
      }
      
      // For text files and other file types, read as text
      const content = await file.text();
      return { 
        content,
        contentType: file.type || 'application/octet-stream',
        fileUrl: data.file.url,
        savedAt: data.file.path
      };
    } catch (error) {
      console.error('Error with server upload:', error);
      
      // Fall back to client-side simulation if server upload fails
      console.log('Falling back to client-side simulation...');
      
      // Create a blob from the file
      const blob = await file.arrayBuffer();
      
      // Download the file with the potentially malicious filename (with path traversal)
      const url = URL.createObjectURL(new Blob([blob]));
      
      // Create a download link and trigger it to save with the original filename
      // VULNERABILITY: This preserves the path traversal in the filename
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // The vulnerable part - using unsanitized filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`File ${filename} has been prepared for download`);
      
      // Generate simulated response with client-side data
      const filePath = uploadPath + '/' + filename;
      const fileUrl = `${window.location.origin}/uploads/${filename}`;
      const fileContentType = file.type || 'application/octet-stream';
      
      // For images and PDFs, read as base64 data for the response
      if (fileContentType.includes('image') || fileContentType.includes('pdf')) {
        // Convert blob to base64
        const base64 = arrayBufferToBase64(blob);
        return {
          content: `data:${fileContentType};base64,${base64}`,
          contentType: fileContentType,
          fileUrl,
          savedAt: filePath
        };
      }
      
      // For text files and other file types, read as text
      const content = await file.text();
      return { 
        content,
        contentType: fileContentType,
        fileUrl,
        savedAt: filePath
      };
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
