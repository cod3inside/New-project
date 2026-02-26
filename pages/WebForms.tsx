
import React, { useState } from 'react';
import { Plus, Trash2, Eye, Share2, Copy, CheckCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WebForm, WebFormField, FormFieldType } from '../types';

const WebForms: React.FC = () => {
  const { webForms, addWebForm, deleteWebForm, incrementFormSubmission, user } = useApp();
  
  // Builder State
  const [showBuilder, setShowBuilder] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [newFormDesc, setNewFormDesc] = useState('');
  const [fields, setFields] = useState<WebFormField[]>([]);

  // Preview/Share State
  const [activePreview, setActivePreview] = useState<WebForm | null>(null);
  const [showShareModal, setShowShareModal] = useState<WebForm | null>(null);
  const [copied, setCopied] = useState(false);

  // --- Builder Logic ---
  const addField = (type: FormFieldType) => {
    setFields([...fields, {
      id: Math.random().toString(),
      label: `New ${type} field`,
      type,
      required: false
    }]);
  };

  const updateField = (id: string, key: keyof WebFormField, value: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSaveForm = () => {
    if (!newFormTitle) return;
    addWebForm({
      id: Math.random().toString(36).substr(2, 9),
      title: newFormTitle,
      description: newFormDesc,
      fields: fields,
      createdAt: new Date().toISOString(),
      submissionsCount: 0,
      isActive: true
    });
    // Reset
    setShowBuilder(false);
    setNewFormTitle('');
    setNewFormDesc('');
    setFields([]);
  };

  const handleShare = (form: WebForm) => {
    setShowShareModal(form);
    setCopied(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://flowspace.app/forms/${showShareModal?.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Simulated Submission ---
  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activePreview) {
      incrementFormSubmission(activePreview.id);
      alert('Form submitted successfully! (Simulation)');
      setActivePreview(null);
    }
  };

  if (showBuilder) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowBuilder(false)} className="md:hidden p-2 -ml-2 text-slate-500">
               <ArrowLeft className="w-5 h-5"/>
            </button>
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Form Builder</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Design your form</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <button onClick={() => setShowBuilder(false)} className="hidden md:block px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
             <button onClick={handleSaveForm} className="flex-1 md:flex-none bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 shadow-lg shadow-brand-200">Save Form</button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">
           {/* Sidebar Tools */}
           <div className="w-full lg:w-64 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 lg:overflow-y-auto shrink-0 max-h-[200px] lg:max-h-none overflow-y-auto">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 text-sm uppercase tracking-wide sticky top-0 bg-white dark:bg-slate-800 pb-2">Form Elements</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                 <button onClick={() => addField('text')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 hover:border-slate-200 text-slate-600 dark:text-slate-300 text-sm font-medium transition-all">Text Input</button>
                 <button onClick={() => addField('number')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 hover:border-slate-200 text-slate-600 dark:text-slate-300 text-sm font-medium transition-all">Number Input</button>
                 <button onClick={() => addField('email')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 hover:border-slate-200 text-slate-600 dark:text-slate-300 text-sm font-medium transition-all">Email Address</button>
                 <button onClick={() => addField('date')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 hover:border-slate-200 text-slate-600 dark:text-slate-300 text-sm font-medium transition-all">Date Picker</button>
                 <button onClick={() => addField('textarea')} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 hover:border-slate-200 text-slate-600 dark:text-slate-300 text-sm font-medium transition-all">Long Text Area</button>
              </div>
           </div>

           {/* Canvas */}
           <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 md:p-8 overflow-y-auto">
              <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 md:p-8 min-h-[500px]">
                 <input 
                   className="w-full text-2xl md:text-3xl font-bold text-slate-800 dark:text-white bg-transparent border-none focus:ring-0 placeholder:text-slate-300 mb-2" 
                   placeholder="Form Title"
                   value={newFormTitle}
                   onChange={e => setNewFormTitle(e.target.value)}
                 />
                 <input 
                   className="w-full text-slate-600 dark:text-slate-400 bg-transparent border-none focus:ring-0 placeholder:text-slate-300 mb-8" 
                   placeholder="Form Description"
                   value={newFormDesc}
                   onChange={e => setNewFormDesc(e.target.value)}
                 />

                 {fields.length === 0 && (
                   <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                     Click elements to add fields
                   </div>
                 )}

                 <div className="space-y-6">
                    {fields.map((field, idx) => (
                      <div key={field.id} className="group relative p-4 rounded-lg border border-transparent hover:border-brand-200 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all">
                         <div className="flex flex-wrap gap-4 mb-2">
                           <input 
                             className="flex-1 font-medium bg-transparent text-slate-900 dark:text-white border-b border-transparent focus:border-brand-300 focus:outline-none min-w-[200px]"
                             value={field.label}
                             onChange={e => updateField(field.id, 'label', e.target.value)}
                           />
                           <div className="flex items-center space-x-2 ml-auto">
                              <label className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                                <input 
                                  type="checkbox" 
                                  checked={field.required} 
                                  onChange={e => updateField(field.id, 'required', e.target.checked)}
                                  className="mr-1"
                                /> 
                                Required
                              </label>
                              <button onClick={() => removeField(field.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                           </div>
                         </div>
                         <div className="pointer-events-none opacity-60">
                            {field.type === 'textarea' ? (
                              <textarea className="w-full border border-slate-300 dark:border-slate-600 rounded p-2 h-20 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" disabled></textarea>
                            ) : (
                              <input className="w-full border border-slate-300 dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" disabled placeholder={field.type} />
                            )}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Web Forms</h1>
          <p className="text-slate-500 dark:text-slate-400">Create forms to collect data, orders, or feedback</p>
        </div>
        <button 
          onClick={() => setShowBuilder(true)}
          className="w-full sm:w-auto bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Form
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webForms.map(form => (
          <div key={form.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all">
             <div className="flex justify-between items-start mb-4">
               <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-3 rounded-lg">
                 <ExternalLink className="w-6 h-6" />
               </div>
               <div className="flex space-x-2">
                 <button onClick={() => setActivePreview(form)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors" title="Preview">
                   <Eye className="w-4 h-4" />
                 </button>
                 <button onClick={() => handleShare(form)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors" title="Share">
                   <Share2 className="w-4 h-4" />
                 </button>
                 {user?.role === 'admin' && (
                    <button onClick={() => deleteWebForm(form.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                 )}
               </div>
             </div>
             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{form.title}</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 h-10">{form.description}</p>
             <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-100 dark:border-slate-700">
               <span className={`px-2 py-1 rounded-full text-xs font-medium ${form.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                 {form.isActive ? 'Active' : 'Draft'}
               </span>
               <span className="text-slate-500 dark:text-slate-400 font-medium">{form.submissionsCount} submissions</span>
             </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Public View Preview</span>
                <button onClick={() => setActivePreview(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><Trash2 className="w-5 h-5 rotate-45" /></button>
              </div>
              <div className="p-8 overflow-y-auto">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{activePreview.title}</h2>
                 <p className="text-slate-600 dark:text-slate-300 mb-8">{activePreview.description}</p>
                 <form className="space-y-5" onSubmit={handleSimulateSubmit}>
                   {activePreview.fields.map(field => (
                     <div key={field.id}>
                       <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                         {field.label} {field.required && <span className="text-red-500">*</span>}
                       </label>
                       {field.type === 'textarea' ? (
                         <textarea className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" required={field.required}></textarea>
                       ) : (
                         <input type={field.type} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" required={field.required} />
                       )}
                     </div>
                   ))}
                   <div className="pt-4">
                     <button type="submit" className="w-full bg-slate-900 dark:bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-brand-700">Submit Form</button>
                   </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Share Form</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Share this link with your customers to collect responses.</p>
            <div className="flex gap-2 mb-4">
              <input 
                readOnly 
                value={`https://flowspace.app/forms/${showShareModal.id}`}
                className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-3 py-2 text-sm text-slate-600 dark:text-slate-300 w-full"
              />
              <button onClick={handleCopyLink} className="bg-brand-600 text-white px-3 rounded hover:bg-brand-700 shrink-0">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <button onClick={() => setShowShareModal(null)} className="w-full border border-slate-200 dark:border-slate-600 py-2 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebForms;
