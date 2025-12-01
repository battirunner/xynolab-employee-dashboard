import axios from "axios";
import {
  User,
  Employee,
  AttendanceRecord,
  SalaryRecord,
  AuthResponse,
  CreateUserData,
  CreateEmployeeData,
  UpdateEmployeeData,
  AttendanceCreate,
  SalaryUpdate,
  InvitationCreate,
  Invitation,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Public API instance (no auth headers)
const publicApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token getter function - will be set by auth provider
let getAuthToken: (() => string | null) | null = null;

export const setAuthTokenGetter = (tokenGetter: () => string | null) => {
  getAuthToken = tokenGetter;
};

// Request interceptor to add authorization header
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken?.() || (typeof window !== 'undefined' ? localStorage.getItem("access_token") : null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's not a login attempt
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  register: async (userData: CreateUserData): Promise<User> => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  // Users
  createUser: async (userData: CreateUserData): Promise<User> => {
    const response = await api.post("/admin/users", userData);
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  // Employees
  getAllEmployees: async (): Promise<Employee[]> => {
    const response = await api.get("/admin/employees");
    return response.data;
  },

  createEmployee: async (
    employeeData: CreateEmployeeData
  ): Promise<Employee> => {
    const response = await api.post("/admin/employees", employeeData);
    return response.data;
  },

  updateEmployee: async (
    employeeId: number,
    employeeData: UpdateEmployeeData
  ): Promise<Employee> => {
    const response = await api.put(
      `/admin/employees/${employeeId}`,
      employeeData
    );
    return response.data;
  },

  // Salary Records
  updateSalaryRecord: async (
    salaryId: number,
    salaryData: SalaryUpdate
  ): Promise<SalaryRecord> => {
    const response = await api.put(
      `/admin/salary-records/${salaryId}`,
      salaryData
    );
    return response.data;
  },

  getEmployeeSalaryRecords: async (
    employeeId: number
  ): Promise<SalaryRecord[]> => {
    const response = await api.get(
      `/admin/employees/${employeeId}/salary-records`
    );
    return response.data;
  },

  // Attendance
  getEmployeeAttendance: async (
    employeeId: number,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceRecord[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const response = await api.get(
      `/attendance/employee/${employeeId}?${params}`
    );
    return response.data;
  },

  updateAttendance: async (
    attendanceId: number,
    attendanceData: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord> => {
    const response = await api.put(
      `/attendance/${attendanceId}`,
      attendanceData
    );
    return response.data;
  },

  // Invitations
  createInvitation: async (
    invitationData: InvitationCreate
  ): Promise<Invitation> => {
    const response = await api.post("/admin/invitations", invitationData);
    return response.data;
  },

  getAllInvitations: async (): Promise<Invitation[]> => {
    const response = await api.get("/admin/invitations");
    return response.data;
  },
};

// Employee API
export const employeeApi = {
  getMyProfile: async (): Promise<Employee> => {
    const response = await api.get("/employees/me");
    return response.data;
  },

  getMySalaryRecords: async (): Promise<SalaryRecord[]> => {
    const response = await api.get("/employees/me/salary-records");
    return response.data;
  },

  getMyAttendance: async (
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceRecord[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const response = await api.get(`/attendance/my-attendance?${params}`);
    return response.data;
  },

  checkIn: async (): Promise<{ message: string; time: string }> => {
    const response = await api.post("/attendance/check-in");
    return response.data;
  },

  checkOut: async (): Promise<{ message: string; time: string }> => {
    const response = await api.post("/attendance/check-out");
    return response.data;
  },

  submitAttendance: async (
    attendanceData: AttendanceCreate
  ): Promise<AttendanceRecord> => {
    const response = await api.post("/attendance/", attendanceData);
    return response.data;
  },
};

// Invitation API (public - no auth required)
export const invitationApi = {
  validateToken: async (token: string) => {
    const response = await publicApi.get(`/invitations/validate/${token}`);
    return response.data;
  },

  acceptInvitation: async (invitationData: any) => {
    const response = await publicApi.post("/invitations/accept", invitationData);
    return response.data;
  },
};

export default api;
