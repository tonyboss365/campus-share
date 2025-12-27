'use client';
import { Lock, Eye, Cloud, Trash2, MapPin, User as UserIcon, Download, ShoppingBag, Loader2, ShoppingCart, Key, MessageCircle, Hand } from 'lucide-react';

export default function ResourceCard({ item, user, onAction, onView, onDelete, onDownload }: any) {
  if (!item) return null; 

  const isOwner = user?.uid === item.ownerId;
  const isApproved = item.approvedUsers?.some((u: any) => u.uid === user?.uid);
  const isPending = item.requests?.some((r: any) => r.uid === user?.uid);
  
  // Check if item is paid
  const isPaid = item.price && item.price !== '0' && item.price !== 'Free' && item.price !== 0;
  
  // Access logic
  const hasAccess = isOwner || isApproved || !isPaid; 

  // Image detection logic
  const displayImage = item.coverUrl || item.fileUrl;
  const fileUrlLower = displayImage?.toLowerCase() || '';
  const isImage = fileUrlLower.includes('firebasestorage') 
    ? !fileUrlLower.includes('.pdf') && !fileUrlLower.includes('.doc') 
    : fileUrlLower.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null;

  return (
    <div className="group h-full perspective-1000 relative">
      <div className="relative bg-white border border-slate-100 p-5 rounded-[32px] h-full hover:border-[#00ED64] transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2 flex flex-col overflow-hidden">
        
        {/* CLOUD ANIMATIONS */}
        <div className="absolute -bottom-10 -right-10 text-[#00ED64] opacity-0 group-hover:opacity-40 transition-all duration-700 ease-out transform translate-y-10 group-hover:translate-y-0 scale-150 pointer-events-none z-0">
           <Cloud size={200} fill="currentColor" />
        </div>
        <div className="absolute top-10 -left-10 text-[#001E2B] opacity-0 group-hover:opacity-10 transition-all duration-1000 ease-out delay-100 transform -translate-x-10 group-hover:translate-x-0 pointer-events-none z-0">
           <Cloud size={100} fill="currentColor" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
               <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                 {item.condition || 'Good'}
               </span>
               {isOwner && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(onDelete) onDelete(item.id); }}
                    className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all z-20"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
               )}
            </div>

            {/* IMAGE PREVIEW */}
            <div className="h-44 bg-slate-50 rounded-2xl mb-4 flex items-center justify-center border border-slate-50 overflow-hidden relative group/image">
              {isImage && displayImage ? (
                <img src={displayImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Cover" loading="lazy" />
              ) : (
                <div className="flex flex-col items-center text-slate-300">
                   {item.fileUrl ? <Cloud size={48} /> : <ShoppingBag size={48} />}
                   <span className="text-[10px] font-black uppercase tracking-widest mt-2">{item.fileUrl ? 'Document' : 'Physical Item'}</span>
                </div>
              )}
              
              <div className={`absolute bottom-2 left-2 px-3 py-1 rounded-lg text-xs font-bold font-mono shadow-md backdrop-blur-sm ${isPaid ? 'bg-amber-100/90 text-amber-600' : 'bg-[#00ED64]/90 text-[#001E2B]'}`}>
                 {isPaid ? `₹${item.price}` : 'Free'}
              </div>

              <div className="absolute top-2 right-2">
                 {hasAccess ? 
                   <span className="bg-[#00ED64] text-[#001E2B] text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-md flex items-center gap-1"><Key size={10}/> Open</span> :
                   <span className="bg-white/90 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-md flex items-center gap-1"><Lock size={10}/> Locked</span>
                 }
              </div>
            </div>

            <p className="text-[10px] font-black text-[#00ED64] uppercase tracking-widest mb-1">{item.category || 'RESOURCE'}</p>
            <h4 className="text-lg font-bold text-[#001E2B] mb-1 leading-tight line-clamp-2">{item.title}</h4>
            
            <p className="text-xs text-slate-400 line-clamp-1 mb-4 flex items-center gap-2">
               <UserIcon size={10} /> {item.ownerName?.split(' ')[0] || 'Student'} 
               <span className="text-slate-300">•</span> 
               <MapPin size={10} /> {item.college || 'Campus'}
            </p>

            <div className="mt-auto pt-4 border-t border-slate-50 z-20">
               {hasAccess ? (
                  <div className="flex gap-2">
                     <button onClick={(e) => { e.stopPropagation(); onView(); }} className="flex-1 bg-[#001E2B] text-white py-3 rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                        <Eye size={14} /> View
                     </button>
                     <button onClick={(e) => { e.stopPropagation(); onDownload(item.fileUrl); }} className="flex-1 bg-[#00ED64] text-[#001E2B] py-3 rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                        <Download size={14} /> Save
                     </button>
                  </div>
               ) : (
                  isPending ? (
                     <button disabled className="w-full bg-slate-100 text-slate-400 py-3 rounded-xl font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2">
                        <Loader2 size={14} className="animate-spin"/> Pending Approval...
                     </button>
                  ) : (
                     <div className="flex gap-2">
                        {/* 1. BUY BUTTON (Only if Paid) */}
                        {isPaid && (
                           <button onClick={(e) => { e.stopPropagation(); onAction('buy'); }} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-1" title="Buy Now">
                              <ShoppingCart size={14}/> Buy
                           </button>
                        )}
                        
                        {/* 2. REQUEST BUTTON (Always show, even if paid) */}
                        <button onClick={(e) => { e.stopPropagation(); onAction('request'); }} className={`flex-1 ${isPaid ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:scale-105'} py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1`} title="Request Access">
                           {isPaid ? <Hand size={14}/> : <Lock size={14}/>} {isPaid ? 'Request' : 'Request'}
                        </button>

                        {/* 3. CHAT BUTTON (Only if not owner) */}
                        {!isOwner && (
                            <button onClick={(e) => { e.stopPropagation(); onAction('chat'); }} className="w-10 bg-blue-50 text-blue-500 border border-blue-100 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all shadow-sm flex items-center justify-center" title="Chat with Owner">
                                <MessageCircle size={16}/>
                            </button>
                        )}
                     </div>
                  )
               )}
            </div>
        </div>
      </div>
    </div>
  );
}