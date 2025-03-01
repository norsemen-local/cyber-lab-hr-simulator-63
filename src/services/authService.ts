
// This service simulates a vulnerable backend with SQLi possibilities
export interface User {
  id: number;
  name: string;
  username: string;
  role: 'employee' | 'manager' | 'hr';
  avatar: string;
}

// Mock database of users
let users: User[] = [
  {
    id: 1,
    name: "John Doe",
    username: "john",
    role: "employee",
    avatar: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Jane Smith",
    username: "jane",
    role: "manager",
    avatar: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Admin User",
    username: "admin",
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

// Vulnerable to SQL Injection
export const login = (username: string, password: string): User | null => {
  // This simulates a SQL query vulnerable to injection:
  // SELECT * FROM users WHERE username='${username}' AND password='${password}'
  console.log(`[VULNERABLE SQL]: SELECT * FROM users WHERE username='${username}' AND password='${password}'`);
  
  // Simulate SQL injection vulnerability
  if (username.includes("'") || password.includes("'")) {
    // If the input contains a single quote, it could break the SQL query
    // For ' OR '1'='1 as username and anything as password, this would return the first user
    // since '1'='1' is always true
    return users[0];
  }
  
  // For demo purposes, any password works with a valid username
  const user = users.find(u => u.username === username);
  return user || null;
};

export const register = (
  username: string, 
  password: string, 
  name: string, 
  registrationCode: string
): User | null => {
  // Check if registration code is valid
  if (registrationCode !== companyRegistrationCode) {
    return null;
  }
  
  // Check if username already exists
  if (users.some(u => u.username === username)) {
    return null;
  }
  
  // Create new user with employee role by default
  const newUser: User = {
    id: users.length + 1,
    name,
    username,
    role: "employee",
    avatar: "/placeholder.svg"
  };
  
  users.push(newUser);
  return newUser;
};

// Store current user in session
let currentUser: User | null = null;

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

export const logout = () => {
  currentUser = null;
};
