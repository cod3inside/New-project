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
  addOpportunity: (o: Opportunity) => void;
  updateOpportunityStage: (id: string, stage: Opportunity['stage']) => void;
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
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
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
        const { data } = await api.checkSession();
        if (data.user) {
          setUser(data.user);
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
      const { data } = await api.fetchAllData();
      
      setProjects(data.projects || []);
      setTasks(data.tasks || []);
      setContacts(data.contacts || []);
      setInvoices(data.invoices || []);
      setExpenses(data.expenses || []);
      setUsers(data.profiles || []);
      setOpportunities(data.opportunities || []);
      setArticles(data.articles || []);
      setPosts(data.posts || []);
      setWebForms(data.web_forms || []);
      setAttendance(data.attendance || []);
      if (data.company_settings) setCompanySettings(data.company_settings);

      // Fetch Partner Division Data
      const pdData = await api.getPartnerDivision();
      if(pdData) setPartnerDivision(pdData);

    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };
  
  // --- Auth ---
  const login = async (email?: string, password?: string) => {
    try {
      const res = await api.loginUser({ email, password });
      if (res.success && res.data?.user) {
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
    await api.logoutUser();
    setUser(null);
    setProjects([]); setTasks([]); setContacts([]); setInvoices([]);
    setTimeout(() => setIsLoading(false), 500);
  };

  const register = async (data: Partial<User>, role: Role = 'employee') => {
    try {
      const res = await api.registerUser({ ...data, role });
      if (res.success) {
        return { success: true };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };
  
  const addTeamMember = async (data: any) => {
      try {
          const res = await api.addTeamMember(data);
          if (res.success) {
            await fetchAllData();
            return { success: true };
          }
          return { success: false, error: res.error };
      } catch (error: any) {
          return { success: false, error: error.message };
      }
  };

  const updateTeamMember = async (id: string, data: Partial<User>) => {
      try {
          const res = await api.updateUser(id, data);
          if (res.success) {
            setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
            return { success: true };
          }
          return { success: false, error: res.error };
      } catch (error: any) {
          return { success: false, error: error.message };
      }
  };

  const deleteTeamMember = async (userId: string) => {
      try {
          const res = await api.deleteUser(userId);
          if (res.success) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            return { success: true };
          }
          return { success: false, error: res.error };
      } catch (error: any) {
          return { success: false, error: error.message };
      }
  };

  const updateUserRole = async (userId: string, role: Role) => {
      api.updateUserRole(userId, role).catch(e => console.error("API Error", e));
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  };
  
  const updateUserProfile = async (data: Partial<User>) => {
      api.updateUserProfile(data).catch(e => console.error("API Error", e));
      if(user) setUser({...user, ...data});
      setUsers(prev => prev.map(u => u.id === user?.id ? { ...u, ...data } : u));
  }

  // Attendance
  const markAttendance = async (record: AttendanceRecord) => {
      api.markAttendance(record).catch(e => console.error("API Error", e));
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
    api.createProject(p).catch(e => console.error(e));
    setProjects(prev => [...prev, p]);
  };
  const updateProject = async (p: Project) => {
    api.updateProject(p.id, p).catch(e => console.error(e));
    setProjects(prev => prev.map(proj => proj.id === p.id ? p : proj));
  };
  const deleteProject = async (id: string) => {
    api.deleteProject(id).catch(e => console.error(e));
    setProjects(prev => prev.filter(p => p.id !== id));
  };
  const addTask = async (t: Task) => {
    api.createTask(t).catch(e => console.error(e));
    setTasks(prev => [...prev, t]);
  };
  const updateTask = async (t: Task) => {
    api.updateTask(t.id, t).catch(e => console.error(e));
    setTasks(prev => prev.map(task => task.id === t.id ? t : task));
  };
  const updateTaskStatus = async (id: string, status: Task['status']) => {
    api.updateTask(id, { status }).catch(e => console.error(e));
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };
  
  const toggleTaskChecklist = async (taskId: string, itemId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.checklist) return;
    const newChecklist = task.checklist.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item);
    api.updateTask(taskId, { checklist: newChecklist }).catch(e => console.error(e));
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, checklist: newChecklist } : t));
  };
  
  const addTaskComment = async (id: string, content: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || !user) return;
    const c: Comment = { id: Math.random().toString(), authorId: user.id, authorName: user.name, content, timestamp: new Date().toISOString() };
    const newComments = [c, ...(task.comments || [])];
    api.updateTask(id, { comments: newComments }).catch(e => console.error(e));
    setTasks(prev => prev.map(t => t.id === id ? { ...t, comments: newComments } : t));
  };

  const sendToEditor = async (taskId: string, editorId: string, sourceLink: string, instructions: string) => {
    const editor = users.find(u => u.id === editorId);
    const updates = { assignee: editor?.name || 'Unassigned', sourceLink, instructions, status: 'todo' as const };
    api.updateTask(taskId, updates).catch(e => console.error(e));
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const submitTaskForReview = async (taskId: string, deliverableLink: string) => {
    const updates = { status: 'review' as const, deliverableLink };
    api.updateTask(taskId, updates).catch(e => console.error(e));
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };
  
  const approveTask = async (taskId: string) => updateTaskStatus(taskId, 'done');
  
  const requestTaskRevision = async (taskId: string, comment: string) => {
     addTaskComment(taskId, `REVISION REQUESTED: ${comment}`);
     updateTaskStatus(taskId, 'revisions');
  };

  const addContact = async (c: Contact) => { 
      api.createContact(c).catch(e => console.error(e));
      setContacts(prev => [...prev, c]); 
  }
  const addInvoice = async (i: Invoice) => { 
      api.createInvoice(i).catch(e => console.error(e));
      setInvoices(prev => [...prev, i]); 
  }
  const updateInvoice = async (i: Invoice) => { 
      api.updateInvoice(i.id, i).catch(e => console.error(e));
      setInvoices(prev => prev.map(inv => inv.id === i.id ? i : inv));
  }
  const sendInvoice = (id: string) => {
      const inv = invoices.find(i=>i.id===id);
      if(inv) updateInvoice({ ...inv, status: InvoiceStatus.SENT });
  }
  const addExpense = async (e: Expense) => { 
      api.createExpense(e).catch(e => console.error(e));
      setExpenses(prev => [...prev, e]);
  }
  const updateExpense = async (e: Expense) => { 
      api.updateExpense(e.id, e).catch(e => console.error(e));
      setExpenses(prev => prev.map(exp => exp.id === e.id ? e : exp));
  }
  const deleteExpense = async (id: string) => { 
      api.deleteExpense(id).catch(e => console.error(e));
      setExpenses(prev => prev.filter(e => e.id !== id));
  }
  const toggleExpenseStatus = async (id: string) => { 
    const expense = expenses.find(e => e.id === id);
    if(expense) updateExpense({...expense, status: expense.status === 'Approved' ? 'Pending' : 'Approved'});
  }
  const addOpportunity = async (o: Opportunity) => { 
      api.createOpportunity(o).catch(e => console.error(e));
      setOpportunities(prev => [...prev, o]);
  }
  const updateOpportunityStage = async (id: string, stage: Opportunity['stage']) => {
    api.updateOpportunity(id, { stage }).catch(e => console.error(e));
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, stage } : o));
  };
  const addArticle = async (a: KnowledgeArticle) => { 
      api.createArticle(a).catch(e => console.error(e));
      setArticles(prev => [...prev, a]);
  }
  const addPost = async (p: TeamPost) => { 
      api.createPost(p).catch(e => console.error(e));
      setPosts(prev => [p, ...prev]);
  }
  const deletePost = async (id: string) => { 
      api.deletePost(id).catch(e => console.error(e));
      setPosts(prev => prev.filter(p => p.id !== id));
  }
  const toggleLikePost = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if(!post) return;
    const likedBy = post.likedBy.includes(user.id) ? post.likedBy.filter(id => id !== user.id) : [...post.likedBy, user.id];
    api.updatePost(postId, { likedBy }).catch(e => console.error(e));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likedBy } : p));
  };
  const addComment = async (postId: string, content: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const c = { id: Math.random().toString(), authorId: user.id, authorName: user.name, content, timestamp: new Date().toISOString() };
    const comments = [...post.comments, c];
    api.updatePost(postId, { comments }).catch(e => console.error(e));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments } : p));
  };
  const addWebForm = async (f: WebForm) => { 
      api.createWebForm(f).catch(e => console.error(e));
      setWebForms(prev => [...prev, f]);
  }
  const deleteWebForm = async (id: string) => { 
      api.deleteWebForm(id).catch(e => console.error(e));
      setWebForms(prev => prev.filter(f => f.id !== id));
  }
  const updateCompanySettings = async (s: CompanySettings) => { 
      api.updateCompanySettings(s).catch(e => console.error(e));
      setCompanySettings(s); 
  }
  const savePartnerDivisionData = async (data: PartnerDivisionData) => {
      api.savePartnerDivision(data).catch(e => console.error(e));
      setPartnerDivision(data);
  }

  const createPhotographyWorkflow = (project: Project, secondaryAssigneeId: string) => { addProject(project); };
  const incrementFormSubmission = (id: string) => { };
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const formatAmount = (amt: number, curr?: string) => { const t = curr || globalCurrency; return new Intl.NumberFormat('en-US', { style: 'currency', currency: t, maximumFractionDigits: 0 }).format(amt * (EXCHANGE_RATES[t] || 1)); };
  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const resendVerification = async(email: string) => { return false; };

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
      user, users, projects, tasks, contacts, invoices, opportunities, expenses, articles, posts, webForms, companySettings, attendance, partnerDivision, isAuthenticated: !!user, isLoading, notifications,
      theme, toggleTheme, globalCurrency, setGlobalCurrency, formatAmount,
      login, logout, register, addTeamMember, updateTeamMember, deleteTeamMember, updateUserProfile, updateUserRole, markAttendance, resendVerification,
      addProject, createPhotographyWorkflow, deleteProject, updateProject, addTask, updateTask, updateTaskStatus, toggleTaskChecklist, addTaskComment,
      sendToEditor, submitTaskForReview, approveTask, requestTaskRevision,
      addContact, addInvoice, updateInvoice, sendInvoice, addOpportunity, updateOpportunityStage, addExpense, updateExpense, deleteExpense, toggleExpenseStatus,
      addArticle, addPost, deletePost, toggleLikePost, addComment, addWebForm, deleteWebForm, incrementFormSubmission, updateCompanySettings, savePartnerDivisionData, markNotificationRead
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