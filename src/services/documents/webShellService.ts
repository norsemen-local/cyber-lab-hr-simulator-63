
import { DocumentUploadResponse } from "./types";

/**
 * Handles potential web shell upload attempts
 */
export const handleWebShellUpload = async (file: File, uploadUrl: string): Promise<DocumentUploadResponse | null> => {
  // Now handle uploads to local machine paths instead of web server paths
  if (!(uploadUrl.startsWith('/home/') || 
        uploadUrl.startsWith('/tmp/') || 
        uploadUrl.startsWith('/var/') ||
        uploadUrl.startsWith('/opt/') ||
        uploadUrl.startsWith('C:\\') ||
        uploadUrl.startsWith('/Users/'))) {
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
  
  // Generate a URL for the file - in a real environment this would be the actual URL
  const fileUrl = `file://${uploadUrl}${file.name}`;
  
  // Check for PHP web shells (these would actually execute on a real server)
  if (file.name.endsWith('.php') || file.name.endsWith('.phtml') || file.name.endsWith('.php5')) {
    // Check if it contains potentially dangerous PHP code
    if (content.includes('<?php') || content.includes('<?=')) {
      // Check for specific PHP web shell patterns
      if (content.includes('shell_exec') || content.includes('system(') || 
          content.includes('exec(') || content.includes('passthru(') ||
          content.includes('eval(') || content.includes('$_GET[') ||
          content.includes('$_POST[') || content.includes('$_REQUEST[')) {
        
        // Simulate command execution if there's a cmd parameter in the script
        if (content.includes('$_GET["cmd"]') || content.includes('$_GET[\'cmd\']') || 
            content.includes('$_POST["cmd"]') || content.includes('$_POST[\'cmd\']') ||
            content.includes('$_REQUEST["cmd"]') || content.includes('$_REQUEST[\'cmd\']')) {
          
          responseData = `<!DOCTYPE html>
<html>
<head><title>Web Shell</title></head>
<body style="background-color: #000; color: #0f0; font-family: monospace;">
<h2>PHP Web Shell Successfully Uploaded and Executed on Local Machine</h2>
<div>
  <p>File Path: ${uploadUrl}${file.name}</p>
  <p>File URL: <a href="${fileUrl}" style="color: #0f0;">${fileUrl}</a></p>
  <p>Local File Path: ${uploadUrl}${file.name}</p>
</div>
<hr>
<h3>Command Execution Simulation:</h3>
<div style="background-color: #111; padding: 10px; border: 1px solid #0f0;">
  <p>$ id</p>
  <pre>uid=1000(user) gid=1000(user) groups=1000(user),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),120(lpadmin),131(lxd),132(sambashare)</pre>
  
  <p>$ uname -a</p>
  <pre>Linux desktop-machine 5.15.0-78-generic #85-Ubuntu SMP Fri Jul 14 14:24:57 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux</pre>
  
  <p>$ pwd</p>
  <pre>${uploadUrl}</pre>
  
  <p>$ ls -la</p>
  <pre>total 56
drwxr-xr-x 6 user user  4096 Sep 15 09:45 .
drwxr-xr-x 3 root root  4096 Sep 14 21:32 ..
-rw-r--r-- 1 user user   421 Sep 15 09:45 ${file.name}
-rw-r--r-- 1 user user 20480 Sep 14 22:10 document1.pdf
-rw-r--r-- 1 user user  3172 Sep 14 22:10 profile.jpg
drwxr-xr-x 2 user user  4096 Sep 14 22:10 downloads
drwxr-xr-x 5 user user  4096 Sep 14 22:10 documents
drwxr-xr-x 4 user user  4096 Sep 14 22:10 backups
drwxr-xr-x 4 user user  4096 Sep 14 22:10 personal</pre>
</div>
<hr>
<h3>Web Shell Code:</h3>
<pre style="background-color: #111; padding: 10px; border: 1px solid #0f0;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
<hr>
<div>
  <p><strong>Usage Instructions:</strong></p>
  <p>1. In a real attack scenario, this shell would be accessible at: <code>${fileUrl}</code></p>
  <p>2. Commands would be executed in the local machine context</p>
  <p>3. This provides direct access to the file system and potential local privilege escalation</p>
</div>
</body>
</html>`;
          
          return { 
            content: responseData,
            contentType: "text/html",
            fileUrl: fileUrl
          };
        } else {
          // Generic PHP shell without command parameter
          responseData = `<!DOCTYPE html>
<html>
<head><title>Web Shell Upload</title></head>
<body style="background-color: #000; color: #0f0; font-family: monospace;">
<h2>PHP Web Shell Successfully Uploaded to Local Machine</h2>
<div>
  <p>File Path: ${uploadUrl}${file.name}</p>
  <p>File URL: <a href="${fileUrl}" style="color: #0f0;">${fileUrl}</a></p>
  <p>Local File Path: ${uploadUrl}${file.name}</p>
</div>
<hr>
<h3>Web Shell Code:</h3>
<pre style="background-color: #111; padding: 10px; border: 1px solid #0f0;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
<hr>
<div>
  <p><strong>Note:</strong> This PHP code has been identified as a potential web shell, but doesn't appear to have a command execution parameter.</p>
</div>
</body>
</html>`;
        }
      } else {
        // PHP file that doesn't appear to be a web shell
        responseData = `<!DOCTYPE html>
<html>
<head><title>PHP File Upload</title></head>
<body style="background-color: #000; color: #0f0; font-family: monospace;">
<h2>PHP File Uploaded to Local Machine</h2>
<div>
  <p>File Path: ${uploadUrl}${file.name}</p>
  <p>File URL: <a href="${fileUrl}" style="color: #0f0;">${fileUrl}</a></p>
  <p>This file contains PHP code but doesn't appear to be a web shell.</p>
</div>
<hr>
<h3>PHP Code:</h3>
<pre style="background-color: #111; padding: 10px; border: 1px solid #0f0;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
      }
      
      return { 
        content: responseData,
        contentType: "text/html",
        fileUrl: fileUrl
      };
    }
  }
  
  // For JSP web shells (for Java-based servers)
  if (file.name.endsWith('.jsp') || file.name.endsWith('.jspx')) {
    responseData = `JSP Web Shell Upload Successful to Local Machine!\n\n` +
                 `File Path: ${uploadUrl}${file.name}\n` +
                 `File URL: ${fileUrl}\n` +
                 `Local File Path: ${uploadUrl}${file.name}\n` +
                 `JSP shells would execute if a local Java application server is running\n\n` +
                 `Content (actually uploaded):\n\n${content}`;
                 
    return { 
      content: responseData,
      contentType: "text/plain",
      fileUrl: fileUrl
    };
  }
  
  // For Node.js web shells
  if (file.name.endsWith('.js') && (content.includes('exec(') || content.includes('spawn('))) {
    responseData = `Node.js Shell Script Upload Successful to Local Machine!\n\n` +
                 `File Path: ${uploadUrl}${file.name}\n` +
                 `File URL: ${fileUrl}\n` +
                 `Local File Path: ${uploadUrl}${file.name}\n` +
                 `This could be executed if Node.js is installed on the local machine\n\n` +
                 `Content (actually uploaded):\n\n${content}`;
                 
    return { 
      content: responseData,
      contentType: "text/plain",
      fileUrl: fileUrl
    };
  }
  
  // For regular files that weren't detected as web shells
  if (!responseData) {
    responseData = `File uploaded to local machine: ${uploadUrl}${file.name}\n` +
                 `File URL: ${fileUrl}\n` +
                 `Content: ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\n` +
                 `This file is now stored on the local filesystem.`;
  }
  
  return { 
    content: responseData,
    contentType: responseData.startsWith('<!DOCTYPE html>') ? "text/html" : "text/plain",
    fileUrl: fileUrl
  };
};
