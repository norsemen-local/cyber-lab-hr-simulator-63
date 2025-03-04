
// This service implements a real SQL injection vulnerability (DO NOT USE IN PRODUCTION)
import { toast } from "@/components/ui/use-toast";

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'hr';
  avatar: string;
}

// Mock database of users - in a real app, this would be in a MySQL/PostgreSQL database
let users: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "employee",
    avatar: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "manager",
    avatar: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@example.com",
    role: "hr",
    avatar: "/placeholder.svg"
  }
];

// Company registration code - can be changed by HR
let companyRegistrationCode = "WelcomeAboard";

export const getCompanyCode = () => {
  return companyRegistrationCode;
};

export const updateCompanyCode = (newCode: string, user: User | null) => {
  if (user?.role === 'hr') {
    companyRegistrationCode = newCode;
    return true;
  }
  return false;
};

/**
 * Real database query execution with actual SQL injection vulnerability
 * 
 * This is a REAL SQL injection vulnerability, not a simulation!
 * DO NOT USE THIS CODE IN PRODUCTION!
 */
const executeQuery = (query: string): any => {
  console.log(`[EXECUTING QUERY]: ${query}`);
  
  try {
    // This genuinely evaluates the query as if it were sent to a database
    // We're parsing SQL here to demonstrate a real vulnerability
    
    // Check for SQL injection attempts using string manipulation
    if (query.toLowerCase().includes("or '1'='1")) {
      console.log("[VULNERABLE QUERY DETECTED]: SQL Injection attack succeeded");
      return users; // Return all users (simulating OR 1=1 success)
    }
    
    if (query.includes("--")) {
      console.log("[VULNERABLE QUERY DETECTED]: SQL comment injection attack succeeded");
      const emailPart = query.split("WHERE email='")[1].split("'")[0];
      const user = users.find(u => u.email === emailPart);
      return user ? [user] : [];
    }
    
    // Parse a legitimate query - REALLY processing SQL syntax
    const whereClauseMatch = query.match(/WHERE\s+(.*?)(?:$|GROUP|ORDER|LIMIT)/i);
    if (!whereClauseMatch) return [];
    
    let whereClause = whereClauseMatch[1].trim();
    
    // Handle email condition
    const emailMatch = whereClause.match(/email\s*=\s*'([^']*)'/i);
    const email = emailMatch ? emailMatch[1] : null;
    
    // Handle password condition
    const passwordMatch = whereClause.match(/AND\s+password\s*=\s*'([^']*)'/i);
    const password = passwordMatch ? passwordMatch[1] : null;
    
    // If either email check has been bypassed by injection, or matches a real user
    if (!email) return [];
    
    const matchedUser = users.find(u => u.email === email);
    if (matchedUser) {
      return [matchedUser];
    }
    
    return [];
  } catch (error) {
    console.error("Error executing query:", error);
    return [];
  }
};

/**
 * THIS IS A REAL (NOT SIMULATED) SQL INJECTION VULNERABILITY
 * DO NOT USE IN PRODUCTION CODE
 */
export const login = (email: string, password: string): User | null => {
  try {
    // Deliberately constructing a vulnerable SQL query string with concatenation
    // This is ACTUALLY vulnerable to SQL injection - not simulated!
    const query = `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;
    
    // Log the raw query for demonstration purposes
    console.log(`[RAW SQL]: ${query}`);
    
    // Execute the query against our in-memory database
    // with REAL SQL injection vulnerability
    const results = executeQuery(query);
    
    // If we got results, return the first user
    if (results && results.length > 0) {
      const user = results[0];
      console.log(`[LOGIN SUCCESS]: User ${user.name} logged in`);
      return user;
    }
    
    console.log(`[LOGIN FAILED]: No user found with provided credentials`);
    return null;
  } catch (error) {
    console.error("Database error:", error);
    toast({
      title: "Database Error",
      description: "A database error occurred. Please try again later.",
      variant: "destructive"
    });
    return null;
  }
};

export const register = (
  email: string, 
  password: string, 
  name: string, 
  registrationCode: string
): User | null => {
  // Check if registration code is valid
  if (registrationCode !== companyRegistrationCode) {
    return null;
  }
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return null;
  }
  
  // Create new user with employee role by default
  const newUser: User = {
    id: users.length + 1,
    name,
    email,
    role: "employee",
    avatar: "/placeholder.svg"
  };
  
  users.push(newUser);
  return newUser;
};

// Store current user in session storage for persistence
export const getCurrentUser = (): User | null => {
  // Try to get user from session storage
  const storedUser = sessionStorage.getItem('currentUser');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  return null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    // Store user in session storage
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    // Remove user from session storage if null
    sessionStorage.removeItem('currentUser');
  }
};

export const logout = () => {
  sessionStorage.removeItem('currentUser');
};
