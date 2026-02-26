import axios from 'axios';
import { User, Project, Task, Contact, Invoice, Opportunity, Expense, KnowledgeArticle, TeamPost, WebForm, CompanySettings, Role, AttendanceRecord, PartnerDivisionData } from '../types';

/* ✅ Backend Base URL */
const API_URL = import.meta.env.VITE_API_URL;

/* ✅ Axios Instance */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* Helper */
const responseBody = (response: any) => response.data;

/* ---------------- AUTH ---------------- */

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
  await api.post('/api/auth/logout');
  return { success: true };
};

export const checkSession = async () => {
  try {
    const res = await api.get('/api/auth/session');
    return { data: res.data };
  } catch {
    return { data: { user: null } };
  }
};

/* ---------------- DATA ---------------- */

export const fetchAllData = async () =>
  api.get('/api/data/all').then(responseBody);

/* CRUD examples */
export const createProject = async (data: Project) =>
  api.post('/api/data/projects', data).then(responseBody);
