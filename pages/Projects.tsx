import React, { useState } from 'react';
import { Plus, MoreVertical, Calendar, Users, MapPin, Send, X, FileText, Phone, Mail, Tag, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Project, ProjectStatus, Task, Priority } from '../types';

const Projects: React.FC = () => {
  const { projects, updateProject, deleteProject, user, sendToEditor, users, tasks, addTask, formatAmount } = useApp();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Editor Modal State
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editorData, setEditorData] = useState({ editorId: '', sourceLink: '', instructions: '' });

  // Project Detail Sidebar State
  const [viewProject, setViewProject] = useState<Project | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
        deleteProject(id);
        setViewProject(null);
    }
    setActiveMenu(null);
  };

  const handleStatusMove = (project: Project, direction: 'next' | 'prev') => {
    const statuses = Object.values(ProjectStatus);
    const currentIndex = statuses.indexOf(project.status);
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= 0 && nextIndex < statuses.length) {
      updateProject({ ...project, status: statuses[nextIndex] });
    }
  };

  const openEditorModal = (projectId: string) => {
    setSelectedProjectId(projectId);
    setEditorData({ editorId: '', sourceLink: '', instructions: '' });
    setShowEditorModal(true);
  };

  const handleSendToEditor = () => {
    if (!selectedProjectId || !editorData.editorId || !editorData.sourceLink) return;
    
    const ppTask = tasks.find(t => t.projectId === selectedProjectId && (t.title.includes('Post-Production') || t.title.includes('Editing')));
    
    if (ppTask) {
      sendToEditor(ppTask.id, editorData.editorId, editorData.sourceLink, editorData.instructions);
    } else {
      const editor = users.find(u => u.id === editorData.editorId);
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        projectId: selectedProjectId,
        title: 'Post-Production / Editing',
        description: 'Editing task generated from Active Jobs board.',
        assignee: editor?.name || 'Unassigned',
        status: 'todo',
        priority: Priority.HIGH,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        comments: [{
            id: Math.random().toString(),
            authorId: user?.id || 'admin',
            authorName: user?.name || 'Admin',
            content: `Assigned to ${editor?.name} with instructions: ${editorData.instructions}`,
            timestamp: new Date().toISOString()
        }],
        history: [],
        checklist: [
          {id:'pp1', text:'Import & Initial Cull', completed: false},
          {id:'pp2', text:'Green screen pulls', completed: false},
          {id:'pp3', text:'Sandwich layer comps', completed: false},
          {id:'pp4', text:'Team banners', completed: false}
        ],
        sourceLink: editorData.sourceLink,
        instructions: editorData.instructions
      };
      addTask(newTask);
    }
    
    setShowEditorModal(false);
    alert("Project sent to Editor Dashboard successfully.");
  };

  const workflowColumns = [
    { title: 'New', status: ProjectStatus.NEW_PROJECT, color: 'border-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-900/10' },
    { title: 'Pre-Prod', status: ProjectStatus.PRE_PRODUCTION, color: 'border-green-500', bg: 'bg-green-50/50 dark:bg-green-900/10' },
    { title: 'Scheduled', status: ProjectStatus.SHOOT_SCHEDULED, color: 'border-orange-500', bg: 'bg-orange-50/50 dark:bg-orange-900/10' },
    { title: 'Shot', status: ProjectStatus.SHOOT_COMPLETED, color: 'border-yellow-500', bg: 'bg-yellow-50/50 dark:bg-yellow-900/10' },
    { title: 'Editing', status: ProjectStatus.POST_PRODUCTION, color: 'border-purple-600', bg: 'bg-purple-50/50 dark:bg-purple-900/10' },
    { title: 'QA', status: ProjectStatus.QA_REVIEW, color: 'border-indigo-500', bg: 'bg-indigo-50/50 dark:bg-indigo-900/10' },
    { title: 'Proofing', status: ProjectStatus.PROOFPIX_UPLOAD, color: 'border-amber-700', bg: 'bg-amber-50/50 dark:bg-amber-900/10' },
    { title: 'Live', status: ProjectStatus.GALLERY_LIVE, color: 'border-emerald-500', bg: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
    { title: 'Archived', status: ProjectStatus.ARCHIVED, color: 'border-slate-500', bg: 'bg-slate-50/50 dark:bg-slate-800/30' },
  ];

  const StatusColumn: React.FC<{ title: string; status: ProjectStatus; color: string; bg: string }> = ({ title, status, color, bg }) => {
    const columnProjects = projects.filter(p => p.status === status);
    
    return (
      <div className={`flex-shrink-0 w-[280px] md:w-[300px] rounded-xl flex flex-col h-full snap-center ${bg} border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm`}>
        <div className={`p-3 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-10 rounded-t-xl ${bg}`}>
          <div className={`flex items-center gap-2 border-l-4 pl-2 ${color}`}>
             <h3 className="font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wide">{title}</h3>
          </div>
          <span className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{columnProjects.length}</span>
        </div>
        
        <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
          {columnProjects.map(project => (
            <div 
              key={project.id} 
              onClick={() => setViewProject(project)}
              className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-700 transition-all cursor-pointer group relative"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded tracking-tight">{project.sportType || 'General'}</span>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   {status === ProjectStatus.POST_PRODUCTION && (user?.role === 'admin' || user?.role === 'developer') && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); openEditorModal(project.id); }}
                       className="p-1 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded"
                       title="Send to Editor"
                     >
                       <Send className="w-3 h-3" />
                     </button>
                   )}
                   <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === project.id ? null : project.id); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded">
                     <MoreVertical className="w-3 h-3 text-slate-400" />
                   </button>
                </div>
                
                {activeMenu === project.id && (
                  <div className="absolute right-2 top-8 bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-600 rounded-lg py-1 w-32 z-50 animate-in zoom-in-95 duration-200">
                    <button onClick={(e) => { e.stopPropagation(); handleStatusMove(project, 'next'); setActiveMenu(null); }} className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Move Next</button>
                    <button onClick={(e) => { e.stopPropagation(); handleStatusMove(project, 'prev'); setActiveMenu(null); }} className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Move Back</button>
                    {user?.role === 'admin' && (
                       <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">Delete</button>
                    )}
                  </div>
                )}
              </div>
              
              <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1 line-clamp-2 leading-tight">{project.name}</h4>
              
              <div className="grid grid-cols-2 gap-1 mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
                 <div className="flex items-center text-[10px] text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3 h-3 mr-1 opacity-70"/> {new Date(project.deadline).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                 </div>
                 <div className="flex items-center justify-end text-[10px] text-slate-500 dark:text-slate-400">
                    <Users className="w-3 h-3 mr-1 opacity-70"/> {project.playerCount || 0}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4 px-1 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Active Jobs</h1>
        </div>
        <button 
          onClick={() => navigate('/job-intake')}
          className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-lg flex items-center shadow-lg shadow-brand-200/50 transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">New Intake</span>
        </button>
      </div>

      {/* Main Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2 custom-scrollbar">
        <div className="flex h-full gap-3 px-1 snap-x snap-mandatory min-w-max">
          {workflowColumns.map(col => (
            <StatusColumn key={col.status} title={col.title} status={col.status} color={col.color} bg={col.bg} />
          ))}
        </div>
      </div>

      {/* Project Details Sidebar */}
      {viewProject && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setViewProject(null)} />
           <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start sticky top-0 bg-white dark:bg-slate-800 z-10 shadow-sm">
                 <div>
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{viewProject.name}</h2>
                   <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-bold uppercase bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 px-2 py-1 rounded border border-brand-200 dark:border-brand-800">{viewProject.status}</span>
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">{viewProject.sportType}</span>
                   </div>
                 </div>
                 <button onClick={() => setViewProject(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 p-1.5 rounded-full transition-colors">
                   <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-6 space-y-8">
                 {/* Key Stats */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Picture Day</div>
                       <div className="font-semibold flex items-center text-slate-800 dark:text-white"><Calendar className="w-4 h-4 mr-2 text-brand-500"/> {new Date(viewProject.deadline).toLocaleDateString()}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Est. Revenue</div>
                       <div className="font-semibold text-slate-800 dark:text-white">{formatAmount(viewProject.budget)}</div>
                    </div>
                 </div>

                 {/* Contact Info */}
                 <div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center text-sm"><Users className="w-4 h-4 mr-2 text-slate-400"/> Point of Contact</h3>
                    <div className="bg-white dark:bg-slate-700/50 p-4 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
                       <div className="font-bold text-slate-900 dark:text-white mb-2">{viewProject.client}</div>
                       <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                          {viewProject.contactEmail && <div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-slate-400"/> <a href={`mailto:${viewProject.contactEmail}`} className="hover:text-brand-500 hover:underline">{viewProject.contactEmail}</a></div>}
                          {viewProject.contactPhone && <div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-slate-400"/> {viewProject.contactPhone}</div>}
                       </div>
                    </div>
                 </div>

                 {/* Logistics */}
                 <div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center text-sm"><Info className="w-4 h-4 mr-2 text-slate-400"/> Logistics</h3>
                    <div className="bg-white dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
                       <div className="flex justify-between p-3">
                          <span className="text-slate-500 text-sm">Location</span>
                          <span className="text-slate-800 dark:text-white font-medium text-sm text-right">{viewProject.location}</span>
                       </div>
                       <div className="flex justify-between p-3">
                          <span className="text-slate-500 text-sm">Player Count</span>
                          <span className="text-slate-800 dark:text-white font-medium text-sm">{viewProject.playerCount}</span>
                       </div>
                       <div className="flex justify-between p-3">
                          <span className="text-slate-500 text-sm">Package</span>
                          <span className="text-slate-800 dark:text-white font-medium text-sm text-right">{viewProject.packageType}</span>
                       </div>
                       <div className="flex justify-between p-3">
                          <span className="text-slate-500 text-sm">Season</span>
                          <span className="text-slate-800 dark:text-white font-medium text-sm">{viewProject.season}</span>
                       </div>
                    </div>
                 </div>

                 {/* Notes */}
                 <div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center text-sm"><FileText className="w-4 h-4 mr-2 text-slate-400"/> Notes</h3>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                       {viewProject.description || "No special notes recorded."}
                    </div>
                 </div>

                 {/* Actions Footer */}
                 <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                    <button 
                      onClick={() => { handleDelete(viewProject.id); }}
                      className="w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-colors text-sm"
                    >
                      Delete Project
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showEditorModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                   <Send className="w-5 h-5 mr-2 text-purple-600" /> Send for Editing
                 </h2>
                 <button onClick={() => setShowEditorModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
              </div>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Assign Editor</label>
                    <select 
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                      value={editorData.editorId}
                      onChange={e => setEditorData({...editorData, editorId: e.target.value})}
                    >
                       <option value="">Select Editor</option>
                       {users.filter(u => u.role === 'editor' || u.role === 'admin').map(u => (
                         <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                       ))}
                    </select>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Source Files Link</label>
                    <input 
                      placeholder="https://dropbox.com/sh/..."
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                      value={editorData.sourceLink}
                      onChange={e => setEditorData({...editorData, sourceLink: e.target.value})}
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Instructions</label>
                    <textarea 
                      placeholder="Crop style, color grade, deadlines..."
                      rows={4}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                      value={editorData.instructions}
                      onChange={e => setEditorData({...editorData, instructions: e.target.value})}
                    />
                 </div>

                 <button 
                   onClick={handleSendToEditor}
                   disabled={!editorData.editorId || !editorData.sourceLink}
                   className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center"
                 >
                   Send Assignment <ArrowRight className="w-4 h-4 ml-2"/>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Projects;