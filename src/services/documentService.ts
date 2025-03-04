
// API Gateway base URL would typically come from environment variables
const API_GATEWAY_URL = "https://api-gateway-endpoint.execute-api.region.amazonaws.com/prod";

export interface DocumentMetadata {
  id: number;
  name: string;
  date: string;
  size: string;
}

// This service handles document operations including the vulnerable SSRF functionality
export const uploadDocument = async (file: File, uploadUrl: string): Promise<string | null> => {
  // Create FormData object for the file upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('destination', uploadUrl);

  // Vulnerable URL construction - allows changing the upload destination
  // This is intentionally vulnerable to SSRF
  console.log(`Uploading to: ${uploadUrl}/${file.name}`);

  // For simulation purposes, we'll handle the SSRF demonstration locally
  if (uploadUrl.startsWith('http')) {
    // Simulate SSRF vulnerability exploitation
    console.log(`Simulating SSRF access to: ${uploadUrl}`);
    
    // Simulate successful EC2 metadata retrieval for demonstration
    if (uploadUrl.includes("169.254.169.254")) {
      return `Simulated SSRF Response:\n\nMetadata for ${uploadUrl}:\n{\n  "instance-id": "i-0123456789abcdef0",\n  "instance-type": "t3.micro",\n  "local-hostname": "ip-10-0-0-123.ec2.internal",\n  "local-ipv4": "10.0.0.123",\n  "public-hostname": "ec2-12-34-56-78.compute-1.amazonaws.com",\n  "public-ipv4": "12.34.56.78",\n  "security-groups": "hr-portal-ec2-sg",\n  "iam": {\n    "security-credentials": {\n      "hr-portal-ec2-role": {\n        "AccessKeyId": "ASIA...",\n        "SecretAccessKey": "SECRET...",\n        "Token": "TOKEN...",\n        "Expiration": "2023-12-31T23:59:59Z"\n      }\n    }\n  }\n}`;
    } else {
      // Generic SSRF response for other URLs
      return `Simulated SSRF Response:\n\nContent from ${uploadUrl}:\n{\n  "status": "success",\n  "message": "SSRF vulnerability demonstrated successfully"\n}`;
    }
  } else {
    // For non-HTTP URLs like s3://, simulate upload success
    return null;
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
