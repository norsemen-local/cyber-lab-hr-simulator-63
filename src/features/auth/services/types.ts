
// Authentication-related types

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'hr';
  avatar: string;
}
