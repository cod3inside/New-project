import React, { useState } from 'react';
import { Plus, List, Kanban, CheckCircle, Clock, AlertCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, Priority } from '../types';

const EditableDueDate: React.FC<{ task: Task }> = ({ task }) => {
  const { updateTask } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTask({ ...task, dueDate: e.target.value });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        type="date"
        className="text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-0.5 outline-none focus:ring-1 focus:ring-brand-500"
        value={task.dueDate.split('T')[0]} // Ensure format yyyy-mm-dd
        onChange={handleDateChange}
        onBlur={() => setIsEditing(false)}
        autoFocus
      />
    );
  }

  return (
    <span 
      onClick={() => setIsEditing(true)} 
      className="cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 hover:underline decoration-dashed underline-offset-4"
      title="Click to change due date"
    >
      {new Date(task.dueDate).toLocaleDateString()}
    </span>
  );
};

const Tasks: React.FC = () => {
  const { tasks, addTask, updateTaskStatus, projects, user } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar'>('board');
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', projectId: '', priority: Priority.MEDIUM });
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleCreate = () => {
    if (!newTask.title) return;
    addTask({
      id: Math.random().toString(36).substr(2, 9),
      projectId: newTask.projectId,
      title: newTask.title,
      assignee: 'Unassigned',
      status: 'todo',
      priority: newTask.priority,
      dueDate: new Date().toISOString()
    });
    setShowModal(false);
    setNewTask({ title: '', projectId: '', priority: Priority.MEDIUM });
  };

  const CalendarView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayIndex = firstDay.getDay(); // 0 = Sunday
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // Generate calendar grid cells
    const cells = [];
    
    // Previous month days filler
    for (let i = startingDayIndex - 1; i >= 0; i--) {
        cells.push(<div key={`prev-${i}`} className="h-32 border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 p-2 text-slate-300 text-sm">{prevMonthLastDay - i}</div>);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = new Date(year, month, day).toISOString().split('T')[0];
        const dayTasks = tasks.filter(t => t.dueDate.startsWith(dateStr));
        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

        cells.push(
            <div key={day} className={`h-32 border border-slate-100 dark:border-slate-700/50 p-2 overflow-y-auto group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'bg-white dark:bg-slate-800'}`}>
                <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>
                </div>
                <div className="space-y-1">
                    {dayTasks.map(task => (
                        <div key={task.id} className={`text-[10px] p-1.5 rounded border-l-2 truncate shadow-sm cursor-pointer hover:opacity-80
                            ${task.status === 'done' ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 
                              task.status === 'review' ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' :
                              'bg-white border-brand-500 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}
                        >
                            {task.title}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><ChevronLeft className="w-5 h-5 text-slate-500"/></button>
                    <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 text-slate-600 dark:text-slate-300">Today</button>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><ChevronRight className="w-5 h-5 text-slate-500"/></button>
                </div>
            </div>
            <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-700 text-center py-2 border-b border-slate-200 dark:border-slate-700">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
                {cells}
            </div>
        </div>
    );
  };

  const StatusColumn: React.FC<{ status: Task['status'], title: string, color: string }> = ({ status, title, color }) => {
    const filteredTasks = tasks.filter(t => t.status === status);
    
    return (
      <div className="flex-1 min-w-[300px] bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-3 flex flex-col h-full border border-slate-200 dark:border-slate-700">
        <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${color}`}>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{title}</h3>
          <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">{filteredTasks.length}</span>
        </div>
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {filteredTasks.map(task => {
            const showDoneButton = task.status !== 'done' && (task.status !== 'review' || user?.role === 'admin');
            
            return (
              <div key={task.id} className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all group">
                 <div className="flex justify-between items-start mb-2">
                   <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${task.priority === Priority.HIGH ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                     {task.priority}
                   </span>
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      {showDoneButton && (
                        <button 
                          onClick={() => updateTaskStatus(task.id, 'done')} 
                          className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 p-1 rounded"
                          title="Mark as Done"
                        >
                          <CheckCircle className="w-3 h-3"/>
                        </button>
                      )}
                      
                      {status !== 'in-progress' && status !== 'done' && status !== 'review' && (
                        <button onClick={() => updateTaskStatus(task.id, 'in-progress')} className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1 rounded" title="Start Progress"><Clock className="w-3 h-3"/></button>
                      )}

                      {status === 'in-progress' && (
                        <button onClick={() => updateTaskStatus(task.id, 'review')} className="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 p-1 rounded" title="Submit for Review"><AlertCircle className="w-3 h-3"/></button>
                      )}
                   </div>
                 </div>
                 <p className="text-sm font-medium text-slate-800 dark:text-white mb-2">{task.title}</p>
                 <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                   <span>{projects.find(p => p.id === task.projectId)?.name || 'General Task'}</span>
                   <EditableDueDate task={task} />
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400">Agile task management</p>
        </div>
        <div className="flex space-x-3">
           <div className="bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 flex">
            <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-400'}`} title="List View"><List className="w-4 h-4"/></button>
            <button onClick={() => setViewMode('board')} className={`p-2 rounded ${viewMode === 'board' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-400'}`} title="Board View"><Kanban className="w-4 h-4"/></button>
            <button onClick={() => setViewMode('calendar')} className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-400'}`} title="Calendar View"><CalendarIcon className="w-4 h-4"/></button>
           </div>
           <button 
            onClick={() => setShowModal(true)}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
           >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="flex-1 overflow-y-auto">
            <CalendarView />
        </div>
      ) : viewMode === 'board' ? (
        <div className="flex-1 overflow-x-auto pb-2">
          <div className="flex gap-4 h-full min-w-max">
            <StatusColumn status="todo" title="To Do" color="border-slate-300" />
            <StatusColumn status="in-progress" title="In Progress" color="border-blue-500" />
            <StatusColumn status="review" title="Review" color="border-amber-400" />
            <StatusColumn status="done" title="Done" color="border-green-500" />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
           <div className="divide-y divide-slate-100 dark:divide-slate-700">
             {tasks.map(task => (
               <div key={task.id} className="p-4 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className={`w-3 h-3 rounded-full mr-4 ${task.status === 'done' ? 'bg-green-500' : task.status === 'in-progress' ? 'bg-blue-500' : task.status === 'review' ? 'bg-amber-400' : 'bg-slate-300'}`}></div>
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>{task.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{projects.find(p => p.id === task.projectId)?.name || 'General'}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                     {task.status === 'review' && (
                        <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-1 rounded">Under Review</span>
                     )}
                     <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">{task.priority}</span>
                     <span className="text-xs text-slate-400">
                       <EditableDueDate task={task} />
                     </span>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-96">
              <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Create Task</h2>
              <div className="space-y-4">
                 <input 
                  placeholder="Task Title" 
                  className="w-full border p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600" 
                  value={newTask.title} 
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                 />
                 <select 
                   className="w-full border p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                   value={newTask.projectId}
                   onChange={e => setNewTask({...newTask, projectId: e.target.value})}
                 >
                    <option value="">No Project (General)</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
                 <select 
                   className="w-full border p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                   value={newTask.priority}
                   onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})}
                 >
                    <option value={Priority.LOW}>Low Priority</option>
                    <option value={Priority.MEDIUM}>Medium Priority</option>
                    <option value={Priority.HIGH}>High Priority</option>
                 </select>
                 <button onClick={handleCreate} className="w-full bg-brand-600 text-white py-2 rounded font-medium">Create Task</button>
                 <button onClick={() => setShowModal(false)} className="w-full text-slate-500 dark:text-slate-400 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;