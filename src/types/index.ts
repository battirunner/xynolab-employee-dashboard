export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'employee';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
  department: string;
  position: string;
  hire_date: string;
  salary: number;
  base_salary?: number;
  phone: string;
  address: string;
  emergency_contact: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: 'present' | 'absent' | 'leave' | 'holiday';
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface SalaryRecord {
  id: number;
  employee_id: number;
  month: string;
  year: number;
  basic_salary: number;
  overtime: number;
  bonus: number;
  deductions: number;
  net_salary: number;
  status: 'pending' | 'paid';
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
}

export interface CreateEmployeeData {
  user_id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
  department: string;
  position: string;
  hire_date: string;
  salary: number;
  phone: string;
  address: string;
  emergency_contact: string;
}

export interface UpdateEmployeeData {
  first_name?: string;
  last_name?: string;
  department?: string;
  position?: string;
  salary?: number;
  phone?: string;
  address?: string;
  emergency_contact?: string;
}

export interface AttendanceCreate {
  date: string;
  status: 'present' | 'absent' | 'leave' | 'holiday';
  reason?: string;
  notes?: string;
}

export interface SalaryUpdate {
  status: 'pending' | 'paid';
}

export interface InvitationCreate {
  email: string;
  employee_id: string;
  hire_date: string;
  department?: string;
  position?: string;
  base_salary?: number;
}

export interface Invitation {
  id: number;
  email: string;
  employee_id: string;
  status: 'pending' | 'accepted' | 'expired';
  hire_date: string;
  department?: string;
  position?: string;
  base_salary?: number;
  expires_at: string;
  created_at: string;
}