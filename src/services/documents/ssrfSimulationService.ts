
import { DocumentUploadResponse } from "./types";

// API Gateway base URL would typically come from environment variables
export const API_GATEWAY_URL = "https://api-gateway-endpoint.execute-api.region.amazonaws.com/prod";

/**
 * Simulates SSRF responses for educational purposes
 */
export const handleSSRFRequest = (uploadUrl: string): DocumentUploadResponse | null => {
  // Only handle URLs that start with http or file://
  if (!uploadUrl.startsWith('http') && !uploadUrl.startsWith('file:///')) {
    return null;
  }

  console.log("Simulating SSRF request to:", uploadUrl);
  
  // For EC2 metadata simulation
  if (uploadUrl.includes("169.254.169.254")) {
    return simulateEC2MetadataResponse(uploadUrl);
  }

  // For other internal/local URLs
  if (uploadUrl.includes("localhost") || uploadUrl.includes("internal-")) {
    return simulateInternalServiceResponse(uploadUrl);
  }
  
  // For file:/// URL schemes (direct file read attempts)
  if (uploadUrl.startsWith('file:///')) {
    return simulateFileReadResponse(uploadUrl);
  }

  // For other HTTP URLs that don't match specific cases
  return {
    content: `# SSRF Simulation\n\nSimulated Response for: ${uploadUrl}\n\nIn a real server-side scenario, this request would be made without browser security restrictions.`,
    contentType: "text/plain"
  };
};

/**
 * Simulates EC2 instance metadata responses
 */
const simulateEC2MetadataResponse = (uploadUrl: string): DocumentUploadResponse => {
  if (uploadUrl.endsWith("/latest/meta-data/") || uploadUrl.includes("/latest/meta-data")) {
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

  // Default EC2 metadata response
  return {
    content: "EC2 metadata endpoint - default response",
    contentType: "text/plain"
  };
};

/**
 * Simulates responses from internal services
 */
const simulateInternalServiceResponse = (uploadUrl: string): DocumentUploadResponse => {
  let responseContent = "";
  
  if (uploadUrl.includes("internal-jenkins")) {
    responseContent = `<!DOCTYPE html>
<html>
<head>
  <title>Jenkins [2.32.1]</title>
</head>
<body>
  <h1>Welcome to Jenkins 2.32.1</h1>
  <p>This Jenkins instance is vulnerable to CVE-2017-1000353.</p>
  <p>Authentication: admin/Password123!</p>
  <p>Running jobs: 3</p>
  <p>Node status: ACTIVE</p>
</body>
</html>`;
  } else if (uploadUrl.includes("localhost")) {
    responseContent = `<!DOCTYPE html>
<html>
<head>
  <title>Internal Service</title>
</head>
<body>
  <h1>Internal Service</h1>
  <p>This is an internal service running on localhost.</p>
  <p>Version: 1.2.3</p>
  <p>Status: RUNNING</p>
</body>
</html>`;
  } else {
    responseContent = `Simulated internal service response for: ${uploadUrl}`;
  }
  
  return {
    content: responseContent,
    contentType: "text/html"
  };
};

/**
 * Simulates file read responses for educational purposes
 */
const simulateFileReadResponse = (uploadUrl: string): DocumentUploadResponse => {
  const filePath = uploadUrl.replace('file://', '');
  let simulatedContent = "";
  
  if (uploadUrl.includes("/etc/passwd")) {
    simulatedContent = `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
systemd-timesync:x:102:104:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:106::/nonexistent:/usr/sbin/nologin
sshd:x:104:65534::/run/sshd:/usr/sbin/nologin
ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash
hrportal:x:1001:1001::/home/hrportal:/bin/bash
mysql:x:106:111:MySQL Server,,,:/nonexistent:/bin/false
jenkins:x:107:112:Jenkins,,,:/var/lib/jenkins:/bin/bash`;
  } else if (uploadUrl.includes("/etc/shadow")) {
    simulatedContent = "File access denied: insufficient permissions";
  } else if (uploadUrl.includes(".env") || uploadUrl.includes("config")) {
    simulatedContent = `# Application Configuration
DB_HOST=db.internal.example.com
DB_USER=webapp_user
DB_PASSWORD=SuperSecretPassword123!
AWS_ACCESS_KEY=AKIA1234567890EXAMPLE
AWS_SECRET_KEY=abc123def456ghi789jkl012mno345pqr678stu901
API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;
  } else {
    simulatedContent = `Simulated contents of file: ${filePath}\n\nThis is simulated content for demonstration purposes.\nIn a real server-side vulnerability, this would return the actual contents of the file.`;
  }
  
  return {
    content: simulatedContent,
    contentType: "text/plain"
  };
};
