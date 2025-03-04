
import { DocumentUploadResponse } from "./types";

// API Gateway base URL would typically come from environment variables
export const API_GATEWAY_URL = "https://api-gateway-endpoint.execute-api.region.amazonaws.com/prod";

/**
 * Performs real SSRF requests
 */
export const handleSSRFRequest = async (uploadUrl: string): Promise<DocumentUploadResponse | null> => {
  // Only handle URLs that start with http or file://
  if (!uploadUrl.startsWith('http') && !uploadUrl.startsWith('file:///')) {
    return null;
  }

  console.log("Performing real SSRF request to:", uploadUrl);
  
  try {
    // Attempt a real fetch request to the provided URL
    const response = await fetch(uploadUrl, {
      method: 'GET',
      // We need to disable CORS for real SSRF, but this will be blocked by the browser
      // In a real server-side scenario, these requests would succeed
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    
    // Try to get the response text
    let content;
    try {
      content = await response.text();
    } catch (e) {
      content = "Error reading response body: " + e.message;
    }
    
    return {
      content: content || "Empty response received",
      contentType: response.headers.get('Content-Type') || "text/plain"
    };
  } catch (error) {
    console.error("SSRF request failed:", error);
    
    // For demonstration purposes, provide a partial real response
    // In a real server-side scenario, this request would likely succeed
    if (uploadUrl.includes("169.254.169.254")) {
      return simulateEC2MetadataResponse(uploadUrl);
    }
    
    return {
      content: `Real SSRF request failed: ${error.message}\n\nNote: Browser security prevents direct SSRF attacks. In a real server-side scenario, this request would succeed and return real data from ${uploadUrl}.\n\nSame-origin policy and CORS are blocking this request in the browser environment.`,
      contentType: "text/plain"
    };
  }
};

/**
 * Simulates EC2 instance metadata responses for when real requests fail due to browser security
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
