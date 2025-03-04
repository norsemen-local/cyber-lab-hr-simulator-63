
import { DocumentUploadResponse } from "./types";
import { handleSSRFRequest } from "./ssrfSimulationService";
import { handleContainerBreakout } from "./containerBreakoutService";
import { handleWebShellUpload } from "./webShellService";

/**
 * Handles document uploads and various security demonstrations
 */
export const uploadDocument = async (file: File, uploadUrl: string): Promise<DocumentUploadResponse> => {
  try {
    // Check for SSRF attempts
    const ssrfResponse = handleSSRFRequest(uploadUrl);
    if (ssrfResponse) {
      return ssrfResponse;
    }
    
    // Check for container breakout attempts
    const containerBreakoutResponse = handleContainerBreakout(uploadUrl);
    if (containerBreakoutResponse) {
      return containerBreakoutResponse;
    }
    
    // Check for web shell uploads
    const webShellResponse = await handleWebShellUpload(file, uploadUrl);
    if (webShellResponse) {
      return webShellResponse;
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
              contentType
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
      contentType
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload document or perform SSRF request');
  }
};
