
// This service implements a real SQL injection vulnerability (DO NOT USE IN PRODUCTION)
import { toast } from "@/components/ui/use-toast";

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'hr';
  avatar: string;
}

// Define the API URL - in production, this would come from environment variables
const API_URL = 'http://localhost:3000/api';

// Get company registration code from the server
export const getCompanyCode = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/company/code`);
    const data = await response.json();
    
    if (data.success) {
      return data.code;
    } else {
      console.error('Failed to retrieve company code:', data.error);
      return 'WelcomeAboard'; // Fallback value
    }
  } catch (error) {
    console.error('Error getting company code:', error);
    return 'WelcomeAboard'; // Fallback value
  }
};

// Update company registration code (HR only)
export const updateCompanyCode = async (newCode: string, user: User | null): Promise<boolean> => {
  if (!user || user.role !== 'hr') {
    return false;
  }
  
  try {
    const response = await fetch(`${API_URL}/company/code`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: newCode,
        userId: user.id
      }),
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error updating company code:', error);
    return false;
  }
};

/**
 * THIS IS A REAL (NOT SIMULATED) SQL INJECTION VULNERABILITY
 * DO NOT USE IN PRODUCTION CODE
 */
export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    // Show a simulated SQL query for educational purposes
    const simulatedQuery = `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;
    console.log(`[SIMULATED SQL]: ${simulatedQuery}`);
    
    // Make the actual request to the server
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (data.success && data.user) {
      console.log(`[LOGIN SUCCESS]: User ${data.user.name} logged in`);
      return data.user;
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

export const register = async (
  email: string, 
  password: string, 
  name: string, 
  registrationCode: string
): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        registrationCode
      }),
    });

    const data = await response.json();
    
    if (data.success && data.user) {
      return data.user;
    }
    
    // Show error toast
    if (data.error) {
      toast({
        title: "Registration Failed",
        description: data.error,
        variant: "destructive"
      });
    }
    
    return null;
  } catch (error) {
    console.error("Registration error:", error);
    toast({
      title: "Registration Error",
      description: "An error occurred during registration. Please try again later.",
      variant: "destructive"
    });
    return null;
  }
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
