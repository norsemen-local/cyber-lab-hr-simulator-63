
// WARNING: This file contains deliberately vulnerable code for security training purposes.
// DO NOT use these patterns in production applications.

/**
 * API service for the HR application.
 * Contains intentional security vulnerabilities for demonstration.
 */

// Mock employee data including sensitive information
const employees = [
  {
    id: 1,
    username: "jdoe",
    password: "password123",  // Plaintext passwords - BAD PRACTICE!
    name: "John Doe",
    email: "john.doe@example.com",
    role: "employee",
    socialSecurityNumber: "123-45-6789",
    dateOfBirth: "1985-03-12",
    gender: "male",
    bankAccount: "9876543210",
    routingNumber: "078912345",
    salary: 85000,
    position: "Software Developer",
    department: "Engineering",
    manager: "Tom Code",
    startDate: "2022-03-01"
  },
  {
    id: 2,
    username: "jsmith",
    password: "letmein",  // Plaintext passwords - BAD PRACTICE!
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "manager",
    socialSecurityNumber: "987-65-4321",
    dateOfBirth: "1980-07-22",
    gender: "female",
    bankAccount: "1234567890",
    routingNumber: "123456789",
    salary: 110000,
    position: "Engineering Manager",
    department: "Engineering",
    manager: "John Executive",
    startDate: "2020-01-15"
  },
  {
    id: 3,
    username: "bpeople",
    password: "hr1234",  // Plaintext passwords - BAD PRACTICE!
    name: "Bob People",
    email: "bob.people@example.com",
    role: "hr",
    socialSecurityNumber: "456-78-9012",
    dateOfBirth: "1975-11-05",
    gender: "male",
    bankAccount: "5432167890",
    routingNumber: "987654321",
    salary: 95000,
    position: "HR Director",
    department: "Human Resources",
    manager: "John Executive",
    startDate: "2019-08-10"
  }
];

// Mock document data
const documents = [
  { id: 1, employeeId: 1, name: "employee_details.pdf", type: "PDF", uploadDate: "2023-06-15" },
  { id: 2, employeeId: 1, name: "id_card.jpg", type: "Image", uploadDate: "2023-06-10" },
  { id: 3, employeeId: 1, name: "contract.docx", type: "Document", uploadDate: "2023-05-22" },
  { id: 4, employeeId: 2, name: "performance_review.pdf", type: "PDF", uploadDate: "2023-04-30" },
];

// Mock leave requests
const leaveRequests = [
  { id: 1, employeeId: 1, type: "Vacation", startDate: "2023-07-10", endDate: "2023-07-14", status: "Approved" },
  { id: 2, employeeId: 1, type: "Sick Leave", startDate: "2023-05-03", endDate: "2023-05-04", status: "Approved" },
  { id: 3, employeeId: 2, type: "Work From Home", startDate: "2023-06-22", endDate: "2023-06-22", status: "Approved" },
];

/**
 * Authenticate user - VULNERABLE TO SQL INJECTION
 * 
 * @param username Username for authentication
 * @param password Password for authentication
 * @returns User object or null if authentication fails
 */
export const authenticateUser = (username: string, password: string) => {
  // This is a simulation of vulnerable SQL query construction
  // In a real app with a SQL database, this would be vulnerable to SQL injection
  console.log(`Executing query: SELECT * FROM users WHERE username='${username}' AND password='${password}'`);
  
  // For demo purposes, just find the user in our mock data
  // In a real vulnerable app, concatenating user input directly into SQL would allow SQL injection
  return employees.find(user => user.username === username && user.password === password) || null;
};

/**
 * Upload a file to the user's folder - VULNERABLE TO SSRF
 * 
 * @param file The file to upload
 * @param userId The user ID who owns the file
 * @returns Object with status and message
 */
export const uploadFile = (file: File, userId: number) => {
  // This simulates a vulnerable SSRF endpoint
  // In a real app, this would make a server request using user-controlled URL
  const uploadUrl = `s3://employee-bucket/${userId}/${file.name}`;
  
  // VULNERABLE: No validation of file type, size, or content
  console.log(`Uploading file to: ${uploadUrl}`);
  
  // VULNERABLE: In a real app, this would make a request to a potentially user-controlled destination
  console.log(`SSRF vulnerable endpoint: /api/upload?url=${uploadUrl}`);
  
  // Mock successful upload
  const newDocument = {
    id: documents.length + 1,
    employeeId: userId,
    name: file.name,
    type: file.type.split('/')[1] || "Unknown",
    uploadDate: new Date().toISOString().split('T')[0]
  };
  
  documents.push(newDocument);
  
  return {
    success: true,
    message: `File ${file.name} uploaded successfully!`,
    document: newDocument
  };
};

/**
 * Get documents for a user - NO PROPER ACCESS CONTROL
 * 
 * @param userId The user ID to get documents for
 * @returns Array of documents
 */
export const getUserDocuments = (userId: number) => {
  // VULNERABLE: No proper access control, a user could potentially access another user's documents
  // by simply changing the userId parameter
  return documents.filter(doc => doc.employeeId === userId);
};

/**
 * Submit a leave request - VULNERABLE TO XSS
 * 
 * @param userId User ID submitting the request
 * @param leaveData Leave request data
 * @returns The created leave request
 */
export const submitLeaveRequest = (userId: number, leaveData: any) => {
  // VULNERABLE: No sanitization of user input which could lead to XSS
  const newLeaveRequest = {
    id: leaveRequests.length + 1,
    employeeId: userId,
    type: leaveData.type,
    startDate: leaveData.startDate,
    endDate: leaveData.endDate,
    reason: leaveData.reason, // This could contain malicious scripts
    status: "Pending"
  };
  
  leaveRequests.push(newLeaveRequest);
  
  return newLeaveRequest;
};

/**
 * Generate PDF with user details - VULNERABLE TO PATH TRAVERSAL
 * 
 * @param userData User data to include in PDF
 * @returns Object with status and file path
 */
export const generateUserDetailsPDF = (userData: any) => {
  // VULNERABLE: Using user input in file paths without proper validation
  // could lead to path traversal attacks
  const fileName = `${userData.name.replace(/\s/g, '_')}_details.pdf`;
  
  // In a real vulnerable app, this could allow writing files to arbitrary locations
  console.log(`Generating PDF at location: /tmp/${fileName}`);
  
  // VULNERABLE: Path traversal when uploading to S3
  const s3Path = `employee-documents/${userData.id}/${fileName}`;
  console.log(`Uploading to S3 at: ${s3Path}`);
  
  return {
    success: true,
    message: "PDF generated successfully",
    filePath: s3Path
  };
};

/**
 * Get employee organization data - INFORMATION DISCLOSURE
 */
export const getOrganizationData = () => {
  // VULNERABLE: Returns excessive personal information about all employees
  // without proper access control or data minimization
  return employees.map(emp => ({
    id: emp.id,
    name: emp.name,
    position: emp.position,
    department: emp.department,
    manager: emp.manager,
    salary: emp.salary // Sensitive information exposed!
  }));
};
