import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Clock, AlertCircle, Upload, FileText, ExternalLink, Download, PlayCircle, Send, XCircle, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { Task } from '../types';

const EditorDashboard: React.FC = () => {
  const { user, tasks, updateTaskStatus, toggleTaskChecklist, projects, addTaskComment, submitTaskForReview, approveTask, requestTaskRevision } = useApp();
  const [rejectModalOpen, setRejectModalOpen] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const isEditor = user?.role === 'editor';
  const isAdmin = user?.role === 'admin' || user?.role === 'developer';

  const myTasks = tasks.filter(t => {
    const isEditingTask = t.title.includes('Post-Production') || t.title.includes('Editing');
    if (!isEditingTask) return false;
    if (isEditor) return t.assignee === user?.name;
    if (isAdmin) return true; 
    return false;
  });

  const getProjectName = (pid: string) => projects.find(p => p.id === pid)?.name || 'Unknown Project';

  const handleStatusUpdate = (taskId: string, newStatus: Task['status']) => {
    updateTaskStatus(taskId, newStatus);
  };

  const handleSubmitReview = (taskId: string) => {
    const link = prompt("Enter Dropbox/WeTransfer Link for Completed Files:");
    if (link) {
      submitTaskForReview(taskId, link);
    }
  };

  const handleRequestRevision = () => {
    if (rejectModalOpen && rejectComment) {
      requestTaskRevision(rejectModalOpen, rejectComment);
      setRejectModalOpen(null);
      setRejectComment('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 md:px-0">
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Editor Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isEditor ? `Welcome back, ${user?.name}. Manage your editing queue.` : 'Overview of active editing jobs.'}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
           <span className="text-sm text-slate-500 dark:text-slate-400">Active Queue:</span>
           <span className="ml-2 font-bold text-brand-600 text-lg">{myTasks.filter(t => t.status !== 'done').length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {myTasks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">All caught up!</h3>
            <p className="text-slate-500 mt-2">No pending editing tasks assigned to you.</p>
          </div>
        ) : (
          myTasks.map(task => (
            <div key={task.id} className={`bg-white dark:bg-slate-800 rounded-xl shadow-md border overflow-hidden transition-all ${task.status === 'review' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200 dark:border-slate-700 hover:shadow-lg'}`}>
              
              {/* Header */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-4">
                 <div className="flex items-center gap-3">
                    <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-purple-200 dark:border-purple-800">
                      {getProjectName(task.projectId)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center border ${
                         task.status === 'todo' ? 'bg-slate-200 text-slate-700 border-slate-300' :
                         task.status === 'in-progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                         task.status === 'waiting' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                         task.status === 'review' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                         task.status === 'revisions' ? 'bg-red-100 text-red-700 border-red-200' : 
                         'bg-green-100 text-green-700 border-green-200'
                       }`}>
                         {task.status === 'waiting' ? 'Uploading' : task.status}
                         {task.status === 'review' && <AlertCircle className="w-3 h-3 ml-1 animate-pulse"/>}
                    </span>
                 </div>
                 
                 <div className="flex flex-wrap gap-2">
                    {/* WORKFLOW BUTTONS */}
                    {(isEditor || isAdmin) && task.status !== 'done' && task.status !== 'review' && (
                      <>
                        {task.status === 'todo' && (
                          <button onClick={() => handleStatusUpdate(task.id, 'in-progress')} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-transform hover:-translate-y-0.5">
                            <PlayCircle className="w-4 h-4 mr-2" /> Start Editing
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button onClick={() => handleStatusUpdate(task.id, 'waiting')} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-transform hover:-translate-y-0.5">
                            <Upload className="w-4 h-4 mr-2" /> Start Uploading
                          </button>
                        )}
                        {(task.status === 'waiting' || task.status === 'in-progress' || task.status === 'revisions') && (
                          <button onClick={() => handleSubmitReview(task.id)} className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 shadow-sm animate-pulse">
                            <Send className="w-4 h-4 mr-2" /> Submit Review
                          </button>
                        )}
                      </>
                    )}

                    {/* ADMIN REVIEW */}
                    {isAdmin && task.status === 'review' && (
                      <>
                        <button onClick={() => approveTask(task.id)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-md transform hover:-translate-y-0.5 transition-all">
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve
                        </button>
                        <button onClick={() => setRejectModalOpen(task.id)} className="flex items-center px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50">
                          <XCircle className="w-4 h-4 mr-2" /> Request Fix
                        </button>
                      </>
                    )}
                 </div>
              </div>

              {/* Main Content */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Left Column */}
                 <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{task.title}</h3>
                      <p className="text-slate-500 text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-1.5"/> Due Date: <span className="font-semibold ml-1">{new Date(task.dueDate).toLocaleDateString()}</span>
                      </p>
                    </div>

                    {/* IMPORTANT: ASSETS & INSTRUCTIONS */}
                    <div className="bg-slate-50 dark:bg-slate-700/30 p-5 rounded-xl border border-slate-200 dark:border-slate-600">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Project Assets</h4>
                        
                        {task.sourceLink ? (
                          <a href={task.sourceLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-brand-200 dark:border-brand-900 rounded-lg group hover:border-brand-400 transition-colors shadow-sm">
                             <div className="flex items-center">
                                <div className="bg-brand-100 dark:bg-brand-900/50 p-2 rounded text-brand-600">
                                   <LinkIcon className="w-5 h-5"/>
                                </div>
                                <div className="ml-3">
                                   <div className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-brand-600">Source Files</div>
                                   <div className="text-xs text-slate-500 truncate max-w-[200px]">{task.sourceLink}</div>
                                </div>
                             </div>
                             <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-500"/>
                          </a>
                        ) : (
                          <div className="flex items-center p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                             <AlertTriangle className="w-4 h-4 mr-2"/> No source link provided.
                          </div>
                        )}

                        {task.instructions && (
                          <div className="mt-4">
                             <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Instructions</h4>
                             <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-100 leading-relaxed whitespace-pre-wrap">
                                {task.instructions}
                             </div>
                          </div>
                        )}
                    </div>

                    {/* Checklist */}
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white mb-3 text-sm flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-slate-400" /> Editing Checklist
                      </h4>
                      <div className="space-y-2">
                         {task.checklist && task.checklist.length > 0 ? (
                           task.checklist.map(item => (
                             <label key={item.id} className="flex items-center p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                                <input 
                                  type="checkbox" 
                                  checked={item.completed} 
                                  onChange={() => toggleTaskChecklist(task.id, item.id)}
                                  className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                                />
                                <span className={`ml-3 text-sm font-medium ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                  {item.text}
                                </span>
                             </label>
                           ))
                         ) : (
                           <p className="text-slate-400 text-sm italic pl-2">No specific checklist items.</p>
                         )}
                      </div>
                    </div>
                 </div>

                 {/* Right Column */}
                 <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col h-full">
                    {/* Deliverable Link Display */}
                    {task.deliverableLink && (
                      <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-900 shadow-sm">
                         <h4 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-2">Final Deliverables</h4>
                         <a href={task.deliverableLink} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-800 dark:text-white hover:text-brand-600 truncate block flex items-center p-2 bg-slate-50 dark:bg-slate-700 rounded border border-slate-100 dark:border-slate-600">
                           <Download className="w-4 h-4 mr-2 text-slate-400" /> {task.deliverableLink}
                         </a>
                      </div>
                    )}

                    <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">Activity Log</h4>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[300px] custom-scrollbar">
                       {task.comments && task.comments.map(c => (
                         <div key={c.id} className="text-sm bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex justify-between mb-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{c.authorName}</span>
                              <span className="text-slate-400 text-[10px]">{new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-snug">{c.content}</p>
                         </div>
                       ))}
                       {(!task.comments || task.comments.length === 0) && <p className="text-slate-400 text-xs text-center py-8">No activity recorded yet.</p>}
                    </div>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Revision Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Request Revision</h3>
              <p className="text-sm text-slate-500 mb-4">Please describe what needs to be fixed for the editor.</p>
              <textarea 
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                rows={4}
                autoFocus
                placeholder="e.g. Color balance is off on team 3..."
                value={rejectComment}
                onChange={e => setRejectComment(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-4">
                 <button onClick={() => setRejectModalOpen(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                 <button onClick={handleRequestRevision} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg">Send Request</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EditorDashboard;