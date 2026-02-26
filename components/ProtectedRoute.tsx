import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Zap } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useApp();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center animate-bounce shadow-xl shadow-brand-500/20">
          <Zap className="text-white w-8 h-8" />
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
