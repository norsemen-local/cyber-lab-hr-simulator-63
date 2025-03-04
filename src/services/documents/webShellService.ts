
import { DocumentUploadResponse } from "./types";

/**
 * Handles potential web shell upload attempts for educational purposes
 */
export const handleWebShellUpload = (file: File, uploadUrl: string): DocumentUploadResponse | null => {
  // Only handle uploads to web server paths
  if (!(uploadUrl.startsWith('/var/www/html/') || 
      (uploadUrl.startsWith('/') && uploadUrl.includes('www')) ||
      uploadUrl.includes('public_html'))) {
    return null;
  }
  
  return processWebShellUpload(file, uploadUrl);
};

/**
 * Processes potential web shell uploads and returns appropriate responses
 */
const processWebShellUpload = async (file: File, uploadUrl: string): Promise<DocumentUploadResponse> => {
  // Read file content
  const content = await file.text();
  let responseData = "";
  
  // Check for PHP web shells (these would actually execute on a real server)
  if (file.name.endsWith('.php') || file.name.endsWith('.phtml') || file.name.endsWith('.php5')) {
    // Check if it contains potentially dangerous PHP code
    if (content.includes('<?php') || content.includes('<?=') || 
        content.includes('shell_exec') || content.includes('system(') || 
        content.includes('exec(') || content.includes('passthru(')) {
      
      responseData = `Web Shell Upload Successful!\n\n` +
                   `File Path: ${uploadUrl}${file.name}\n` +
                   `Access URL: http://example.com/${file.name}\n\n` +
                   `Content (actually uploaded):\n\n${content}\n\n` +
                   `This shell would be accessible at: http://server-ip/${file.name}\n\n` +
                   `To exploit this shell:\n` +
                   `1. Visit http://server-ip/${file.name}?cmd=ls%20-la to list files\n` +
                   `2. Use http://server-ip/${file.name}?cmd=cat%20/etc/passwd to read files\n` +
                   `3. Other commands: whoami, id, uname -a, etc.`;
    }
  }
  
  // For JSP web shells (for Java-based servers)
  if (file.name.endsWith('.jsp') || file.name.endsWith('.jspx')) {
    responseData = `JSP Web Shell Upload Successful!\n\n` +
                 `File Path: ${uploadUrl}${file.name}\n` +
                 `JSP shells would execute on Java-based servers like Tomcat, JBoss, etc.\n\n` +
                 `Content (actually uploaded):\n\n${content}`;
  }
  
  // For Node.js web shells
  if (file.name.endsWith('.js') && (content.includes('exec(') || content.includes('spawn('))) {
    responseData = `Node.js Shell Script Upload Successful!\n\n` +
                 `File Path: ${uploadUrl}${file.name}\n` +
                 `This could be executed server-side if the server runs Node.js and has a vulnerable require/import\n\n` +
                 `Content (actually uploaded):\n\n${content}`;
  }
  
  // For regular files that weren't detected as web shells
  if (!responseData) {
    responseData = `File uploaded to web server: ${uploadUrl}${file.name}\n` +
                 `Content: ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\n` +
                 `This file would be accessible through the web server.`;
  }
  
  return { 
    content: responseData,
    contentType: "text/plain"
  };
};
