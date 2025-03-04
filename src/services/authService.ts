
// This service demonstrates a vulnerable backend with real SQL injection possibilities
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

// Mock database query execution - simulates a real database connection
const executeQuery = (query: string): any => {
  console.log(`[EXECUTING QUERY]: ${query}`);
  
  // This simulates what would happen in a real MySQL database when SQL injection is attempted
  if (query.includes("OR '1'='1")) {
    console.log("[VULNERABLE QUERY DETECTED]: SQL Injection attack succeeded");
    return [users[0]]; // Return first user, simulating "OR 1=1" returning all rows
  }
  
  if (query.includes("--")) {
    console.log("[VULNERABLE QUERY DETECTED]: SQL comment injection attack succeeded");
    const emailPart = query.split("WHERE email='")[1].split("'")[0];
    // Find user with that email
    const user = users.find(u => u.email === emailPart);
    return user ? [user] : [];
  }
  
  // Regular query, parse it to extract email and password
  try {
    const emailMatch = query.match(/WHERE email='([^']*)'/) || [];
    const passwordMatch = query.match(/AND password='([^']*)'/) || [];
    
    const email = emailMatch[1];
    const password = passwordMatch[1];
    
    if (!email) return [];
    
    // In a real app with proper security, we would use a parameterized query and password hashing
    // This simulates finding a user with matching credentials
    const matchedUser = users.find(u => u.email === email);
    return matchedUser ? [matchedUser] : [];
  } catch (error) {
    console.error("Error parsing query:", error);
    return [];
  }
};

// Vulnerable to SQL Injection - simulating a real DB connection
export const login = (email: string, password: string): User | null => {
  try {
    // This constructs an actual SQL query string that would be vulnerable to injection
    const query = `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;
    
    // Log the raw query for demonstration purposes
    console.log(`[RAW SQL]: ${query}`);
    
    // This would be actually executing the query in a real database
    const results = executeQuery(query);
    
    // If we got a result, return the first user
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
