
export interface User {
  id: number;
  username: string;
  password?: string; // Should not be exposed in production!
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'hr';
  avatar?: string;
}

export interface Employee extends User {
  socialSecurityNumber: string;
  dateOfBirth: string;
  gender: string;
  bankAccount: string;
  routingNumber: string;
  salary: number;
  position: string;
  department: string;
  manager: string;
  startDate: string;
}

export interface Document {
  id: number;
  employeeId: number;
  name: string;
  type: string;
  uploadDate: string;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface UserDetails {
  fullName: string;
  email: string;
  socialSecurityNumber: string;
  dateOfBirth: string;
  gender: string;
  bankAccount: string;
  salary: string;
  position: string;
  department: string;
  manager: string;
  startDate: string;
}
