'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Zap, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
  const { register } = useApp();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    const result = await register({ email, password, name });
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setError(result.error || 'Registration failed. Try a different email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
             <Zap className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Join FlowSpace to grow your business</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0"/>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-2 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800 text-green-600 dark:text-green-400 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0"/>
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
            <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="••••••••" />
          </div>
          
          <button type="submit" disabled={isLoading || success} className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:bg-brand-700 disabled:opacity-70 flex justify-center items-center mt-4">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Started'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
           <Link href="/login" className="text-slate-500 hover:text-brand-600 dark:text-slate-400 transition-colors">Already have an account? Sign In</Link>
        </div>
      </div>
    </div>
  );
}