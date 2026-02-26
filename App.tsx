import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import CRM from './pages/CRM';
import Finance from './pages/Finance';
import Login from './pages/Login';
import Register from './pages/Register';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Employees from './pages/Employees';
import KnowledgeBase from './pages/KnowledgeBase';
import WebForms from './pages/WebForms';
import Settings from './pages/Settings';
import Home from './pages/Home';
import SuperAdmin from './pages/SuperAdmin';
import JobIntake from './pages/JobIntake';
import EditorDashboard from './pages/EditorDashboard';
import Testimonial from './pages/Testimonial';
import ProtectedRoute from './components/ProtectedRoute';

// Prevents logged in users from seeing Login/Register
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useApp();
  if (isLoading) return null;
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Landing Page is Public */}
      <Route path="/home" element={<Home />} />
      
      {/* Auth Pages */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      
      {/* App Shell - Default route redirects to Dashboard */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="job-intake" element={<JobIntake />} />
        <Route path="editor-dashboard" element={<EditorDashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="employees" element={<Employees />} />
        <Route path="crm" element={<CRM />} />
        <Route path="finance" element={<Finance />} />
        <Route path="forms" element={<WebForms />} />
        <Route path="team" element={<Team />} />
        <Route path="knowledge" element={<KnowledgeBase />} />
        <Route path="testimonial" element={<Testimonial />} />
        <Route path="settings" element={<Settings />} />
        <Route path="super-admin" element={<SuperAdmin />} />
      </Route>

      {/* Catch all - Redirect to home if not logged in, or dashboard if logged in */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;