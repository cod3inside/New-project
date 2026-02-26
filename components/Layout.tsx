
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, Bell, Sun, Moon, Menu, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Layout: React.FC = () => {
  const { user, theme, toggleTheme, globalCurrency, setGlobalCurrency, notifications, markNotificationRead } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Apply dark mode class to HTML body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
    setShowNotifications(false);
  }, [location]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 md:h-20 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors duration-300 z-30 relative">
          
          <div className="flex items-center gap-3">
            <button 
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden md:block max-w-md relative w-64 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 dark:text-white dark:placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 ml-4">
            {/* Global Currency Selector */}
            <select 
              className="bg-slate-100 dark:bg-slate-700 border-none rounded-md px-2 py-1.5 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer max-w-[80px] md:max-w-none"
              value={globalCurrency}
              onChange={(e) => setGlobalCurrency(e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="AUD">AUD</option>
              <option value="CAD">CAD</option>
              <option value="JPY">JPY</option>
              <option value="INR">INR</option>
              <option value="BDT">BDT (৳)</option>
            </select>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-600 mx-1 hidden md:block"></div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors relative hidden md:block p-1"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                   <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                     <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h3>
                     <span className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread</span>
                   </div>
                   <div className="max-h-80 overflow-y-auto">
                     {notifications.length === 0 ? (
                       <div className="p-6 text-center text-slate-400 text-sm">No notifications</div>
                     ) : (
                       notifications.map(n => (
                         <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`p-3 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                               <span className={`text-sm font-semibold ${n.type === 'warning' ? 'text-amber-600' : 'text-slate-800 dark:text-white'}`}>{n.title}</span>
                               <span className="text-[10px] text-slate-400">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{n.message}</p>
                         </div>
                       ))
                     )}
                   </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center pl-2 md:pl-4 border-l border-slate-100 dark:border-slate-700">
              <div className="text-right mr-3 hidden md:block">
                <div className="text-sm font-bold text-slate-800 dark:text-white">{user?.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</div>
              </div>
              
              {/* Profile Image Logic */}
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white dark:border-slate-600 shadow-sm object-cover"
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white dark:border-slate-600 shadow-sm bg-brand-600 flex items-center justify-center text-white text-xs md:text-sm font-bold">
                  {user?.name ? getInitials(user.name) : 'U'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 dark:text-slate-200 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;