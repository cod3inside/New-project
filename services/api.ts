import axios from 'axios';
import { User, Project, Task, Contact, Invoice, Opportunity, Expense, KnowledgeArticle, TeamPost, WebForm, CompanySettings, Role, AttendanceRecord, PartnerDivisionData } from '../types';

// Configure Axios instance
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for secure cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to extract data
const responseBody = (response: any) => response.data;

// --- Authentication ---
export const loginUser = async (creds: any) => {
  try {
    const res = await api.post('/auth/login', creds);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Login failed' };
  }
};

export const registerUser = async (data: any) => {
  try {
    const res = await api.post('/auth/register', data);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Registration failed' };
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (e) {
    console.error("Logout error", e);
  }
  return { success: true };
};

export const checkSession = async () => {
  try {
    const res = await api.get('/auth/session');
    return { data: res.data };
  } catch (error) {
    return { data: { user: null } };
  }
};

// --- Data Fetching ---
export const fetchAllData = async () => {
  const res = await api.get('/data/all');
  return { data: res.data };
};

// --- CRUD Operations ---

// Projects
export const createProject = async (data: Project) => api.post('/data/projects', data).then(responseBody);
export const updateProject = async (id: string, data: Partial<Project>) => api.put(`/data/projects/${id}`, data).then(responseBody);
export const deleteProject = async (id: string) => api.delete(`/data/projects/${id}`).then(responseBody);

// Tasks
export const createTask = async (data: Task) => api.post('/data/tasks', data).then(responseBody);
export const updateTask = async (id: string, data: Partial<Task>) => api.put(`/data/tasks/${id}`, data).then(responseBody);
export const deleteTask = async (id: string) => api.delete(`/data/tasks/${id}`).then(responseBody);

// Contacts
export const createContact = async (data: Contact) => api.post('/data/contacts', data).then(responseBody);

// Invoices
export const createInvoice = async (data: Invoice) => api.post('/data/invoices', data).then(responseBody);
export const updateInvoice = async (id: string, data: Partial<Invoice>) => api.put(`/data/invoices/${id}`, data).then(responseBody);
export const uploadInvoicePdf = async (id: string, pdfBase64: string) => api.post(`/data/invoices/${id}/pdf`, { pdfBase64 }).then(responseBody);

// Expenses
export const createExpense = async (data: Expense) => api.post('/data/expenses', data).then(responseBody);
export const updateExpense = async (id: string, data: Partial<Expense>) => api.put(`/data/expenses/${id}`, data).then(responseBody);
export const deleteExpense = async (id: string) => api.delete(`/data/expenses/${id}`).then(responseBody);

// Opportunities
export const createOpportunity = async (data: Opportunity) => api.post('/data/opportunities', data).then(responseBody);
export const updateOpportunity = async (id: string, data: Partial<Opportunity>) => api.put(`/data/opportunities/${id}`, data).then(responseBody);

// Articles
export const createArticle = async (data: KnowledgeArticle) => api.post('/data/articles', data).then(responseBody);

// Posts
export const createPost = async (data: TeamPost) => api.post('/data/posts', data).then(responseBody);
export const updatePost = async (id: string, data: Partial<TeamPost>) => api.put(`/data/posts/${id}`, data).then(responseBody);
export const deletePost = async (id: string) => api.delete(`/data/posts/${id}`).then(responseBody);

// Web Forms
export const createWebForm = async (data: WebForm) => api.post('/data/web_forms', data).then(responseBody);
export const deleteWebForm = async (id: string) => api.delete(`/data/web_forms/${id}`).then(responseBody);

// User Profile & Team
export const updateUserProfile = async (data: Partial<User>) => api.put('/data/users/profile', data).then(responseBody);

// Employee Management (Admin)
export const getEmployees = async () => api.get('/employees').then(responseBody);
export const createEmployee = async (data: any) => api.post('/employees', data).then(responseBody);
export const updateEmployee = async (id: string, data: any) => api.put(`/employees/${id}`, data).then(responseBody);
export const deleteEmployee = async (id: string) => api.delete(`/employees/${id}`).then(responseBody);

// Legacy Team Member functions (mapped to new employee endpoints if needed, or kept for compatibility)
export const addTeamMember = async (data: any) => {
  try {
    const res = await api.post('/employees', data);
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed' };
  }
};

export const updateUser = async (id: string, data: Partial<User>) => {
  try {
    await api.put(`/employees/${id}`, data);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Update failed' };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await api.delete(`/employees/${userId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Delete failed' };
  }
};

export const updateUserRole = async (userId: string, role: Role) => {
  await api.put(`/employees/${userId}`, { role });
};

// Attendance
export const markAttendance = async (data: AttendanceRecord) => {
  await api.post('/data/attendance', data);
};

// Company Settings
export const updateCompanySettings = async (data: CompanySettings) => {
  await api.put('/data/company_settings', data);
};

// Partner Division
export const getPartnerDivision = async () => api.get('/data/partner-division').then(responseBody);
export const savePartnerDivision = async (data: PartnerDivisionData) => api.post('/data/partner-division', data).then(responseBody);

export default {
  loginUser, registerUser, logoutUser, checkSession,
  fetchAllData,
  createProject, updateProject, deleteProject,
  createTask, updateTask, deleteTask,
  createContact,
  createInvoice, updateInvoice, uploadInvoicePdf,
  createExpense, updateExpense, deleteExpense,
  createOpportunity, updateOpportunity,
  createArticle,
  createPost, updatePost, deletePost,
  createWebForm, deleteWebForm,
  updateUserProfile, addTeamMember, updateUser, updateUserRole, deleteUser,
  markAttendance,
  updateCompanySettings,
  getPartnerDivision, savePartnerDivision,
  getEmployees, createEmployee, updateEmployee, deleteEmployee
};