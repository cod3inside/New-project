import axios from 'axios';

/* ✅ Backend Base URL */
const API_URL = import.meta.env.VITE_API_URL;

/* ✅ Axios Instance */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/* ✅ Auto attach token to every request */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* Helper */
const responseBody = (response: any) => response.data;

/* ─── AUTH ─────────────────────────────────────────── */
export const loginUser = async (creds: any) => {
  try {
    const res = await api.post('/api/auth/login', creds);
    if (res.data.token) localStorage.setItem('token', res.data.token);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || 'Login failed' };
  }
};

export const registerUser = async (data: any) => {
  try {
    const res = await api.post('/api/auth/register', data);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || 'Registration failed' };
  }
};

export const logoutUser = async () => {
  localStorage.removeItem('token');
  return { success: true };
};

export const checkSession = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { data: { user: null } };
    const res = await api.get('/api/auth/session');
    return { data: res.data };
  } catch {
    return { data: { user: null } };
  }
};

/* ─── INVOICES ─────────────────────────────────────── */
export const getInvoices = async () =>
  api.get('/api/finance/invoices').then(responseBody);

export const getInvoice = async (id: number) =>
  api.get(`/api/finance/invoices/${id}`).then(responseBody);

export const createInvoice = async (data: any) =>
  api.post('/api/finance/invoices', data).then(responseBody);

export const updateInvoice = async (id: number, data: any) =>
  api.put(`/api/finance/invoices/${id}`, data).then(responseBody);

export const deleteInvoice = async (id: number) =>
  api.delete(`/api/finance/invoices/${id}`).then(responseBody);

export const uploadInvoicePdf = async (id: number, file: any) => {
  const formData = new FormData();
  formData.append('pdf', file);
  return api.post(`/api/finance/invoices/${id}/pdf`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(responseBody);
};

/* ─── EXPENSES ─────────────────────────────────────── */
export const getExpenses = async () =>
  api.get('/api/finance/expenses').then(responseBody);

export const createExpense = async (data: any) =>
  api.post('/api/finance/expenses', data).then(responseBody);

export const updateExpense = async (id: number, data: any) =>
  api.put(`/api/finance/expenses/${id}`, data).then(responseBody);

export const deleteExpense = async (id: number) =>
  api.delete(`/api/finance/expenses/${id}`).then(responseBody);

/* ─── EMPLOYEES ────────────────────────────────────── */
export const getEmployees = async () =>
  api.get('/api/employees').then(responseBody);

export const getEmployee = async (id: number) =>
  api.get(`/api/employees/${id}`).then(responseBody);

export const createEmployee = async (data: any) =>
  api.post('/api/employees', data).then(responseBody);

export const updateEmployee = async (id: number, data: any) =>
  api.put(`/api/employees/${id}`, data).then(responseBody);

export const deleteEmployee = async (id: number) =>
  api.delete(`/api/employees/${id}`).then(responseBody);

export const markAttendance = async (id: number, data: any) =>
  api.post(`/api/employees/${id}/attendance`, data).then(responseBody);

/* ─── TESTIMONIALS ─────────────────────────────────── */
export const getTestimonials = async () =>
  api.get('/api/testimonials').then(responseBody);

export const getFeaturedTestimonials = async () =>
  api.get('/api/testimonials/featured/list').then(responseBody);

export const createTestimonial = async (data: any) =>
  api.post('/api/testimonials', data).then(responseBody);

export const updateTestimonial = async (id: number, data: any) =>
  api.put(`/api/testimonials/${id}`, data).then(responseBody);

export const deleteTestimonial = async (id: number) =>
  api.delete(`/api/testimonials/${id}`).then(responseBody);

/* ─── TEAM / USERS ─────────────────────────────────── */
export const getTeamMembers = async () =>
  api.get('/api/team').then(responseBody);

export const addTeamMember = async (data: any) =>
  api.post('/api/team', data).then(responseBody);

export const updateUser = async (id: number, data: any) =>
  api.put(`/api/team/${id}`, data).then(responseBody);

export const updateUserRole = async (id: number, role: string) =>
  api.put(`/api/team/${id}/role`, { role }).then(responseBody);

export const updateUserProfile = async (data: any) =>
  api.put('/api/team/profile', data).then(responseBody);

export const deleteUser = async (id: number) =>
  api.delete(`/api/team/${id}`).then(responseBody);

/* ─── PROJECTS ─────────────────────────────────────── */
export const getProjects = async () =>
  api.get('/api/projects').then(responseBody);

export const createProject = async (data: any) =>
  api.post('/api/projects', data).then(responseBody);

export const updateProject = async (id: number, data: any) =>
  api.put(`/api/projects/${id}`, data).then(responseBody);

export const deleteProject = async (id: number) =>
  api.delete(`/api/projects/${id}`).then(responseBody);

/* ─── TASKS ────────────────────────────────────────── */
export const getTasks = async () =>
  api.get('/api/tasks').then(responseBody);

export const createTask = async (data: any) =>
  api.post('/api/tasks', data).then(responseBody);

export const updateTask = async (id: number, data: any) =>
  api.put(`/api/tasks/${id}`, data).then(responseBody);

export const deleteTask = async (id: number) =>
  api.delete(`/api/tasks/${id}`).then(responseBody);

/* ─── CRM / CONTACTS ───────────────────────────────── */
export const getContacts = async () =>
  api.get('/api/crm/contacts').then(responseBody);

export const createContact = async (data: any) =>
  api.post('/api/crm/contacts', data).then(responseBody);

export const updateContact = async (id: number, data: any) =>
  api.put(`/api/crm/contacts/${id}`, data).then(responseBody);

export const deleteContact = async (id: number) =>
  api.delete(`/api/crm/contacts/${id}`).then(responseBody);

/* ─── OPPORTUNITIES ────────────────────────────────── */
export const getOpportunities = async () =>
  api.get('/api/crm/opportunities').then(responseBody);

export const createOpportunity = async (data: any) =>
  api.post('/api/crm/opportunities', data).then(responseBody);

export const updateOpportunity = async (id: number, data: any) =>
  api.put(`/api/crm/opportunities/${id}`, data).then(responseBody);

/* ─── KNOWLEDGE BASE ───────────────────────────────── */
export const getArticles = async () =>
  api.get('/api/knowledge').then(responseBody);

export const createArticle = async (data: any) =>
  api.post('/api/knowledge', data).then(responseBody);

/* ─── TEAM POSTS ───────────────────────────────────── */
export const getPosts = async () =>
  api.get('/api/posts').then(responseBody);

export const createPost = async (data: any) =>
  api.post('/api/posts', data).then(responseBody);

export const updatePost = async (id: number, data: any) =>
  api.put(`/api/posts/${id}`, data).then(responseBody);

export const deletePost = async (id: number) =>
  api.delete(`/api/posts/${id}`).then(responseBody);

/* ─── WEB FORMS ────────────────────────────────────── */
export const getWebForms = async () =>
  api.get('/api/webforms').then(responseBody);

export const createWebForm = async (data: any) =>
  api.post('/api/webforms', data).then(responseBody);

export const deleteWebForm = async (id: number) =>
  api.delete(`/api/webforms/${id}`).then(responseBody);

/* ─── SETTINGS ─────────────────────────────────────── */
export const getCompanySettings = async () =>
  api.get('/api/settings').then(responseBody);

export const updateCompanySettings = async (data: any) =>
  api.put('/api/settings', data).then(responseBody);

/* ─── PARTNER DIVISION ─────────────────────────────── */
export const getPartnerDivision = async () =>
  api.get('/api/partner-division').then(responseBody);

export const savePartnerDivision = async (data: any) =>
  api.post('/api/partner-division', data).then(responseBody);
