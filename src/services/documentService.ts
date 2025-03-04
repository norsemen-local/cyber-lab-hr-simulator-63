
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
      const response = await fetch(uploadUrl);
      const contentType = response.headers.get('content-type') || 'text/plain';
      const content = await response.text();
      return { content, contentType };
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
