// This service simulates a vulnerable backend with SQLi possibilities
export interface User {
  id: number;
  name: string;
  email: string; // Changed from username to email
  role: 'employee' | 'manager' | 'hr';
  avatar: string;
}

// Mock database of users
let users: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com", // Changed from username to email
    role: "employee",
    avatar: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com", // Changed from username to email
    role: "manager",
    avatar: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@example.com", // Changed from username to email
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
export const login = (email: string, password: string): User | null => {
  // This simulates a SQL query vulnerable to injection:
  // SELECT * FROM users WHERE email='${email}' AND password='${password}'
  console.log(`[VULNERABLE SQL]: SELECT * FROM users WHERE email='${email}' AND password='${password}'`);
  
  // Simulate SQL injection vulnerability
  if (email.includes("'") || password.includes("'")) {
    // If the input contains a single quote, it could break the SQL query
    // For ' OR '1'='1 as email and anything as password, this would return the first user
    // since '1'='1' is always true
    return users[0];
  }
  
  // For demo purposes, any password works with a valid email
  const user = users.find(u => u.email === email);
  return user || null;
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
