
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
    // For SSRF exploitation attempts
    if (uploadUrl.startsWith('http')) {
      console.log("Making SSRF request to:", uploadUrl);
      
      // Simulate successful SSRF attack
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
          } else if (uploadUrl.includes("/latest/meta-data/instance-id")) {
            return {
              content: "i-0abc12345def67890",
              contentType: "text/plain"
            };
          } else if (uploadUrl.includes("/latest/meta-data/instance-type")) {
            return {
              content: "t2.micro",
              contentType: "text/plain"
            };
          } else if (uploadUrl.includes("/latest/meta-data/public-ipv4")) {
            return {
              content: "203.0.113.10",
              contentType: "text/plain"
            };
          }
        }

        // Default EC2 metadata response if nothing specific was requested
        return {
          content: "EC2 metadata accessed via SSRF. Try more specific paths like /latest/meta-data/iam/security-credentials/",
          contentType: "text/plain"
        };
      }
      
      // For other HTTP URLs
      return {
        content: "This is a simulated SSRF response. In a real environment, this could access internal services and APIs.",
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
                     `This file could be used to execute commands on the server.\n` +
                     `Content Preview:\n\n${content}`,
            contentType: "text/plain"
          };
        }
      }
      
      // For regular files to web server
      return { 
        content: `File uploaded to web server: ${uploadUrl}${file.name}\nThis could potentially be accessible via the web server.`,
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
