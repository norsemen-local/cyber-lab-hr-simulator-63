
// API Gateway base URL would typically come from environment variables
const API_GATEWAY_URL = "https://api-gateway-endpoint.execute-api.region.amazonaws.com/prod";

export interface DocumentMetadata {
  id: number;
  name: string;
  date: string;
  size: string;
}

export const uploadDocument = async (file: File, uploadUrl: string): Promise<{ content: string; contentType: string }> => {
  try {
    // For SSRF exploitation attempts - perform real HTTP requests
    if (uploadUrl.startsWith('http')) {
      console.log("Making real SSRF request to:", uploadUrl);
      
      try {
        // Make a real fetch request to the specified URL
        // This will attempt to access internal resources via SSRF
        const response = await fetch(uploadUrl, {
          method: 'GET',
          mode: 'no-cors' // This allows requests to any origin
        });
        
        // Try to get the response as text
        const text = await response.text().catch(() => "Response could not be read as text");
        
        // For EC2 metadata simulation (since we can't actually access real EC2 metadata in a browser)
        if (uploadUrl.includes("169.254.169.254")) {
          // Simulate EC2 metadata response
          if (uploadUrl.includes("/latest/meta-data/")) {
            // Return mock EC2 metadata based on the path
            if (uploadUrl.endsWith("/latest/meta-data/")) {
              return {
                content: "ami-id\nami-launch-index\nami-manifest-path\nblock-device-mapping/\nhostname\niam/\ninstance-action\ninstance-id\ninstance-type\nlocal-hostname\nlocal-ipv4\nmac\nmetrics/\nnetwork/\nplacement/\nprofile\npublic-hostname\npublic-ipv4\npublic-keys/\nreservation-id\nsecurity-groups\nservices/",
                contentType: "text/plain"
              };
            } else if (uploadUrl.includes("/latest/meta-data/iam/")) {
              // Return IAM information
              if (uploadUrl.endsWith("/latest/meta-data/iam/security-credentials/")) {
                return {
                  content: "hr-portal-ec2-role",
                  contentType: "text/plain"
                };
              } else if (uploadUrl.includes("/latest/meta-data/iam/security-credentials/hr-portal-ec2-role")) {
                // Return mock AWS credentials
                return {
                  content: JSON.stringify({
                    "Code": "Success",
                    "LastUpdated": "2023-10-15T15:25:22Z",
                    "Type": "AWS-HMAC",
                    "AccessKeyId": "ASIA1234567890EXAMPLE",
                    "SecretAccessKey": "secretkey0987654321examplekeyhere",
                    "Token": "IQoJb3JpZ2luX2VjEJr...truncated-for-security",
                    "Expiration": "2023-10-15T21:25:22Z"
                  }, null, 2),
                  contentType: "application/json"
                };
              }
            }
          }
        }
        
        // Return the actual response from the fetch request
        return {
          content: text || JSON.stringify(response, null, 2),
          contentType: response.headers.get('content-type') || "text/plain"
        };
      } catch (error) {
        // If the real request fails, return the error details
        return {
          content: `SSRF Request Failed: ${error instanceof Error ? error.message : String(error)}\n\nThis is typically expected when making cross-origin requests from a browser. In a real server-side scenario, this SSRF attempt could potentially succeed.\n\nReal attackers would execute this SSRF from the server, not the browser.`,
          contentType: "text/plain"
        };
      }
    }
    
    // For file:/// URL schemes (direct file read attempts)
    if (uploadUrl.startsWith('file:///')) {
      const filePath = uploadUrl.replace('file://', '');
      return {
        content: `Attempted to read local file: ${filePath}\n\nIn a vulnerable application, this would return the contents of the file.\n\nNote: Browser security prevents this from working client-side, but server-side SSRF could allow this.`,
        contentType: "text/plain"
      };
    }
    
    // For container breakout attempts accessing /proc
    if (uploadUrl.startsWith('/proc/')) {
      let responseContent = "";
      
      if (uploadUrl.includes('/proc/self/environ')) {
        responseContent = `HOSTNAME=container-id\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nNODE_VERSION=18.16.0\nYARN_VERSION=1.22.19\nHOME=/root\nTERM=xterm\nLANG=C.UTF-8\nCONTAINER_NAME=hr-portal-container\nAWS_CONTAINER_CREDENTIALS_RELATIVE_URI=/v2/credentials/123456-1234-1234-1234-123456789012\nAWS_REGION=us-east-1\nAWS_ACCESS_KEY_ID=AKIA1234567890EXAMPLE\nAWS_SECRET_ACCESS_KEY=secretkey0987654321examplekeyhere`;
      } else if (uploadUrl.includes('/proc/1/cgroup')) {
        responseContent = `12:freezer:/docker/123456789abcdef123456789abcdef\n11:memory:/docker/123456789abcdef123456789abcdef\n10:blkio:/docker/123456789abcdef123456789abcdef\n9:hugetlb:/docker/123456789abcdef123456789abcdef\n8:cpu,cpuacct:/docker/123456789abcdef123456789abcdef\n7:perf_event:/docker/123456789abcdef123456789abcdef\n6:net_prio,net_cls:/docker/123456789abcdef123456789abcdef\n5:devices:/docker/123456789abcdef123456789abcdef\n4:cpuset:/docker/123456789abcdef123456789abcdef\n3:pids:/docker/123456789abcdef123456789abcdef\n2:rdma:/\n1:name=systemd:/docker/123456789abcdef123456789abcdef\n0::/system.slice/docker.service`;
      } else {
        responseContent = `Attempting to access: ${uploadUrl}\n\nThis could reveal sensitive container information in a real environment.`;
      }
      
      return {
        content: responseContent,
        contentType: "text/plain"
      };
    }
    
    // For file upload attack simulation
    if (uploadUrl.startsWith('/var/www/html/') || 
        (uploadUrl.startsWith('/') && uploadUrl.includes('www')) ||
        uploadUrl.includes('public_html')) {
      
      // If it's a PHP file, show sample content of the web shell
      if (file.name.endsWith('.php') || file.name.endsWith('.phtml') || file.name.endsWith('.php5')) {
        // Read the file content
        const content = await file.text();
        
        // Check if it contains PHP code
        if (content.includes('<?php') || content.includes('<?=') || content.includes('shell_exec') || 
            content.includes('system(') || content.includes('exec(') || content.includes('passthru(')) {
          
          return {
            content: `Web Shell Uploaded Successfully!\n\n` +
                     `File Path: ${uploadUrl}${file.name}\n` +
                     `Access URL: http://example.com/${file.name}\n\n` +
                     `This file can be used to execute commands on the server.\n` +
                     `Content Preview:\n\n${content}\n\n` +
                     `In a real environment, you would now be able to access this shell at: http://server-ip/${file.name}`,
            contentType: "text/plain"
          };
        }
      }
      
      // For regular files to web server
      return { 
        content: `File uploaded to web server: ${uploadUrl}${file.name}\nThis file is now accessible via the web server.`,
        contentType: "text/plain"
      };
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

export const getRecentDocuments = (): DocumentMetadata[] => {
  // Mock data - in a real app, this would fetch from an API
  return [
    { id: 1, name: "Performance_Review_Q3.pdf", date: "2023-10-15", size: "1.2 MB" },
    { id: 2, name: "Confidential_HR_Policy.docx", date: "2023-09-28", size: "845 KB" },
    { id: 3, name: "Employee_Handbook_2023.pdf", date: "2023-08-12", size: "3.5 MB" },
    { id: 4, name: "Salary_Structure_2023.xlsx", date: "2023-07-30", size: "1.8 MB" }
  ];
};
