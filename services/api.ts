import axios from 'axios';
import { User, Project, Task, Contact, Invoice, Opportunity, Expense, KnowledgeArticle, TeamPost, WebForm, CompanySettings, Role, AttendanceRecord, PartnerDivisionData } from '../types';

// Configure Axios instance
const API_URL = import.meta.env.VITE_API_URL || 'https://api.clippingfriend.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper to extract data
const responseBody = (response: any) => response.data;

// --- Authentication ---
export const loginUser = async (creds: any) => {
  try {
    const res = await api.post('/api/auth/login', creds);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Login failed' };
  }
};

export const registerUser = async (data: any) => {
  try {
    const res = await api.post('/api/auth/register', data);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Registration failed' };
  }
};

export const logoutUser = async () => {
  // Logout is handled client-side by clearing localStorage, 
  // but we can still call a logout endpoint if it exists.
  // The brief doesn't mention a logout endpoint, but typically it's good practice.
  return { success: true };
};

// --- Invoices ---
export const getInvoices = async () => api.get('/api/finance/invoices').then(responseBody);
export const getInvoiceById = async (id: string) => api.get(`/api/finance/invoices/${id}`).then(responseBody);
export const createInvoice = async (data: any) => {
  const payload = {
    client_name: data.clientName || data.client_name,
    amount: data.amount,
    status: data.status,
    due_date: data.dueDate || data.due_date,
    description: data.description
  };
  return api.post('/api/finance/invoices', payload).then(responseBody);
};
export const updateInvoice = async (id: string, data: any) => {
  const payload = {
    client_name: data.clientName || data.client_name,
    amount: data.amount,
    status: data.status,
    due_date: data.dueDate || data.due_date,
    description: data.description
  };
  return api.put(`/api/finance/invoices/${id}`, payload).then(responseBody);
};
export const deleteInvoice = async (id: string) => api.delete(`/api/finance/invoices/${id}`).then(responseBody);

// --- Expenses ---
export const getExpenses = async () => api.get('/api/finance/expenses').then(responseBody);
export const createExpense = async (data: any) => api.post('/api/finance/expenses', data).then(responseBody);
export const updateExpense = async (id: string, data: any) => api.put(`/api/finance/expenses/${id}`, data).then(responseBody);
export const deleteExpense = async (id: string) => api.delete(`/api/finance/expenses/${id}`).then(responseBody);

// --- Employees ---
export const getEmployees = async () => api.get('/api/employees').then(responseBody);
export const getEmployeeById = async (id: string) => api.get(`/api/employees/${id}`).then(responseBody);
export const createEmployee = async (data: any) => {
  const payload = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    position: data.position,
    department: data.department,
    salary: data.salary,
    join_date: data.joinDate || data.join_date,
    status: data.status
  };
  return api.post('/api/employees', payload).then(responseBody);
};
export const updateEmployee = async (id: string, data: any) => {
  const payload = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    position: data.position,
    department: data.department,
    salary: data.salary,
    join_date: data.joinDate || data.join_date,
    status: data.status
  };
  return api.put(`/api/employees/${id}`, payload).then(responseBody);
};
export const deleteEmployee = async (id: string) => api.delete(`/api/employees/${id}`).then(responseBody);
export const getEmployeeAttendance = async (id: string) => api.get(`/api/employees/${id}/attendance`).then(responseBody);
export const markAttendance = async (id: string, data: any) => api.post(`/api/employees/${id}/attendance`, data).then(responseBody);

// --- Testimonials ---
export const getTestimonials = async () => api.get('/api/testimonials').then(responseBody);
export const getFeaturedTestimonials = async () => api.get('/api/testimonials/featured/list').then(responseBody);
export const getTestimonialById = async (id: string) => api.get(`/api/testimonials/${id}`).then(responseBody);
export const createTestimonial = async (data: any) => {
  const payload = {
    client_name: data.clientName || data.client_name,
    client_position: data.clientPosition || data.client_position,
    company: data.company,
    message: data.message,
    rating: data.rating,
    avatar_url: data.avatarUrl || data.avatar_url
  };
  return api.post('/api/testimonials', payload).then(responseBody);
};
export const updateTestimonial = async (id: string, data: any) => {
  const payload = {
    client_name: data.clientName || data.client_name,
    client_position: data.clientPosition || data.client_position,
    company: data.company,
    message: data.message,
    rating: data.rating,
    avatar_url: data.avatarUrl || data.avatar_url,
    is_featured: data.isFeatured || data.is_featured
  };
  return api.put(`/api/testimonials/${id}`, payload).then(responseBody);
};
export const deleteTestimonial = async (id: string) => api.delete(`/api/testimonials/${id}`).then(responseBody);

// --- Legacy / Other (Mapping to new structure where possible) ---

// Projects & Tasks (Brief doesn't specify these, but they were in the old code. 
// I'll keep them as placeholders or map them if they exist in the new backend)
export const createProject = async (data: Project) => api.post('/api/projects', data).then(responseBody);
export const updateProject = async (id: string, data: Partial<Project>) => api.put(`/api/projects/${id}`, data).then(responseBody);
export const deleteProject = async (id: string) => api.delete(`/api/projects/${id}`).then(responseBody);

export const createTask = async (data: Task) => api.post('/api/tasks', data).then(responseBody);
export const updateTask = async (id: string, data: Partial<Task>) => api.put(`/api/tasks/${id}`, data).then(responseBody);
export const deleteTask = async (id: string) => api.delete(`/api/tasks/${id}`).then(responseBody);

export const createContact = async (data: Contact) => api.post('/api/contacts', data).then(responseBody);

export const updateUserProfile = async (data: Partial<User>) => api.put('/api/users/profile', data).then(responseBody);

export const updateCompanySettings = async (data: CompanySettings) => api.put('/api/company_settings', data).then(responseBody);

export default {
  loginUser, registerUser, logoutUser,
  getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice,
  getExpenses, createExpense, updateExpense, deleteExpense,
  getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, getEmployeeAttendance, markAttendance,
  getTestimonials, getFeaturedTestimonials, getTestimonialById, createTestimonial, updateTestimonial, deleteTestimonial,
  createProject, updateProject, deleteProject,
  createTask, updateTask, deleteTask,
  createContact, updateUserProfile, updateCompanySettings
};