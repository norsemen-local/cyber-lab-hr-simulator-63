
// Re-export auth functionality from the new modules
// This maintains backward compatibility while we migrate to the new structure

export { 
  // User session management
  getCurrentUser,
  setCurrentUser,
  logout,
  
  // Authentication operations
  login,
  register,
  
  // Company code operations
  getCompanyCode,
  updateCompanyCode,
  
  // Types
  User,
  
  // Constants
  API_URL,
  DB_ENDPOINT
} from '../features/auth';
