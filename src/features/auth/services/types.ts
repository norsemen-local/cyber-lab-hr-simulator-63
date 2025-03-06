
// Authentication-related types

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;
  role: 'employee' | 'manager' | 'hr';
  avatar?: string;
}

export interface UserProfile {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  joinDate?: string;
  manager?: string;
  bio?: string;
  avatar?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  skills?: string[];
  education?: {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    graduationYear?: string;
  }[];
  documents?: {
    id: number;
    name: string;
    type: string;
    uploadDate: string;
    content?: string;
  }[];
  careerHistory?: {
    id: number;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }[];
}
