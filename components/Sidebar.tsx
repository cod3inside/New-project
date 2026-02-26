import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, FileText, Settings, LogOut, Zap, CheckSquare, Book, MessageSquare, ClipboardList, Database, PlusCircle, Monitor, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sidebar: React.FC = () => {
  const { logout, user } = useApp();
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/job-intake', icon: PlusCircle, label: 'New Job Intake' },
    { to: '/projects', icon: Briefcase, label: 'Active Jobs' },
    { to: '/tasks', icon: CheckSquare, label: 'All Tasks' },
    { to: '/employees', icon: UserCheck, label: 'Employees' },
    { to: '/crm', icon: Users, label: 'CRM' },
    { to: '/finance', icon: FileText, label: 'Finance' }, 
    { to: '/forms', icon: ClipboardList, label: 'Forms' },
    { to: '/team', icon: MessageSquare, label: 'Team' },
    { to: '/testimonial', icon: FileText, label: 'Testimonial' },
    { to: '/knowledge', icon: Book, label: 'Knowledge Base' },
  ];

  // Editor Dashboard
  navItems.splice(3, 0, { to: '/editor-dashboard', icon: Monitor, label: 'Editor Dash' });

  // Developer Only
  if (user?.role === 'developer' || user?.role === 'admin' || user?.email === 'admin@flowspace.app') {
    navItems.push({ to: '/super-admin', icon: Database, label: 'User Database' });
  }

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || (path !== '/' && pathname?.startsWith(path));
    return `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 font-medium' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
    }`;
  };

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto transition-colors duration-300">
      <div className="flex items-center px-6 py-6 border-b border-slate-100 dark:border-slate-700 shrink-0 h-20">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center mr-3 shadow-sm shadow-brand-500/30">
          <Zap className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">FlowSpace</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <Link 
            key={item.to} 
            to={item.to} 
            className={getLinkClass(item.to)}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-4 py-6 border-t border-slate-100 dark:border-slate-700 shrink-0">
        <Link to="/settings" className="flex items-center space-x-3 px-4 py-3 w-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors mb-2">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
        </Link>
        <button 
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;