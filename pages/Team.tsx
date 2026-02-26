
import React, { useState } from 'react';
import { Send, ThumbsUp, MessageCircle, Trash2, MoreHorizontal, CornerDownRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Team: React.FC = () => {
  const { posts, addPost, deletePost, toggleLikePost, addComment, user } = useApp();
  const [content, setContent] = useState('');
  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    addPost({
      id: Math.random().toString(36).substr(2, 9),
      authorId: user.id,
      authorName: user.name,
      content: content,
      timestamp: new Date().toISOString(),
      likedBy: [],
      comments: []
    });
    setContent('');
  };

  const handleSubmitComment = (postId: string) => {
    if (!commentText.trim()) return;
    addComment(postId, commentText);
    setCommentText('');
    setActiveCommentBox(null);
  };

  const handleReplyToComment = (postId: string, authorName: string) => {
    setActiveCommentBox(postId);
    setCommentText(`@${authorName} `);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Team Feed</h1>
        <p className="text-slate-500 dark:text-slate-400">Share updates and announcements with your team.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-8">
        <form onSubmit={handlePost}>
          <textarea
            className="w-full resize-none border-none focus:ring-0 text-slate-700 dark:text-slate-200 bg-transparent placeholder:text-slate-400 text-lg mb-2"
            placeholder="What's happening?"
            rows={3}
            value={content}
            onChange={e => setContent(e.target.value)}
          ></textarea>
          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-3">
             <div className="text-xs text-slate-400">Markdown supported</div>
             <button 
               type="submit"
               disabled={!content.trim()}
               className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center"
             >
               <Send className="w-4 h-4 mr-2" />
               Post Update
             </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {posts.map(post => {
          const isLiked = user && post.likedBy.includes(user.id);
          const isAuthor = user && post.authorId === user.id;

          return (
            <div key={post.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-in slide-in-from-bottom-2 duration-500">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg mr-3 shadow-sm">
                     {post.authorName.charAt(0)}
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-900 dark:text-white">{post.authorName}</h4>
                     <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(post.timestamp).toLocaleString()}</div>
                   </div>
                 </div>
                 {isAuthor && (
                   <button 
                    onClick={() => deletePost(post.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Delete post"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 )}
               </div>
               
               <div className="text-slate-700 dark:text-slate-200 mb-4 whitespace-pre-wrap leading-relaxed">
                 {post.content}
               </div>
               
               <div className="flex items-center space-x-6 text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3">
                 <button 
                  onClick={() => toggleLikePost(post.id)}
                  className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-brand-600 dark:text-brand-400' : 'hover:text-brand-600 dark:hover:text-brand-400'}`}
                 >
                   <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                   <span className="text-sm font-medium">{post.likedBy.length} Likes</span>
                 </button>
                 <button 
                  onClick={() => setActiveCommentBox(activeCommentBox === post.id ? null : post.id)}
                  className="flex items-center space-x-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                 >
                   <MessageCircle className="w-4 h-4" />
                   <span className="text-sm font-medium">{post.comments.length} Comments</span>
                 </button>
               </div>

               {/* Comments Section */}
               {(post.comments.length > 0 || activeCommentBox === post.id) && (
                 <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-3">
                   {post.comments.map(comment => (
                     <div key={comment.id} className="flex space-x-3 group">
                        <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {comment.authorName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="bg-white dark:bg-slate-700 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm inline-block">
                             <span className="text-xs font-bold text-slate-900 dark:text-white block">{comment.authorName}</span>
                             <span className="text-sm text-slate-700 dark:text-slate-200">{comment.content}</span>
                          </div>
                          <div className="flex items-center mt-1 ml-1 space-x-3">
                             <span className="text-[10px] text-slate-400">{new Date(comment.timestamp).toLocaleTimeString()}</span>
                             <button 
                               onClick={() => handleReplyToComment(post.id, comment.authorName)}
                               className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity hover:underline flex items-center"
                             >
                               <CornerDownRight className="w-3 h-3 mr-1" /> Reply
                             </button>
                          </div>
                        </div>
                     </div>
                   ))}

                   {activeCommentBox === post.id && (
                     <div className="flex space-x-2 mt-2">
                       <input 
                         type="text" 
                         placeholder="Write a comment..." 
                         className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                         value={commentText}
                         onChange={e => setCommentText(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && handleSubmitComment(post.id)}
                         autoFocus
                       />
                       <button 
                         onClick={() => handleSubmitComment(post.id)}
                         disabled={!commentText.trim()}
                         className="bg-brand-600 text-white rounded-lg px-3 py-2 hover:bg-brand-700 disabled:opacity-50"
                       >
                         <Send className="w-4 h-4" />
                       </button>
                     </div>
                   )}
                 </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Team;
