import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, AlertTriangle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate(); 
  
  // Fields initialized empty as requested. 
  // Credentials (admin@clippingfriend.com / Icp2026%%A) are handled in AppContext logic.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Tiny delay to simulate secure handshake for UI effect
    await new Promise(r => setTimeout(r, 600));

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials. Please try again.');
      setIsLoading(false);
    } else {
        // Successful login
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg bg-brand-600 shadow-brand-200">
             <Zap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-center mt-2 text-sm">Sign in to your FlowSpace workspace</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 animate-in fade-in zoom-in-95">
            <AlertTriangle className="w-4 h-4 shrink-0"/>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-brand-500 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-brand-500 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:bg-brand-700 shadow-brand-200 disabled:opacity-70 flex items-center justify-center group"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (
                <span className="flex items-center">
                    Sign In to Dashboard
                </span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account? <span className="text-slate-400 cursor-not-allowed" title="Registration disabled">Register now</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;