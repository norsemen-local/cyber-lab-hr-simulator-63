
import { User } from "./types";
import { API_URL } from "../constants";

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
