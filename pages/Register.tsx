import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, AlertTriangle, Loader2, CheckCircle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Block registration
    setError('New registration is not allowed. Please contact the administrator.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-4 shadow-lg">
             <Lock className="text-slate-500 dark:text-slate-400 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Registration Closed</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">New accounts cannot be created at this time.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0"/>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 opacity-50 pointer-events-none">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input disabled type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border rounded-lg outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input disabled type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="john@example.com" />
          </div>
          
          <button disabled type="submit" className="w-full bg-slate-400 text-white font-bold py-3.5 rounded-xl cursor-not-allowed mt-4">
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
           <Link to="/login" className="text-brand-600 font-bold hover:underline">Return to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;