import React from 'react';
import { useApp } from '../context/AppContext';
import { Database, Shield, Lock, Search } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const SuperAdmin: React.FC = () => {
  const { user, users } = useApp();

  // Security Check: Redirect if not developer
  if (user?.role !== 'developer') {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase mb-4 border border-red-200">
          <Shield className="w-3 h-3 mr-1" /> Developer Area
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">User Database (Master View)</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Full access to all registered accounts and stored credentials. 
          <span className="text-red-500 font-bold ml-1">CONFIDENTIAL</span>
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
           <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
             <Database className="w-4 h-4 mr-2" /> Registered Accounts
           </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">User ID</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">Name</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">Email (Login)</th>
                <th className="px-6 py-3 text-xs font-bold text-red-600 dark:text-red-400 uppercase">Password</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{u.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded px-2 py-1 max-w-fit">
                      <Lock className="w-3 h-3 text-red-400 mr-2" />
                      <span className="font-mono text-sm text-red-600 dark:text-red-400 font-bold">{u.password}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      u.role === 'developer' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;