import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { User, Shield, Mail, Lock, Plus, Upload, Camera, X, Database, Copy, Check, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user, users, updateUserProfile, addTeamMember, updateUserRole } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'system'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    password: user?.password || ''
  });

  // Team Add State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'admin'|'manager'|'employee'|'editor'
  });
  const [createdUser, setCreatedUser] = useState<{email: string, password: string, role: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSaveProfile = () => {
    updateUserProfile(profileData);
    alert('Profile updated successfully!');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newUser.email || !newUser.password || !newUser.name) return;
    
    setIsLoading(true);
    setErrorMsg('');
    setCreatedUser(null);

    const result = await addTeamMember(newUser);
    
    setIsLoading(false);

    if (result.success) {
      setCreatedUser({
        email: newUser.email,
        password: newUser.password,
        role: newUser.role
      });
      // Reset form
      setNewUser({ name: '', email: '', password: '', role: 'employee' });
    } else {
      setErrorMsg(result.error || 'Failed to create user');
    }
  };

  const copyCredentials = () => {
    if(!createdUser) return;
    const text = `FlowSpace Login\nEmail: ${createdUser.email}\nPassword: ${createdUser.password}\nRole: ${createdUser.role}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your profile and team settings</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[500px]">
         <div className="flex border-b border-slate-200 dark:border-slate-700">
           <button 
             onClick={() => setActiveTab('profile')}
             className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'profile' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <User className="w-4 h-4 mr-2" />
             My Profile
           </button>
           <button 
             onClick={() => setActiveTab('team')}
             className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'team' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <Shield className="w-4 h-4 mr-2" />
             Team Management
           </button>
           {user?.role === 'developer' && (
             <button 
               onClick={() => setActiveTab('system')}
               className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'system' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
               <Database className="w-4 h-4 mr-2" />
               System Admin
             </button>
           )}
         </div>

         <div className="p-8">
           {activeTab === 'profile' && (
             <div className="max-w-xl">
                <div className="flex items-center mb-8 gap-6">
                  <div className="relative group">
                    {profileData.avatar ? (
                      <img 
                        src={profileData.avatar} 
                        alt="Avatar" 
                        className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-700 object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-700 bg-brand-600 flex items-center justify-center text-white text-3xl font-bold">
                        {getInitials(profileData.name)}
                      </div>
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-brand-600 transition-colors"
                      title="Change Photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Profile Picture</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Upload a photo to personalize your account.</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center"
                      >
                        <Upload className="w-3 h-3 mr-2" /> Upload
                      </button>
                      {profileData.avatar && (
                        <button 
                          onClick={() => setProfileData({...profileData, avatar: ''})}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center"
                        >
                          <X className="w-3 h-3 mr-2" /> Remove
                        </button>
                      )}
                    </div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                     <input 
                       className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                       value={profileData.name}
                       onChange={e => setProfileData({...profileData, name: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                     <input 
                       disabled
                       className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                       value={user?.email}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                     <div className="relative">
                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                       <input 
                         type="password"
                         className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                         value={profileData.password}
                         onChange={e => setProfileData({...profileData, password: e.target.value})}
                       />
                     </div>
                   </div>

                   <div className="pt-4">
                     <button onClick={handleSaveProfile} className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700 shadow-lg shadow-brand-200">Save Changes</button>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'team' && (
             <div>
                {user?.role === 'admin' || user?.role === 'developer' ? (
                  <div className="mb-8">
                     <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center"><UserPlus className="w-4 h-4 mr-2"/> Add Team Member</h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Create a new user account directly. You assign the password and role.
                        </p>
                        
                        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Name</label>
                            <input 
                              required
                              placeholder="John Doe"
                              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                              value={newUser.name}
                              onChange={e => setNewUser({...newUser, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email</label>
                            <input 
                              required
                              type="email"
                              placeholder="john@company.com"
                              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                              value={newUser.email}
                              onChange={e => setNewUser({...newUser, email: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Password</label>
                            <input 
                              required
                              type="text" 
                              placeholder="Create password"
                              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                              value={newUser.password}
                              onChange={e => setNewUser({...newUser, password: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Role</label>
                            <select 
                              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                              value={newUser.role}
                              onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="editor">Editor</option>
                              <option value="employee">Employee</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <button type="submit" disabled={isLoading} className="w-full bg-brand-600 text-white px-4 py-2.5 rounded-lg hover:bg-brand-700 flex items-center justify-center font-medium disabled:opacity-50">
                              {isLoading ? 'Creating...' : <><Plus className="w-4 h-4 mr-2" /> Create User</>}
                            </button>
                          </div>
                        </form>

                        {errorMsg && <p className="text-red-500 text-sm mt-3">{errorMsg}</p>}

                        {createdUser && (
                           <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 animate-in fade-in slide-in-from-top-2">
                              <div className="flex justify-between items-center mb-3">
                                <p className="text-sm font-bold text-green-700 dark:text-green-300 flex items-center"><Check className="w-4 h-4 mr-2"/> User Created Successfully</p>
                                <button onClick={copyCredentials} className="text-xs flex items-center text-green-700 dark:text-green-300 hover:underline">
                                  {copied ? <Check className="w-3 h-3 mr-1"/> : <Copy className="w-3 h-3 mr-1"/>} Copy Details
                                </button>
                              </div>
                              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-green-100 dark:border-green-900/50 space-y-1">
                                <p className="text-xs text-slate-500">Email: <span className="font-mono text-slate-800 dark:text-slate-200">{createdUser.email}</span></p>
                                <p className="text-xs text-slate-500">Password: <span className="font-mono text-slate-800 dark:text-slate-200">{createdUser.password}</span></p>
                                <p className="text-xs text-slate-500">Role: <span className="font-mono text-slate-800 dark:text-slate-200 capitalize">{createdUser.role}</span></p>
                              </div>
                              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                Please copy and send these credentials to your team member securely.
                              </p>
                           </div>
                        )}
                     </div>
                  </div>
                ) : (
                  <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-lg border border-amber-200 dark:border-amber-800">
                    You do not have permission to create users. Only Admins can manage the team.
                  </div>
                )}

                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Team Members</h3>
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">User</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Role</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                      {users.map(u => (
                        <tr key={u.id}>
                          <td className="px-6 py-4 flex items-center">
                            {u.avatar ? (
                               <img src={u.avatar} className="w-8 h-8 rounded-full mr-3 object-cover" alt={u.name}/>
                            ) : (
                               <div className="w-8 h-8 rounded-full bg-brand-600 mr-3 flex items-center justify-center text-white text-xs font-bold">
                                 {getInitials(u.name)}
                               </div>
                            )}
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">{u.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {(user?.role === 'admin' || user?.role === 'developer') && u.id !== user.id ? (
                               <select 
                                 className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand-500"
                                 value={u.role}
                                 onChange={(e) => updateUserRole(u.id, e.target.value as any)}
                               >
                                 <option value="admin">Admin</option>
                                 <option value="manager">Manager</option>
                                 <option value="editor">Editor</option>
                                 <option value="employee">Employee</option>
                               </select>
                            ) : (
                              <span className="capitalize text-sm text-slate-600 dark:text-slate-300 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded inline-block">{u.role}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
           )}

           {activeTab === 'system' && (
             <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                   <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">Advanced System Controls</h3>
                   <p className="text-sm text-red-600 dark:text-red-400 mb-6">These actions are for developer maintenance only.</p>
                   
                   <div className="flex gap-4">
                      <button 
                        onClick={() => navigate('/super-admin')}
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg font-bold hover:opacity-90 flex items-center"
                      >
                        <Database className="w-4 h-4 mr-2" /> Access Full Database
                      </button>
                      <button 
                        onClick={() => {
                          if(confirm("Are you sure? This will wipe all local data and reset the app to default state.")) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700"
                      >
                        Reset Application Data
                      </button>
                   </div>
                </div>
             </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default Settings;