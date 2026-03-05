'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Task, Contact, Invoice, User, ProjectStatus, InvoiceStatus, Priority, Opportunity, Expense, KnowledgeArticle, TeamPost, Comment, WebForm, CompanySettings, Role, AppNotification, AttendanceRecord, PartnerDivisionData } from '../types';
import * as api from '../services/api';
import { Zap } from 'lucide-react';

const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.00, 'EUR': 0.92, 'GBP': 0.79, 'AUD': 1.52, 'CAD': 1.36, 'JPY': 150.5, 'INR': 83.2, 'BDT': 117.5
};

interface AppState {
  user: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  contacts: Contact[];
  invoices: Invoice[];
  opportunities: Opportunity[];
  expenses: Expense[];
  articles: KnowledgeArticle[];
  posts: TeamPost[];
  webForms: WebForm[];
  testimonials: any[];
  companySettings: CompanySettings;
  attendance: AttendanceRecord[];
  partnerDivision: PartnerDivisionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  notifications: AppNotification[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  globalCurrency: string;
  setGlobalCurrency: (c: string) => void;
  formatAmount: (amount: number, currency?: string) => string;
  login: (identifier?: string, password?: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
  register: (data: Partial<User>, role?: Role) => Promise<{success: boolean, error?: string}>;
  resendVerification: (email: string) => Promise<boolean>;
  updateUserProfile: (data: Partial<User>) => void;
  addTeamMember: (data: {email: string, password: string, name: string, role: Role, position?: string, department?: string, salary?: number}) => Promise<{success: boolean, error?: string}>;
  updateTeamMember: (id: string, data: Partial<User>) => Promise<{success: boolean, error?: string}>;
  deleteTeamMember: (userId: string) => Promise<{success: boolean, error?: string}>;
  updateUserRole: (userId: string, role: Role) => void;
  markAttendance: (record: AttendanceRecord) => void;
  addProject: (p: Project) => void;
  createPhotographyWorkflow: (p: Project, secondaryAssigneeId: string) => void;
  deleteProject: (id: string) => void;
  updateProject: (p: Project) => void;
  addTask: (t: Task) => void;
  updateTask: (t: Task) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  toggleTaskChecklist: (taskId: string, itemId: string) => void;
  addTaskComment: (taskId: string, content: string) => void;
  sendToEditor: (taskId: string, editorId: string, sourceLink: string, instructions: string) => void;
  submitTaskForReview: (taskId: string, deliverableLink: string) => void;
  approveTask: (taskId: string) => void;
  requestTaskRevision: (taskId: string, comment: string) => void;
  addContact: (c: Contact) => void;
  addInvoice: (i: Invoice) => void;
  updateInvoice: (i: Invoice) => void;
  sendInvoice: (id: string) => void;
  deleteInvoice: (id: string) => void;
  addExpense: (e: Expense) => void;
  updateExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;
  toggleExpenseStatus: (id: string) => void;
  addArticle: (a: KnowledgeArticle) => void;
  addPost: (p: TeamPost) => void;
  deletePost: (id: string) => void;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  addWebForm: (f: WebForm) => void;
  deleteWebForm: (id: string) => void;
  incrementFormSubmission: (id: string) => void;
  updateCompanySettings: (settings: CompanySettings) => void;
  savePartnerDivisionData: (data: PartnerDivisionData) => Promise<void>;
  markNotificationRead: (id: string) => void;
  addTestimonial: (t: any) => void;
  updateTestimonial: (id: string, t: any) => void;
  deleteTestimonial: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [posts, setPosts] = useState<TeamPost[]>([]);
  const [webForms, setWebForms] = useState<WebForm[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  // FIX 1: partnerDivision now gets loaded from API (was always null before)
  const [partnerDivision, setPartnerDivision] = useState<PartnerDivisionData | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'Clipping Friend',
    address: 'M.A Jalil Tower, 3rd Floor\nMaluchi Bazar, Shibalaya, Manikganj',
    email: 'info@clippingfriend.com',
    phone: '+8801719845438',
    website: 'www.clippingfriend.com'
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [globalCurrency, setGlobalCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          await fetchAllData();
        }
      } catch (error) {
        console.error("Initialization error", error);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    init();
  }, []);

  const fetchAllData = async () => {
    try {
      // FIX 1: Added api.getPartnerDivision() to the fetch list
      const [invoicesRes, expensesRes, employeesRes, testimonialsRes, partnerDivisionRes] = await Promise.all([
        api.getInvoices().catch(() => []),
        api.getExpenses().catch(() => []),
        api.getEmployees().catch(() => []),
        api.getTestimonials().catch(() => []),
        api.getPartnerDivision().catch(() => null)   // ← NEW: load saved partner data
      ]);

      // Map Invoices
      const mappedInvoices = (invoicesRes || []).map((inv: any) => ({
        id: String(inv.id),
        clientName: inv.client_name,
        amount: Number(inv.amount),
        status: inv.status,
        dueDate: inv.due_date,
        description: inv.description,
        createdAt: inv.created_at,
        currency: 'USD',
        issueDate: inv.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        items: []
      }));
      setInvoices(mappedInvoices);

      // Map Expenses
      const mappedExpenses = (expensesRes || []).map((exp: any) => ({
        id: String(exp.id),
        description: exp.description || exp.title,
        amount: Number(exp.amount),
        category: exp.category,
        date: exp.date,
        status: exp.status || 'Pending',
        createdAt: exp.created_at
      }));
      setExpenses(mappedExpenses);

      // Map Employees to Users
      const mappedUsers = (employeesRes || []).map((emp: any) => ({
        id: String(emp.id),
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        position: emp.position,
        department: emp.department,
        salary: Number(emp.salary),
        joinDate: emp.join_date,
        status: emp.status,
        role: (emp.role || 'employee') as Role
      }));
      setUsers(mappedUsers);

      // Map Testimonials
      const mappedTestimonials = (testimonialsRes || []).map((t: any) => ({
        id: String(t.id),
        clientName: t.client_name,
        clientPosition: t.client_position,
        company: t.company,
        message: t.message,
        rating: t.rating,
        avatarUrl: t.avatar_url,
        isFeatured: !!t.is_featured,
        createdAt: t.created_at
      }));
      setTestimonials(mappedTestimonials);

      // FIX 1: Set partnerDivision from API response
      if (partnerDivisionRes) {
        setPartnerDivision(partnerDivisionRes);
      }

    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  // --- Auth ---
  const login = async (email?: string, password?: string) => {
    try {
      const res = await api.loginUser({ email, password });
      if (res.success && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        await fetchAllData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProjects([]); setTasks([]); setContacts([]); setInvoices([]);
    setExpenses([]); setUsers([]); setTestimonials([]);
    setPartnerDivision(null);
    setTimeout(() => setIsLoading(false), 500);
  };

  const register = async (data: Partial<User>, role: Role = 'employee') => {
    try {
      const res = await api.registerUser({ ...data, role });
      if (res.success) return { success: true };
      return { success: false, error: res.error || 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const addTeamMember = async (data: any) => {
    try {
      await api.createEmployee(data);
      await fetchAllData();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateTeamMember = async (id: string, data: Partial<User>) => {
    try {
      await api.updateEmployee(id, data);
      await fetchAllData();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteTeamMember = async (userId: string) => {
    try {
      await api.deleteEmployee(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateUserRole = async (userId: string, role: Role) => {
    api.updateEmployee(userId, { role }).catch(err => console.error("API Error", err));
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  };

  const updateUserProfile = async (data: Partial<User>) => {
    api.updateUserProfile(data).catch(err => console.error("API Error", err));
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    setUsers(prev => prev.map(u => u.id === user?.id ? { ...u, ...data } : u));
  };

  const markAttendance = async (record: AttendanceRecord) => {
    api.markAttendance(record.userId, record).catch(err => console.error("API Error", err));
    setAttendance(prev => {
      const exists = prev.findIndex(a => a.userId === record.userId && a.date === record.date);
      if (exists !== -1) {
        const updated = [...prev];
        updated[exists] = { ...updated[exists], ...record };
        return updated;
      }
      return [...prev, record];
    });
  };

  // --- Data Operations (CRUD) ---
  const addProject = async (p: Project) => {
    api.createProject(p).catch(err => console.error(err));
    setProjects(prev => [...prev, p]);
  };
  const updateProject = async (p: Project) => {
    api.updateProject(p.id, p).catch(err => console.error(err));
    setProjects(prev => prev.map(proj => proj.id === p.id ? p : proj));
  };
  const deleteProject = async (id: string) => {
    api.deleteProject(id).catch(err => console.error(err));
    setProjects(prev => prev.filter(p => p.id !== id));
  };
  const addTask = async (t: Task) => {
    api.createTask(t).catch(err => console.error(err));
    setTasks(prev => [...prev, t]);
  };
  const updateTask = async (t: Task) => {
    api.updateTask(t.id, t).catch(err => console.error(err));
    setTasks(prev => prev.map(task => task.id === t.id ? t : task));
  };
  const updateTaskStatus = async (id: string, status: Task['status']) => {
    api.updateTask(id, { status }).catch(err => console.error(err));
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const toggleTaskChecklist = async (taskId: string, itemId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.checklist) return;
    const newChecklist = task.checklist.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item);
    api.updateTask(taskId, { checklist: newChecklist }).catch(err => console.error(err));
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, checklist: newChecklist } : t));
  };

  const addTaskComment = async (id: string, content: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || !user) return;
    const c: Comment = { id: Math.random().toString(), authorId: user.id, authorName: user.name, content, timestamp: new Date().toISOString() };
    const newComments = [c, ...(task.comments || [])];
    api.updateTask(id, { comments: newComments }).catch(err => console.error(err));
    setTasks(prev => prev.map(t => t.id === id ? { ...t, comments: newComments } : t));
  };

  const sendToEditor = async (taskId: string, editorId: string, sourceLink: string, instructions: string) => {
    const editor = users.find(u => u.id === editorId);
    const updates = { assignee: editor?.name || 'Unassigned', sourceLink, instructions, status: 'todo' as const };
    api.updateTask(taskId, updates).catch(err => console.error(err));
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const submitTaskForReview = async (taskId: string, deliverableLink: string) => {
    const updates = { status: 'review' as const, deliverableLink };
    api.updateTask(taskId, updates).catch(err => console.error(err));
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const approveTask = async (taskId: string) => updateTaskStatus(taskId, 'done');

  const requestTaskRevision = async (taskId: string, comment: string) => {
    addTaskComment(taskId, `REVISION REQUESTED: ${comment}`);
    updateTaskStatus(taskId, 'revisions');
  };

  const addContact = async (c: Contact) => {
    api.createContact(c).catch(err => console.error(err));
    setContacts(prev => [...prev, c]);
  };
  const addInvoice = async (invoice: Invoice) => {
    api.createInvoice(invoice).catch(err => console.error(err));
    setInvoices(prev => [...prev, invoice]);
  };
  const updateInvoice = async (invoice: Invoice) => {
    api.updateInvoice(invoice.id, invoice).catch(err => console.error(err));
    setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
  };
  const sendInvoice = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (inv) updateInvoice({ ...inv, status: InvoiceStatus.SENT });
  };
  const deleteInvoice = async (id: string) => {
    api.deleteInvoice(id).catch(err => console.error(err));
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  // FIX 2: Renamed param from 'e' to 'expense' to avoid variable shadowing in .catch()
  const addExpense = async (expense: Expense) => {
    api.createExpense(expense).catch(err => console.error(err));
    setExpenses(prev => [...prev, expense]);
  };
  const updateExpense = async (expense: Expense) => {
    api.updateExpense(expense.id, expense).catch(err => console.error(err));
    setExpenses(prev => prev.map(exp => exp.id === expense.id ? expense : exp));
  };
  const deleteExpense = async (id: string) => {
    api.deleteExpense(id).catch(err => console.error(err));
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };
  const toggleExpenseStatus = async (id: string) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) updateExpense({ ...expense, status: expense.status === 'Approved' ? 'Pending' : 'Approved' });
  };

  const addOpportunity = async (o: Opportunity) => {
    api.createOpportunity(o).catch(err => console.error(err));
    setOpportunities(prev => [...prev, o]);
  };
  const updateOpportunityStage = async (id: string, stage: Opportunity['stage']) => {
    api.updateOpportunity(id, { stage }).catch(err => console.error(err));
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, stage } : o));
  };
  const addArticle = async (a: KnowledgeArticle) => {
    api.createArticle(a).catch(err => console.error(err));
    setArticles(prev => [...prev, a]);
  };
  const addPost = async (p: TeamPost) => {
    api.createPost(p).catch(err => console.error(err));
    setPosts(prev => [p, ...prev]);
  };
  const deletePost = async (id: string) => {
    api.deletePost(id).catch(err => console.error(err));
    setPosts(prev => prev.filter(p => p.id !== id));
  };
  const toggleLikePost = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const likedBy = post.likedBy.includes(user.id)
      ? post.likedBy.filter(id => id !== user.id)
      : [...post.likedBy, user.id];
    api.updatePost(postId, { likedBy }).catch(err => console.error(err));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likedBy } : p));
  };
  const addComment = async (postId: string, content: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const c = { id: Math.random().toString(), authorId: user.id, authorName: user.name, content, timestamp: new Date().toISOString() };
    const comments = [...post.comments, c];
    api.updatePost(postId, { comments }).catch(err => console.error(err));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments } : p));
  };
  const addWebForm = async (f: WebForm) => {
    api.createWebForm(f).catch(err => console.error(err));
    setWebForms(prev => [...prev, f]);
  };
  const deleteWebForm = async (id: string) => {
    api.deleteWebForm(id).catch(err => console.error(err));
    setWebForms(prev => prev.filter(f => f.id !== id));
  };
  const updateCompanySettings = async (s: CompanySettings) => {
    api.updateCompanySettings(s).catch(err => console.error(err));
    setCompanySettings(s);
  };

  // FIX 3: savePartnerDivisionData now properly awaits the API call
  // so failures are caught and not silently swallowed
  const savePartnerDivisionData = async (data: PartnerDivisionData) => {
    try {
      await api.savePartnerDivision(data);
      setPartnerDivision(data);
    } catch (err) {
      console.error("Failed to save partner division data:", err);
      throw err; // re-throw so Finance.tsx can show an error if needed
    }
  };

  // Testimonial operations
  const addTestimonial = async (t: any) => {
    api.createTestimonial(t).catch(err => console.error(err));
    setTestimonials(prev => [...prev, t]);
  };
  const updateTestimonial = async (id: string, t: any) => {
    api.updateTestimonial(id, t).catch(err => console.error(err));
    setTestimonials(prev => prev.map(item => item.id === id ? t : item));
  };
  const deleteTestimonial = async (id: string) => {
    api.deleteTestimonial(id).catch(err => console.error(err));
    setTestimonials(prev => prev.filter(item => item.id !== id));
  };

  const createPhotographyWorkflow = (project: Project, secondaryAssigneeId: string) => { addProject(project); };
  const incrementFormSubmission = (id: string) => {};
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const formatAmount = (amt: number, curr?: string) => {
    const t = curr || globalCurrency;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: t, maximumFractionDigits: 0 }).format(amt * (EXCHANGE_RATES[t] || 1));
  };
  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const resendVerification = async (email: string) => { return false; };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center z-[9999]">
        <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center animate-bounce shadow-xl shadow-brand-500/20">
          <Zap className="text-white w-8 h-8" />
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">FlowSpace is waking up...</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      user, users, projects, tasks, contacts, invoices, opportunities, expenses, articles, posts, webForms, testimonials,
      companySettings, attendance, partnerDivision, isAuthenticated: !!user, isLoading, notifications,
      theme, toggleTheme, globalCurrency, setGlobalCurrency, formatAmount,
      login, logout, register, addTeamMember, updateTeamMember, deleteTeamMember, updateUserProfile, updateUserRole,
      markAttendance, resendVerification,
      addProject, createPhotographyWorkflow, deleteProject, updateProject,
      addTask, updateTask, updateTaskStatus, toggleTaskChecklist, addTaskComment,
      sendToEditor, submitTaskForReview, approveTask, requestTaskRevision,
      addContact, addInvoice, updateInvoice, sendInvoice, deleteInvoice,
      addOpportunity, updateOpportunityStage,
      addExpense, updateExpense, deleteExpense, toggleExpenseStatus,
      addArticle, addPost, deletePost, toggleLikePost, addComment,
      addWebForm, deleteWebForm, incrementFormSubmission,
      updateCompanySettings, savePartnerDivisionData, markNotificationRead,
      addTestimonial, updateTestimonial, deleteTestimonial
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
