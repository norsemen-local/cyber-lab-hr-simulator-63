
import { DocumentUploadResponse } from "./types";

/**
 * Handles potential web shell upload attempts
 */
export const handleWebShellUpload = async (file: File, uploadUrl: string): Promise<DocumentUploadResponse | null> => {
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
<h2>PHP Web Shell Successfully Uploaded and Executed</h2>
<div>
  <p>File Path: ${uploadUrl}${file.name}</p>
  <p>Access URL: http://example.com/${file.name}</p>
</div>
<hr>
<h3>Command Execution Simulation:</h3>
<div style="background-color: #111; padding: 10px; border: 1px solid #0f0;">
  <p>$ id</p>
  <pre>uid=33(www-data) gid=33(www-data) groups=33(www-data)</pre>
  
  <p>$ uname -a</p>
  <pre>Linux web-server 5.15.0-1015-aws #19-Ubuntu SMP Fri Jan 6 23:04:05 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux</pre>
  
  <p>$ pwd</p>
  <pre>${uploadUrl}</pre>
  
  <p>$ ls -la</p>
  <pre>total 56
drwxr-xr-x 6 www-data www-data  4096 Mar 5 09:45 .
drwxr-xr-x 3 root     root      4096 Mar 4 21:32 ..
-rw-r--r-- 1 www-data www-data   421 Mar 5 09:45 ${file.name}
-rw-r--r-- 1 www-data www-data 20480 Mar 4 22:10 index.php
-rw-r--r-- 1 www-data www-data  3172 Mar 4 22:10 config.php
drwxr-xr-x 2 www-data www-data  4096 Mar 4 22:10 uploads
drwxr-xr-x 5 www-data www-data  4096 Mar 4 22:10 images
drwxr-xr-x 4 www-data www-data  4096 Mar 4 22:10 js
drwxr-xr-x 4 www-data www-data  4096 Mar 4 22:10 css</pre>
</div>
<hr>
<h3>Web Shell Code:</h3>
<pre style="background-color: #111; padding: 10px; border: 1px solid #0f0;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
<hr>
<div>
  <p><strong>Usage Instructions:</strong></p>
  <p>1. In a real attack scenario, this shell would be accessible at: <code>http://server-ip/${file.name}</code></p>
  <p>2. Commands could be executed via: <code>http://server-ip/${file.name}?cmd=ls%20-la</code></p>
  <p>3. Other useful commands: <code>whoami</code>, <code>id</code>, <code>cat /etc/passwd</code>, <code>uname -a</code></p>
</div>
</body>
</html>`;
          
          return { 
            content: responseData,
            contentType: "text/html"
          };
        } else {
          // Generic PHP shell without command parameter
          responseData = `<!DOCTYPE html>
<html>
<head><title>Web Shell Upload</title></head>
<body style="background-color: #000; color: #0f0; font-family: monospace;">
<h2>PHP Web Shell Successfully Uploaded</h2>
<div>
  <p>File Path: ${uploadUrl}${file.name}</p>
  <p>Access URL: http://example.com/${file.name}</p>
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
<h2>PHP File Uploaded</h2>
<div>
  <p>File Path: ${uploadUrl}${file.name}</p>
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
        contentType: "text/html"
      };
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
    contentType: responseData.startsWith('<!DOCTYPE html>') ? "text/html" : "text/plain"
  };
};
