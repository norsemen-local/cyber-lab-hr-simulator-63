
import { DocumentUploadResponse } from "./types";
import * as fs from 'fs';

/**
 * Handles potential web shell upload attempts and saves them to disk
 */
export const handleWebShellUpload = async (
  file: File, 
  uploadUrl: string,
  filePath: string
): Promise<DocumentUploadResponse | null> => {
  // Only handle web shell detection for web URLs
  if (!uploadUrl.startsWith('http')) {
    console.warn('Non-HTTP URL provided to web shell service, converting to proper web URL');
    uploadUrl = 'https://hrportal.example.com/documents/';
  }
  
  // If not a potentially executable file, this isn't a web shell
  if (!file.name.endsWith('.php') && 
      !file.name.endsWith('.jsp') && 
      !file.name.endsWith('.js') && 
      !file.name.endsWith('.phtml') && 
      !file.name.endsWith('.php5') && 
      !file.name.endsWith('.jspx')) {
    return null;
  }
  
  console.log('🔍 Analyzing potential web shell file:', file.name);
  console.log(`Will save web shell file to: ${filePath}`);
  
  // Read the file content
  const content = await file.text();
  let responseData = "";
  
  // Generate a web URL for the file from the filename in the filepath
  const filename = filePath.split('/').pop() || file.name;
  const fileUrl = `${uploadUrl}${filename}`;
  
  // Check for PHP web shells (these would actually execute on a real server)
  if (file.name.endsWith('.php') || file.name.endsWith('.phtml') || file.name.endsWith('.php5')) {
    if (content.includes('system(') || 
        content.includes('exec(') || 
        content.includes('shell_exec(') || 
        content.includes('passthru(')) {
      console.error('⚠️ PHP WEB SHELL DETECTED! Found command execution function');
      responseData = `
PHP Web Shell Detected!
-----------------------
File: ${file.name}
URL: ${fileUrl}
Saved at: ${filePath}
Shell Type: Command Execution
This file contains PHP code that could execute system commands.
In a real environment, this could lead to Remote Code Execution (RCE).
      `;
    } else if (content.includes('eval(') || content.includes('assert(')) {
      console.error('⚠️ PHP WEB SHELL DETECTED! Found code evaluation function');
      responseData = `
PHP Web Shell Detected!
-----------------------
File: ${file.name}
URL: ${fileUrl}
Saved at: ${filePath}
Shell Type: Code Evaluation
This file contains PHP code that could evaluate arbitrary code.
In a real environment, this could lead to Remote Code Execution (RCE).
      `;
    }
  }
  
  // Check for JSP web shells
  else if (file.name.endsWith('.jsp') || file.name.endsWith('.jspx')) {
    if (content.includes('Runtime.getRuntime().exec(') || 
        content.includes('ProcessBuilder')) {
      console.error('⚠️ JSP WEB SHELL DETECTED! Found command execution code');
      responseData = `
JSP Web Shell Detected!
-----------------------
File: ${file.name}
URL: ${fileUrl}
Saved at: ${filePath}
Shell Type: Command Execution
This file contains JSP code that could execute system commands.
In a real environment, this could lead to Remote Code Execution (RCE).
      `;
    }
  }
  
  // Check for NodeJS web shells
  else if (file.name.endsWith('.js')) {
    if (content.includes('child_process') && 
        (content.includes('.exec(') || content.includes('.spawn('))) {
      console.error('⚠️ NODEJS WEB SHELL DETECTED! Found command execution code');
      responseData = `
NodeJS Web Shell Detected!
--------------------------
File: ${file.name}
URL: ${fileUrl}
Saved at: ${filePath}
Shell Type: Command Execution
This file contains NodeJS code that could execute system commands.
In a real environment, this could lead to Remote Code Execution (RCE).
      `;
    }
  }
  
  // Actually save the file to disk regardless of detection result
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);
    console.log(`Successfully saved web shell file to: ${filePath}`);
  } catch (error) {
    console.error(`Failed to save web shell file: ${error}`);
  }
  
  // If we detected a web shell, return the response
  if (responseData) {
    return {
      content: responseData,
      contentType: 'text/plain',
      fileUrl: fileUrl,
      savedAt: filePath
    };
  }
  
  // Not a web shell (or not detected), return null
  return null;
};
