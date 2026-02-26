
export enum ProjectStatus {
  NEW_PROJECT = 'New Project',
  PRE_PRODUCTION = 'Pre-Production',
  SHOOT_SCHEDULED = 'Picture Day Scheduled',
  SHOOT_COMPLETED = 'Picture Day Completed',
  POST_PRODUCTION = 'Editing / Post-Production',
  QA_REVIEW = 'QA Review',
  PROOFPIX_UPLOAD = 'Proofpix Upload',
  GALLERY_LIVE = 'Gallery Live',
  ARCHIVED = 'Archived'
}

export enum InvoiceStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  PAID = 'Paid',
  OVERDUE = 'Overdue'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export type Role = 'developer' | 'admin' | 'manager' | 'employee' | 'editor';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; 
  role: Role;
  avatar?: string;
  password?: string; 
  position?: string;
  department?: string;
  joinDate?: string;
  salary?: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'remote' | 'sick' | 'vacation' | 'holiday';

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  lateMinutes?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export interface Project {
  id: string;
  name: string; 
  client: string; 
  status: ProjectStatus;
  budget: number; 
  deadline: string; 
  description: string;
  progress: number;
  
  // Sports Specific Fields
  sportType?: string;
  season?: 'Spring' | 'Fall' | 'Winter' | 'Summer';
  location?: string;
  playerCount?: number;
  packageType?: string;
  contactEmail?: string;
  contactPhone?: string;
  rosterFile?: string; 
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface Task {
  id: string;
  projectId: string; 
  title: string;
  description?: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'waiting' | 'revisions' | 'review' | 'done';
  priority: Priority;
  dueDate: string;
  comments?: Comment[];
  history?: TaskActivity[];
  checklist?: TaskChecklistItem[];
  
  sourceLink?: string; 
  instructions?: string; 
  deliverableLink?: string; 
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  tags: string[];
  lastContacted: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: string; 
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  paymentInfo?: string; 
}

export interface InvoiceItem {
  id: string;
  description: string;
  folderName?: string; 
  fileType?: string;   
  quantity: number;
  price: number;
}

export interface Opportunity {
  id: string;
  title: string;
  value: number;
  stage: 'New' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won';
  contactId: string;
  probability: number;
  expectedCloseDate: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  lastUpdated: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface TeamPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  likedBy: string[]; 
  comments: Comment[];
}

export type FormFieldType = 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea';

export interface WebFormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
}

export interface WebForm {
  id: string;
  title: string;
  description: string;
  fields: WebFormField[];
  createdAt: string;
  submissionsCount: number;
  isActive: boolean;
}

export interface CompanySettings {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  taxId?: string;
  paymentInfo?: string; 
}

// Partner Division Types
export interface PartnerDivisionItem {
  id: string;
  desc: string;
  amount: string;
}

export interface PartnerDivisionData {
  income: string;
  shabujList: PartnerDivisionItem[];
  mashudList: PartnerDivisionItem[];
  lastUpdated?: string;
}