
import { toast } from "@/components/ui/use-toast";
import { User } from "./types";
import { API_URL } from "../constants";

/**
 * THIS IS A REAL (NOT SIMULATED) SQL INJECTION VULNERABILITY
 * DO NOT USE IN PRODUCTION CODE
 */
export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    // Show a simulated SQL query for educational purposes
    const simulatedQuery = `SELECT u.id, u.email, u.role, p.first_name, p.last_name, p.avatar 
                           FROM users u 
                           JOIN user_profiles p ON u.id = p.user_id 
                           WHERE u.email='${email}' AND u.password='${password}'`;
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
