
import React, { useState } from 'react';
import { Search, Plus, BookOpen, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const KnowledgeBase: React.FC = () => {
  const { articles, addArticle } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', category: '', content: '' });
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    addArticle({
      id: Math.random().toString(36).substr(2, 9),
      ...newArticle,
      lastUpdated: new Date().toISOString()
    });
    setShowModal(false);
    setNewArticle({ title: '', category: '', content: '' });
  };

  return (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Knowledge Base</h1>
          <p className="text-slate-500 dark:text-slate-400">Internal documentation and guides</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Article
        </button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search for answers..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:placeholder-slate-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(article => (
          <div 
            key={article.id} 
            onClick={() => setSelectedArticle(article.id)}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider">{article.category}</span>
              <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{article.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-4">{article.content}</p>
            <div className="text-xs text-slate-400">
              Updated {new Date(article.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-[600px] max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Create Article</h2>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Title</label>
                    <input 
                      className="w-full border p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600" 
                      value={newArticle.title} 
                      onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Category</label>
                    <input 
                      className="w-full border p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600" 
                      value={newArticle.category} 
                      onChange={e => setNewArticle({...newArticle, category: e.target.value})}
                    />
                 </div>
                 <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Content</label>
                    </div>
                    <textarea 
                      className="w-full border p-2 rounded h-64 font-mono text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600" 
                      value={newArticle.content} 
                      onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                    ></textarea>
                 </div>
                 <div className="flex justify-end gap-2 pt-4">
                   <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded">Cancel</button>
                   <button onClick={handleCreate} className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700">Save Article</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-[700px] max-h-[90vh] overflow-y-auto relative">
              <button onClick={() => setSelectedArticle(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-6 h-6"/></button>
              {(() => {
                const art = articles.find(a => a.id === selectedArticle);
                if (!art) return null;
                return (
                  <>
                    <span className="bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 px-2 py-1 rounded text-xs font-bold uppercase mb-4 inline-block">{art.category}</span>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">{art.title}</h1>
                    <div className="prose max-w-none text-slate-600 dark:text-slate-300">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{art.content}</pre>
                    </div>
                  </>
                );
              })()}
           </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;