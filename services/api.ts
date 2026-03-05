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
    description: data.description,
    currency: data.currency || 'USD',
    issue_date: data.issueDate || data.issue_date,
    items: data.items || [],
    payment_info: data.paymentInfo || data.payment_info,
    client_id: data.clientId || data.client_id,
  };
  return api.post('/api/finance/invoices', payload).then(responseBody);
};
export const updateInvoice = async (id: string, data: any) => {
  const payload = {
    client_name: data.clientName || data.client_name,
    amount: data.amount,
    status: data.status,
    due_date: data.dueDate || data.due_date,
    description: data.description,
    currency: data.currency || 'USD',
    issue_date: data.issueDate || data.issue_date,
    items: data.items || [],
    payment_info: data.paymentInfo || data.payment_info,
    client_id: data.clientId || data.client_id,
  };
  return api.put(`/api/finance/invoices/${id}`, payload).then(responseBody);
};
export const deleteInvoice = async (id: string) => api.delete(`/api/finance/invoices/${id}`).then(responseBody);

// Upload invoice PDF (base64) to server
export const uploadInvoicePdf = async (invoiceId: string, pdfBase64: string) => {
  return api.post(`/api/finance/invoices/${invoiceId}/pdf`, { pdf: pdfBase64 }).then(responseBody);
};

// --- Expenses ---
export const getExpenses = async () => api.get('/api/finance/expenses').then(responseBody);
export const createExpense = async (data: any) => {
  const payload = {
    description: data.description,
    amount: data.amount,
    category: data.category,
    date: data.date,
    status: data.status || 'Pending',
  };
  return api.post('/api/finance/expenses', payload).then(responseBody);
};
export const updateExpense = async (id: string, data: any) => {
  const payload = {
    description: data.description,
    amount: data.amount,
    category: data.category,
    date: data.date,
    status: data.status,
  };
  return api.put(`/api/finance/expenses/${id}`, payload).then(responseBody);
};
export const deleteExpense = async (id: string) => api.delete(`/api/finance/expenses/${id}`).then(responseBody);

// --- Partner Division (FIX: these were completely missing) ---
export const getPartnerDivision = async (): Promise<PartnerDivisionData | null> => {
  return api.get('/api/finance/partner-division').then(responseBody);
};
export const savePartnerDivision = async (data: PartnerDivisionData) => {
  // Backend expects camelCase: shabujList, mashudList, lastUpdated
  const payload = {
    income: data.income,
    shabujList: data.shabujList,
    mashudList: data.mashudList,
    lastUpdated: data.lastUpdated || new Date().toISOString(),
  };
  return api.post('/api/finance/partner-division', payload).then(responseBody);
};

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
    status: data.status,
    role: data.role || 'employee',
    password: data.password,
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
    status: data.status,
    role: data.role,
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
    avatar_url: data.avatarUrl || data.avatar_url,
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
    is_featured: data.isFeatured ?? data.is_featured,
  };
  return api.put(`/api/testimonials/${id}`, payload).then(responseBody);
};
export const deleteTestimonial = async (id: string) => api.delete(`/api/testimonials/${id}`).then(responseBody);

// --- Projects ---
export const createProject = async (data: Project) => api.post('/api/projects', data).then(responseBody);
export const updateProject = async (id: string, data: Partial<Project>) => api.put(`/api/projects/${id}`, data).then(responseBody);
export const deleteProject = async (id: string) => api.delete(`/api/projects/${id}`).then(responseBody);

// --- Tasks ---
export const createTask = async (data: Task) => api.post('/api/tasks', data).then(responseBody);
export const updateTask = async (id: string, data: Partial<Task>) => api.put(`/api/tasks/${id}`, data).then(responseBody);
export const deleteTask = async (id: string) => api.delete(`/api/tasks/${id}`).then(responseBody);

// --- Contacts ---
export const createContact = async (data: Contact) => api.post('/api/contacts', data).then(responseBody);

// --- Opportunities ---
export const createOpportunity = async (data: Opportunity) => api.post('/api/opportunities', data).then(responseBody);
export const updateOpportunity = async (id: string, data: Partial<Opportunity>) => api.put(`/api/opportunities/${id}`, data).then(responseBody);

// --- Knowledge Base ---
export const createArticle = async (data: KnowledgeArticle) => api.post('/api/articles', data).then(responseBody);

// --- Team Posts ---
export const createPost = async (data: TeamPost) => api.post('/api/posts', data).then(responseBody);
export const updatePost = async (id: string, data: Partial<TeamPost>) => api.put(`/api/posts/${id}`, data).then(responseBody);
export const deletePost = async (id: string) => api.delete(`/api/posts/${id}`).then(responseBody);

// --- Web Forms ---
export const createWebForm = async (data: WebForm) => api.post('/api/webforms', data).then(responseBody);
export const deleteWebForm = async (id: string) => api.delete(`/api/webforms/${id}`).then(responseBody);

// --- User Profile & Settings ---
export const updateUserProfile = async (data: Partial<User>) => api.put('/api/users/profile', data).then(responseBody);
export const updateCompanySettings = async (data: CompanySettings) => api.put('/api/company_settings', data).then(responseBody);

export default {
  loginUser, registerUser, logoutUser,
  getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice, uploadInvoicePdf,
  getExpenses, createExpense, updateExpense, deleteExpense,
  getPartnerDivision, savePartnerDivision,
  getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, getEmployeeAttendance, markAttendance,
  getTestimonials, getFeaturedTestimonials, getTestimonialById, createTestimonial, updateTestimonial, deleteTestimonial,
  createProject, updateProject, deleteProject,
  createTask, updateTask, deleteTask,
  createContact,
  createOpportunity, updateOpportunity,
  createArticle,
  createPost, updatePost, deletePost,
  createWebForm, deleteWebForm,
  updateUserProfile, updateCompanySettings,
};
