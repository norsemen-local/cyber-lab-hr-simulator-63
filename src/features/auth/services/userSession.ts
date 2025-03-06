
import { User } from "./types";

// Handle user session in browser storage
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
