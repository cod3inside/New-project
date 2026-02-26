
import React, { useState } from 'react';
import { Mail, Phone, Tag, Plus, X, Calendar, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Contact, Opportunity } from '../types';

const CRM: React.FC = () => {
  const { contacts, addContact, opportunities, addOpportunity, updateOpportunityStage, formatAmount } = useApp();
  const [activeTab, setActiveTab] = useState<'contacts' | 'pipeline'>('pipeline');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showOpModal, setShowOpModal] = useState(false);
  const [newOp, setNewOp] = useState({ title: '', value: '', contactId: '', stage: 'New' });

  const handleCreateOpportunity = () => {
    if(!newOp.title) return;
    const op: Opportunity = {
      id: Math.random().toString(36).substr(2, 9),
      title: newOp.title,
      value: Number(newOp.value),
      contactId: newOp.contactId || contacts[0]?.id,
      stage: 'New',
      probability: 10,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    addOpportunity(op);
    setShowOpModal(false);
    setNewOp({ title: '', value: '', contactId: '', stage: 'New' });
  };

  const PipelineColumn: React.FC<{ stage: Opportunity['stage']; title: string }> = ({ stage, title }) => {
    const items = opportunities.filter(o => o.stage === stage);
    const total = items.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="min-w-[280px] w-72 flex flex-col h-full">
         <div className="flex items-center justify-between mb-3 px-1">
           <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{title}</h3>
           <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{items.length} deals</span>
         </div>
         <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2 flex-1 overflow-y-auto space-y-2 border border-slate-200/60 dark:border-slate-700">
            {items.map(op => (
              <div key={op.id} className="bg-white dark:bg-slate-700 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-600 cursor-pointer hover:shadow-md transition-all">
                <div className="text-sm font-bold text-slate-800 dark:text-white mb-1">{op.title}</div>
                <div className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-2">{formatAmount(op.value)}</div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {new Date(op.expectedCloseDate).toLocaleDateString()}</span>
                  <span className="flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> {op.probability}%</span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-50 dark:border-slate-600 flex justify-end">
                   {stage !== 'Won' && (
                     <button onClick={() => updateOpportunityStage(op.id, 'Won')} className="text-[10px] bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded hover:bg-green-100 dark:hover:bg-green-900/50">
                       Mark Won
                     </button>
                   )}
                   {stage !== 'New' && stage !== 'Won' && (
                     <button onClick={() => updateOpportunityStage(op.id, 'New')} className="text-[10px] text-slate-400 px-2 py-1 ml-2 hover:text-slate-600">
                       Reset
                     </button>
                   )}
                   {stage === 'New' && (
                     <button onClick={() => updateOpportunityStage(op.id, 'Qualified')} className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 px-2 py-1 ml-2 rounded hover:bg-brand-100 dark:hover:bg-brand-900/50">
                       Qualify
                     </button>
                   )}
                </div>
              </div>
            ))}
            <div className="bg-slate-200/50 dark:bg-slate-700/50 rounded p-2 text-center text-xs text-slate-400 font-medium">
               Total: {formatAmount(total)}
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white">CRM & Sales</h1>
           <p className="text-slate-500 dark:text-slate-400">Manage contacts and track sales opportunities</p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 flex">
            <button 
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'pipeline' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Pipeline
            </button>
            <button 
              onClick={() => setActiveTab('contacts')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'contacts' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Contacts
            </button>
          </div>
          <button 
            onClick={() => activeTab === 'pipeline' ? setShowOpModal(true) : null}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === 'pipeline' ? 'New Deal' : 'Add Contact'}
          </button>
        </div>
      </div>

      {activeTab === 'pipeline' ? (
        <div className="flex-1 overflow-x-auto pb-2">
           <div className="flex space-x-4 h-full min-w-max px-1">
             <PipelineColumn stage="New" title="New Lead" />
             <PipelineColumn stage="Qualified" title="Qualified" />
             <PipelineColumn stage="Proposal" title="Proposal" />
             <PipelineColumn stage="Negotiation" title="Negotiation" />
             <PipelineColumn stage="Won" title="Closed Won" />
           </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">
          {/* Contact List */}
          <div className={`w-full lg:w-2/3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col ${selectedContact ? 'hidden lg:flex' : 'flex'}`}>
             <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex font-medium text-slate-500 dark:text-slate-400 text-sm">
               <div className="w-1/3">Name</div>
               <div className="w-1/3">Company</div>
               <div className="w-1/3">Action</div>
             </div>
             <div className="overflow-y-auto flex-1">
               {contacts.map(contact => (
                 <div key={contact.id} className="p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center text-sm transition-colors">
                   <div className="w-1/3">
                     <div className="font-semibold text-slate-800 dark:text-white">{contact.name}</div>
                     <div className="text-slate-400 text-xs">{contact.email}</div>
                   </div>
                   <div className="w-1/3 text-slate-600 dark:text-slate-400">{contact.company}</div>
                   <div className="w-1/3 flex gap-2">
                     <button 
                      onClick={() => { setSelectedContact(contact); }}
                      className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg flex items-center text-xs font-medium"
                     >
                       <Mail className="w-4 h-4 mr-1" /> View
                     </button>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Detail Panel */}
          {selectedContact && (
            <div className="w-full lg:w-1/3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col animate-in slide-in-from-right-10 duration-300 z-10 lg:z-auto">
               <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 dark:text-white">Contact Details</h3>
                 <button onClick={() => setSelectedContact(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <div className="p-6 flex-1 overflow-y-auto">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl mr-4">
                      {selectedContact.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-slate-900 dark:text-white">{selectedContact.name}</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedContact.company}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                      <Mail className="w-4 h-4 mr-3" /> {selectedContact.email}
                    </div>
                    <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                      <Phone className="w-4 h-4 mr-3" /> {selectedContact.phone}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedContact.tags.map(tag => (
                        <span key={tag} className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded-full flex items-center">
                          <Tag className="w-3 h-3 mr-1" /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}

      {showOpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm">
              <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">New Deal</h2>
              <div className="space-y-4">
                 <input 
                  placeholder="Deal Title" 
                  className="w-full border border-slate-300 dark:border-slate-600 p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                  value={newOp.title} 
                  onChange={e => setNewOp({...newOp, title: e.target.value})}
                 />
                 <input 
                  type="number"
                  placeholder="Value ($)" 
                  className="w-full border border-slate-300 dark:border-slate-600 p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                  value={newOp.value} 
                  onChange={e => setNewOp({...newOp, value: e.target.value})}
                 />
                 <select 
                   className="w-full border border-slate-300 dark:border-slate-600 p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                   value={newOp.contactId}
                   onChange={e => setNewOp({...newOp, contactId: e.target.value})}
                 >
                    <option value="">Select Contact</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
                 <button onClick={handleCreateOpportunity} className="w-full bg-brand-600 text-white py-2 rounded font-medium hover:bg-brand-700">Create Deal</button>
                 <button onClick={() => setShowOpModal(false)} className="w-full text-slate-500 dark:text-slate-400 py-2 hover:text-slate-700 dark:hover:text-slate-200">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
