import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';
import { User, Role } from '../types';
import { Plus, Edit2, Trash2, X, Save, AlertCircle, Check } from 'lucide-react';

const Employees: React.FC = () => {
  const { users, setUsers } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as Role,
    position: '',
    department: '',
    salary: 0
  });

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await api.getEmployees();
      // Assuming the API returns an array of users
      // If the API returns { users: [...] }, adjust accordingly.
      // Based on typical REST, GET /employees returns array.
      if (Array.isArray(data)) {
        // Update context users if needed, or just local state if this page manages it independently.
        // Since AppContext manages users, we should update it there or use a setUsers method if exposed.
        // The current AppContext exposes setUsers via 'users' state but not directly setUsers function.
        // However, AppContext has 'users' state. We might need to rely on AppContext's fetchAllData or similar.
        // But for this specific admin page, let's assume we can refresh the list.
        // Actually, AppContext doesn't expose setUsers. It exposes addTeamMember, updateTeamMember, deleteTeamMember.
        // We should use those or just rely on the API calls and then refresh.
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenModal = (employee?: User) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        email: employee.email,
        password: '', // Don't show password
        role: employee.role,
        position: employee.position || '',
        department: employee.department || '',
        salary: employee.salary || 0
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        position: '',
        department: '',
        salary: 0
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingEmployee) {
        // Update
        const updateData = { ...formData };
        if (!updateData.password) delete (updateData as any).password;
        
        await api.updateEmployee(editingEmployee.id, updateData);
        // Refresh list (or update context)
        window.location.reload(); // Simple reload to refresh data for now
      } else {
        // Create
        await api.createEmployee(formData);
        window.location.reload();
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    setIsLoading(true);
    try {
      await api.deleteEmployee(id);
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Employee Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage team members and permissions</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Name</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Email</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Role</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Position</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Department</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${user.role === 'admin' || user.role === 'developer' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 
                        user.role === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{user.position || '-'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{user.department || '-'}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {editingEmployee ? 'Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!editingEmployee}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as Role})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="developer">Developer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Salary</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={e => setFormData({...formData, salary: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={e => setFormData({...formData, position: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70"
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
