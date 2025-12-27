'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import AddResource from '@/components/AddResource';
import ResourceCard from '@/components/ResourceCard';
import { db, auth } from '@/lib/firebase';
import { 
  collection, onSnapshot, query, orderBy, doc, 
  updateDoc, deleteDoc, arrayUnion, arrayRemove, Timestamp,
  setDoc, getDoc, where 
} from 'firebase/firestore';
import { onAuthStateChanged, User, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { 
  BrainCircuit, Send, X, ShieldCheck, 
  LogOut, LayoutGrid, Users, Cloud, 
  Image as ImageIcon, Loader2, CheckCircle, AlertCircle, 
  Zap, ArrowLeft, Menu, Search, Filter, PenTool, StickyNote, Save, 
  Eraser, Highlighter, History, MessageSquare, MessageSquarePlus,
  ArrowRight, School, Wallet, QrCode,
  Download, UploadCloud, MessageCircle, CheckCheck, BellRing, LockKeyhole
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const OPENROUTER_API_KEY = "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";

// --- VISUAL COMPONENTS ---

const NeonCloud = ({ className, size = 180 }: { className?: string, size?: number }) => (
  <div className={`relative ${className}`}>
    <svg width={size} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200/30">
      <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.132 20.177 10.244 17.819 10.034C17.497 6.638 14.651 4 11 4C7.535 4 4.825 6.64 4.5 10.034C2.143 10.244 0.5 12.132 0.5 14.5C0.5 16.9853 2.51472 19 5 19H17.5Z" />
    </svg>
    <svg width={size} height={size * 0.6} viewBox="0 0 24 24" fill="none" className="absolute inset-0 text-[#00ED64] drop-shadow-[0_0_8px_#00ED64]">
      <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.132 20.177 10.244 17.819 10.034C17.497 6.638 14.651 4 11 4C7.535 4 4.825 6.64 4.5 10.034C2.143 10.244 0.5 12.132 0.5 14.5C0.5 16.9853 2.51472 19 5 19H17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="neon-path" />
    </svg>
    <style jsx>{` .neon-path { stroke-dasharray: 6; stroke-dashoffset: 100; animation: dash 4s linear infinite; } @keyframes dash { to { stroke-dashoffset: 0; } } `}</style>
  </div>
);

const AnimatedBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-[#F9FBFA] via-[#E8F5E9] to-[#E0F2F1] opacity-80" />
    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00ED64]/5 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute top-20 left-10 animate-bounce-slow opacity-60"><NeonCloud size={200} /></div>
    <div className="absolute bottom-1/3 right-10 animate-bounce-slow delay-700 opacity-40"><NeonCloud size={280} /></div>
    <style jsx>{` @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } } .animate-bounce-slow { animation: bounce-slow 6s infinite ease-in-out; } `}</style>
  </div>
);

const Watermark = () => (
  <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[5] flex flex-col items-center justify-center pointer-events-none select-none">
    <Cloud size={40} className="text-[#001E2B] mb-2 opacity-30" fill="currentColor"/>
    <div className="text-[10px] font-black text-[#001E2B] tracking-[0.25em] uppercase flex items-center gap-1.5 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/60 shadow-lg">
      Made By Team <span className="text-[#00ED64] animate-pulse font-extrabold text-xs">Code</span>
    </div>
  </div>
);

const CloudDashLoader = ({ text }: { text?: string }) => (
  <div className="relative flex flex-col items-center justify-center">
    <svg width="150" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(0,237,100,0.6)]">
      <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.132 20.177 10.244 17.819 10.034C17.497 6.638 14.651 4 11 4C7.535 4 4.825 6.64 4.5 10.034C2.143 10.244 0.5 12.132 0.5 14.5C0.5 16.9853 2.51472 19 5 19H17.5Z" stroke="#00ED64" strokeOpacity="0.1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.132 20.177 10.244 17.819 10.034C17.497 6.638 14.651 4 11 4C7.535 4 4.825 6.64 4.5 10.034C2.143 10.244 0.5 12.132 0.5 14.5C0.5 16.9853 2.51472 19 5 19H17.5Z" stroke="#00ED64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cloud-dash-anim"/>
    </svg>
    {text && <span className="mt-6 text-xs font-black text-[#00ED64] tracking-[0.3em] uppercase animate-pulse">{text}</span>}
    <style jsx>{` .cloud-dash-anim { stroke-dasharray: 10 30; stroke-dashoffset: 100; animation: cloudMove 2s linear infinite; } @keyframes cloudMove { to { stroke-dashoffset: 0; } } `}</style>
  </div>
);

const GlobalLoaderOverlay = ({ text = "Processing..." }) => (
  <div className="fixed inset-0 z-[9999] bg-[#001E2B]/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
    <CloudDashLoader text={text} />
  </div>
);

const CloudScrollbarStyle = () => (
  <style jsx global>{` ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #00ED64; border-radius: 99px; } ::-webkit-scrollbar-thumb:hover { background: #00c050; } `}</style>
);

const CloudToast = ({ msg, type }: { msg: string, type: 'success' | 'error' }) => (
  <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] animate-in slide-in-from-top-10 fade-in zoom-in duration-500 pointer-events-none">
    <div className={`relative flex items-center gap-4 px-8 py-6 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] border-b-[6px] ${type === 'success' ? 'border-[#00ED64] text-[#001E2B]' : 'border-red-400 text-red-600'} rounded-[3rem] min-w-[340px] justify-center transform hover:scale-105 transition-transform`}>
      <div className={`p-3 rounded-full ${type === 'success' ? 'bg-[#00ED64]/10' : 'bg-red-50'}`}>{type === 'success' ? <CheckCircle size={28} className="text-[#00ED64]" /> : <AlertCircle size={28} className="text-red-500" />}</div>
      <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-widest opacity-40">{type === 'success' ? 'Success' : 'Alert'}</span><span className="font-bold text-base">{String(msg)}</span></div>
    </div>
  </div>
);

// --- SMART AVATAR COMPONENT ---
const UserAvatar = ({ user, className }: { user: any, className: string }) => {
  const [src, setSrc] = useState(user?.photo || user?.photoURL || "");
  
  useEffect(() => {
    setSrc(user?.photo || user?.photoURL || "");
  }, [user]);

  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.displayName || "User")}&background=00ED64&color=001E2B&bold=true`;

  return (
    <img 
      src={src || fallback} 
      alt="Profile" 
      className={className} 
      onError={() => setSrc(fallback)} 
      referrerPolicy="no-referrer"
    />
  );
};

// --- PROFILE COMPONENT ---
const ProfileSection = ({ user, handleToast }: { user: User, handleToast: any }) => {
    const [qrImage, setQrImage] = useState<string | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (docSnap.exists() && docSnap.data().upiQr) setQrImage(docSnap.data().upiQr);
        };
        fetchProfile();
    }, [user]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setQrImage(base64);
                try {
                    await setDoc(doc(db, "users", user.uid), { upiQr: base64, email: user.email, name: user.displayName }, { merge: true });
                    handleToast("Payment QR Code Saved!", 'success');
                } catch(err: any) {
                    handleToast(err.message || "Failed to save QR", 'error');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-500">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-white max-w-md w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#00ED64] to-[#001E2B]"></div>
                <UserAvatar user={user} className="w-24 h-24 rounded-full mx-auto border-4 border-[#00ED64] mb-4 shadow-lg object-cover" />
                <h2 className="text-2xl font-black text-[#001E2B]">{user.displayName}</h2>
                <p className="text-slate-400 text-sm font-medium mb-8">{user.email}</p>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Merchant Settings</p>
                    {qrImage ? (
                        <div className="relative group cursor-pointer" onClick={() => fileInput.current?.click()}>
                            <img src={qrImage} className="w-40 h-40 mx-auto rounded-xl border-2 border-dashed border-slate-300 object-cover" />
                            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs">Change QR</div>
                        </div>
                    ) : (
                        <button onClick={() => fileInput.current?.click()} className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-[#00ED64] hover:text-[#00ED64] transition-all bg-white">
                            <UploadCloud size={32} className="mb-2"/>
                            <span className="text-xs font-bold">Upload Payment QR</span>
                        </button>
                    )}
                    <input type="file" ref={fileInput} className="hidden" accept="image/*" onChange={handleUpload} />
                    <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">This QR code will be shown to students who buy your paid notes. <br/> Platform fee (20%) applies.</p>
                </div>
            </div>
        </div>
    );
};

// --- CHAT WINDOW COMPONENT ---
const ChatWindow = ({ chat: initialChat, user, onClose, onSend, onRead }: any) => {
  const [msgText, setMsgText] = useState("");
  const [chatData, setChatData] = useState(initialChat); 
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialChat?.id) return;
    const unsub = onSnapshot(doc(db, "chats", initialChat.id), {
        next: (docSnap) => {
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                setChatData(data);
                if(onRead) onRead(docSnap.id); 
            }
        },
        error: (error) => {
            if (error.code !== 'permission-denied') console.error(error);
        }
    });
    return () => unsub();
  }, [initialChat.id]);

  useEffect(() => {
    if(scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatData.messages]);

  const handleSend = () => {
    if(!msgText.trim()) return;
    onSend(initialChat.id, msgText);
    setMsgText("");
  };

  const otherParticipant = chatData.participantsData?.find((p:any) => p.uid !== user.uid);
  const otherParticipantName = otherParticipant?.name || "User";
  const otherParticipantId = otherParticipant?.uid;

  const otherUserLastRead = chatData.lastRead?.[otherParticipantId]?.seconds || 0;

  return (
    <div className="fixed bottom-24 right-4 md:right-24 z-[1000] w-[90%] md:w-96 h-[500px] bg-white rounded-[32px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 font-sans">
      <div className="bg-[#001E2B] p-4 flex justify-between items-center text-white cursor-pointer" onClick={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00ED64] rounded-full text-[#001E2B]"><MessageCircle size={18}/></div>
          <div>
            <h4 className="font-bold text-sm">{otherParticipantName}</h4>
            <p className="text-[10px] text-[#00ED64] truncate max-w-[150px]">{chatData.resourceTitle}</p>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={18}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {chatData.messages && chatData.messages.length > 0 ? (
            chatData.messages.map((m: any, i: number) => {
              const isMe = m.senderId === user.uid;
              const isLast = i === chatData.messages.length - 1;
              const isSeen = isMe && isLast && m.timestamp?.seconds <= otherUserLastRead;

              return (
                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${isMe ? 'bg-[#00ED64] text-[#001E2B] rounded-tr-none' : 'bg-white text-slate-600 rounded-tl-none border border-slate-100'}`}>
                    {m.text}
                    </div>
                    {isSeen && (
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1 pr-1 animate-in fade-in duration-500">
                            <CheckCheck size={12} className="text-blue-500"/> Seen
                        </span>
                    )}
                </div>
              );
            })
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <MessageCircle size={32} className="mb-2 opacity-50"/>
                <p className="text-xs font-bold uppercase tracking-widest">Start the chat</p>
            </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input 
          value={msgText} 
          onChange={(e) => setMsgText(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..." 
          className="flex-1 bg-slate-50 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 ring-[#00ED64] font-medium text-[#001E2B]" 
        />
        <button onClick={handleSend} className="p-3 bg-[#001E2B] text-[#00ED64] rounded-xl hover:scale-105 transition-transform shadow-lg"><Send size={18}/></button>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('marketplace'); 
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  // PAYMENT & CHAT STATE
  const [paymentResource, setPaymentResource] = useState<any>(null); 
  const [ownerQr, setOwnerQr] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [inboxChats, setInboxChats] = useState<any[]>([]);

  // NOTIFICATION REFS
  const lastProcessedMsgRef = useRef<string | null>(null);
  const prevRequestsLength = useRef(0);
  const isFirstLoad = useRef(true);

  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // AI & TOOLS
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', text: string, image?: string}[]>([]);
  const [savedSessions, setSavedSessions] = useState<{id: string, title: string, messages: any[]}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [viewingFile, setViewingFile] = useState<{id: string, url: string, title: string} | null>(null);
  const [personalNote, setPersonalNote] = useState("");
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isPenActive, setIsPenActive] = useState(false);
  const [penColor, setPenColor] = useState("#000000"); 
  const [toolType, setToolType] = useState<'pen' | 'eraser' | 'highlighter'>('pen');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);
  useEffect(() => { if (viewingFile) setIsSidebarOpen(false); else setIsSidebarOpen(true); }, [viewingFile]);

  const handleToast = (arg1: any, type: 'success' | 'error' = 'success') => { 
      let message = "Operation successful";
      if (typeof arg1 === 'string') {
          message = arg1;
      } else if (typeof arg1 === 'object' && arg1 !== null) {
          message = arg1.message || arg1.code || "Action Failed";
      }
      setToast({ msg: message, type }); 
      setTimeout(() => setToast(null), 4000); 
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
        onSnapshot(q, {
            next: (snap) => setResources(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
            error: (err) => { if(err.code !== 'permission-denied') console.error(err); }
        });
      } else {
        setUser(null);
        setResources([]);
        setInboxChats([]);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "chats"), 
      where("participants", "array-contains", user.uid),
      orderBy("lastUpdated", "desc")
    );
    const unsubscribe = onSnapshot(q, {
        next: (snapshot) => {
            const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInboxChats(chats);
        },
        error: (err) => { 
            if(err.code !== 'permission-denied') console.error(err); 
        }
    });
    return () => unsubscribe();
  }, [user]);

  // --- NOTIFICATION WATCHER ---
  useEffect(() => {
    if(!user) return;

    if (inboxChats.length > 0) {
        const latestChat = inboxChats[0];
        const lastMsg = latestChat.messages?.[latestChat.messages.length - 1];

        if (lastMsg) {
            const msgSignature = `${latestChat.id}_${lastMsg.timestamp?.seconds}_${lastMsg.text}`;
            if (lastProcessedMsgRef.current && lastProcessedMsgRef.current !== msgSignature) {
                if (lastMsg.senderId !== user.uid) {
                    const senderName = latestChat.participantsData?.find((p:any) => p.uid === lastMsg.senderId)?.name || "Someone";
                    handleToast(`New message from ${senderName}`, 'success');
                }
            }
            lastProcessedMsgRef.current = msgSignature;
        }
    }

    const currentPendingRequests = resources.reduce((acc, res) => {
        return res.ownerId === user.uid ? acc + (res.requests?.length || 0) : acc;
    }, 0);

    if (!isFirstLoad.current && currentPendingRequests > prevRequestsLength.current) {
        handleToast("You have a new Access Request!", 'success');
    }
    
    prevRequestsLength.current = currentPendingRequests;
    if(resources.length > 0 || inboxChats.length > 0) isFirstLoad.current = false;

  }, [inboxChats, resources, user]);

  const notificationCount = useMemo(() => {
    if (!user) return 0;
    const pendingRequests = resources.reduce((acc, res) => {
        return res.ownerId === user.uid ? acc + (res.requests?.length || 0) : acc;
    }, 0);
    const unreadMessages = inboxChats.filter((chat: any) => {
        const lastMsg = chat.messages?.[chat.messages.length - 1];
        if (lastMsg && lastMsg.senderId === user.uid) return false;
        const lastUpdate = chat.lastUpdated?.seconds || 0;
        const myRead = chat.lastRead?.[user.uid]?.seconds || 0;
        return lastUpdate > myRead;
    }).length;
    return pendingRequests + unreadMessages;
  }, [resources, inboxChats, user]);

  // --- HELPER FUNCTIONS FOR ACTION BUTTONS ---
  const handleMarkAsRead = async (chatId: string) => {
    if(!user) return;
    try {
        await updateDoc(doc(db, "chats", chatId), { [`lastRead.${user.uid}`]: Timestamp.now() });
    } catch(err) { console.error(err); }
  };

  const handlePaymentSuccess = async () => {
      setGlobalLoading(true);
      try {
          const expiryDate = new Date(); expiryDate.setDate(expiryDate.getDate() + 365);
          await updateDoc(doc(db, "resources", paymentResource.id), { approvedUsers: arrayUnion({ uid: user?.uid, expiresAt: Timestamp.fromDate(expiryDate), name: user?.displayName || "Student" }) });
          handleToast(`Payment Successful! Access Granted to ${paymentResource.title}`, 'success');
          setPaymentResource(null); setOwnerQr(null); setActiveTab('library');
      } catch(err) { handleToast(err, 'error'); } finally { setGlobalLoading(false); }
  };

  const handleApprove = async (resId: string, req: any) => { 
    setGlobalLoading(true); 
    try { 
        const expiryDate = new Date(); 
        expiryDate.setDate(expiryDate.getDate() + 7); 
        await updateDoc(doc(db, "resources", resId), { 
            approvedUsers: arrayUnion({ uid: req.uid, expiresAt: Timestamp.fromDate(expiryDate), name: req.name || "Student" }), 
            requests: arrayRemove(req) 
        }); 
        handleToast("Access Granted!", 'success'); 
    } catch { handleToast("Approval Failed.", 'error'); } finally { setGlobalLoading(false); } 
  };
  
  const handleDecline = async (resId: string, req: any) => { 
    setGlobalLoading(true); 
    try { 
        await updateDoc(doc(db, "resources", resId), { requests: arrayRemove(req) }); 
        handleToast("Request Declined.", 'success'); 
    } catch { handleToast("Action Failed.", 'error'); } finally { setGlobalLoading(false); } 
  };
  
  const handleDeleteResource = async (resId: string) => { 
    if (!confirm("Are you sure?")) return; 
    setGlobalLoading(true); 
    try { 
        await deleteDoc(doc(db, "resources", resId)); 
        handleToast("Deleted successfully.", 'success'); 
    } catch { handleToast("Delete failed.", 'error'); } finally { setGlobalLoading(false); } 
  };

  const colleges = useMemo(() => [...new Set(["JNTUH", "Osmania University", "CBIT", "VNR VJIET", "Vasavi College", "Gokaraju Rangaraju", "Sreenidhi (SNIST)", "Mahindra University", "IIT Hyderabad", "IIIT Hyderabad", "KL University", ...resources.map(r => r.college?.trim()).filter(Boolean)])].sort(), [resources]);
  const subjects = useMemo(() => !selectedCollege ? [] : ['All', ...new Set(resources.filter(r => r.college?.toLowerCase() === selectedCollege.toLowerCase() || !r.college).map(r => r.subject?.toUpperCase().trim()))].filter(Boolean), [resources, selectedCollege]);

  const filteredResources = useMemo(() => {
    let res = [...resources];
    if (activeTab === 'library') res = res.filter(r => r.ownerId === user?.uid || r.approvedUsers?.some((a: any) => a.uid === user?.uid));
    else if (activeTab === 'marketplace') {
       if (selectedCollege) res = res.filter(r => !r.college || r.college.toLowerCase().includes(selectedCollege.toLowerCase()));
       if (selectedSubject && selectedSubject !== 'All') res = res.filter(r => r.subject?.toUpperCase() === selectedSubject);
    }
    if (searchQuery) res = res.filter(r => r.title?.toLowerCase().includes(searchQuery.toLowerCase()) || r.subject?.toLowerCase().includes(searchQuery.toLowerCase()));
    return res.sort((a, b) => sortBy === 'newest' ? (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0) : (Number(a.price) || 0) - (Number(b.price) || 0));
  }, [resources, activeTab, selectedCollege, selectedSubject, searchQuery, sortBy, user]);

  useEffect(() => {
    if (viewingFile && user && isPenActive && canvasRef.current) {
      const loadStudyData = async () => {
        if (canvasRef.current) { const ctx = canvasRef.current.getContext('2d'); ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); }
        const docRef = doc(db, "users", user.uid, "study_data", viewingFile.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPersonalNote(data.note || "");
          if (data.canvasData) { const img = new Image(); img.src = data.canvasData; img.onload = () => { const ctx = canvasRef.current?.getContext('2d'); ctx?.drawImage(img, 0, 0); }; }
        } else { setPersonalNote(""); }
      };
      setTimeout(loadStudyData, 100);
    }
  }, [viewingFile, user, isPenActive]);

  const handleSaveStudyData = async () => {
    if (!user || !viewingFile) return;
    try {
      let canvasData = null;
      if (canvasRef.current) canvasData = canvasRef.current.toDataURL("image/png");
      await setDoc(doc(db, "users", user.uid, "study_data", viewingFile.id), { note: personalNote, canvasData, updatedAt: Timestamp.now(), title: viewingFile.title }, { merge: true });
      handleToast("Saved Successfully!", 'success');
    } catch(err) { handleToast(err, 'error'); }
  };

  const startDrawing = (e: React.MouseEvent) => { if (!isPenActive || !canvasRef.current) return; const ctx = canvasRef.current.getContext('2d'); if (!ctx) return; ctx.beginPath(); ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); setIsDrawing(true); };
  const draw = (e: React.MouseEvent) => { if (!isDrawing || !isPenActive || !canvasRef.current) return; const ctx = canvasRef.current.getContext('2d'); if (!ctx) return; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (toolType === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1.0; ctx.lineWidth = 30; } else if (toolType === 'highlighter') { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.5; ctx.strokeStyle = penColor; ctx.lineWidth = 25; } else { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1.0; ctx.strokeStyle = penColor; ctx.lineWidth = 3; } ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); ctx.stroke(); };
  const stopDrawing = () => { setIsDrawing(false); if (canvasRef.current) { const ctx = canvasRef.current.getContext('2d'); ctx?.closePath(); ctx!.globalCompositeOperation = 'source-over'; ctx!.globalAlpha = 1.0; } };
  const clearCanvas = () => { if (canvasRef.current) { const ctx = canvasRef.current.getContext('2d'); ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); } };

  const startNewChat = () => { if (chatHistory.length > 0) { setSavedSessions(prev => [{ id: Date.now().toString(), title: chatHistory[0].text.substring(0, 30) + "...", messages: chatHistory }, ...prev]); } setChatHistory([]); setIsHistoryOpen(false); };
  const loadSession = (session: any) => { if (chatHistory.length > 0) { setSavedSessions(prev => [{ id: Date.now().toString(), title: "Saved Session", messages: chatHistory }, ...prev]); } setChatHistory(session.messages); setIsHistoryOpen(false); };
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setSelectedImage(reader.result as string); reader.readAsDataURL(file); } };
  const sendChatMessage = async () => { if (!chatInput.trim() && !selectedImage) return; setChatHistory(prev => [...prev, { role: 'user', text: chatInput, image: selectedImage || undefined }]); const currentInput = chatInput; const currentImage = selectedImage; setChatInput(""); setSelectedImage(null); setIsTyping(true); try { const messageContent: any[] = [{ type: "text", text: currentInput || "Analyze this." }]; if (currentImage) messageContent.push({ type: "image_url", image_url: { url: currentImage } }); const response = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json", "HTTP-Referer": "http://localhost:3000", "X-Title": "CampusCloud" }, body: JSON.stringify({ model: "openai/gpt-4o-mini", messages: [{ "role": "system", "content": "You are a helpful academic tutor." }, { "role": "user", "content": messageContent }] }) }); const data = await response.json(); setChatHistory(prev => [...prev, { role: 'assistant', text: data.choices?.[0]?.message?.content || "No response." }]); } catch { setChatHistory(prev => [...prev, { role: 'assistant', text: "Connection error." }]); } finally { setIsTyping(false); } };

  const handleDownload = (fileUrl: string) => { window.open(fileUrl, '_blank'); };
  
  const handleAction = async (resource: any, actionType: 'buy' | 'request' | 'chat') => {
    if (!user) return;

    if (actionType === 'chat') {
       setGlobalLoading(true);
       try {
         const chatId = `${resource.id}_${user.uid}_${resource.ownerId}`;
         const chatDocRef = doc(db, "chats", chatId);
         const chatSnap = await getDoc(chatDocRef);

         if (chatSnap.exists()) {
            setActiveChat({ id: chatSnap.id, ...chatSnap.data() });
         } else {
            const newChatData = {
               participants: [user.uid, resource.ownerId],
               participantsData: [
                 { uid: user.uid, name: user.displayName || "User", photo: user.photoURL },
                 { uid: resource.ownerId, name: resource.ownerName || "Owner", photo: null } 
               ],
               resourceId: resource.id,
               resourceTitle: resource.title,
               messages: [],
               lastUpdated: Timestamp.now(),
               lastRead: { [user.uid]: Timestamp.now() }
            };
            await setDoc(chatDocRef, newChatData);
            setActiveChat({ id: chatId, ...newChatData });
         }
       } catch (err: any) {
         handleToast("Could not open chat", 'error');
         console.error(err);
       } finally { setGlobalLoading(false); }
       return;
    }

    if (actionType === 'buy') {
        setGlobalLoading(true);
        try {
            const ownerSnap = await getDoc(doc(db, "users", resource.ownerId));
            if(ownerSnap.exists()) setOwnerQr(ownerSnap.data().upiQr || null);
            setPaymentResource(resource);
        } catch(error) { handleToast(error, 'error'); } finally { setGlobalLoading(false); }
    } else {
        if (resource.requests?.some((r: any) => r.uid === user.uid)) { handleToast("Request already pending!", 'error'); return; }
        setGlobalLoading(true);
        try { 
            await updateDoc(doc(db, "resources", resource.id), { 
                requests: arrayUnion({ uid: user.uid, name: user.displayName || "Student", photo: user.photoURL || "", requestedAt: Timestamp.now() }) 
            }); 
            handleToast("Request Sent Successfully!", 'success'); 
        } catch(err: any) { handleToast(err, 'error'); } finally { setGlobalLoading(false); }
    }
  };

  const handleSendMessage = async (chatId: string, text: string) => {
    if (!user) return;
    try {
      const message = {
        senderId: user.uid,
        text: text,
        timestamp: Timestamp.now()
      };
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(message),
        lastUpdated: Timestamp.now(),
        [`lastRead.${user.uid}`]: Timestamp.now() 
      });
    } catch (err) {
      console.error(err);
      handleToast("Failed to send", 'error');
    }
  };

  // --- LOGIN WITH DOMAIN CHECK ---
  const handleLogin = async () => {
    try {
        setGlobalLoading(true);
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const email = result.user.email || '';
        
        // ALLOWED DOMAINS REGEX
        const allowedDomains = /@(klh\.edu\.in|cbit\.ac\.in|vce\.ac\.in|osmania\.ac\\.in|jntuh\.ac\.in)$/;

        if (!allowedDomains.test(email)) {
            await signOut(auth); // Instant logout if invalid
            handleToast("Access Restricted: Please use your official College Email ID.", "error");
        } else {
            handleToast("Welcome back!", "success");
        }
    } catch (error: any) {
        console.error(error);
        handleToast("Login failed. Please try again.", "error");
    } finally {
        setGlobalLoading(false);
    }
  };

  if (!user) return (
    <div className="h-screen w-screen bg-[#001E2B] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-[#00ED64]/10 rounded-full blur-[150px] animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#00ED64]/5 rounded-full blur-[120px]" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      </div>

      {/* LOGIN CARD */}
      <div className="z-10 w-full max-w-5xl h-[600px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-2xl flex overflow-hidden animate-in zoom-in duration-500">
        
        {/* Left Side: Hero */}
        <div className="flex-1 bg-gradient-to-br from-[#00ED64]/20 to-transparent p-12 flex flex-col justify-center relative">
            <div className="absolute top-10 left-10"><Cloud size={40} className="text-[#00ED64]" /></div>
            <h1 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight">
                Connect.<br/>
                Share.<br/>
                <span className="text-[#00ED64]">Excel.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
                The exclusive academic resource marketplace for top engineering colleges.
            </p>
            <div className="mt-12 flex gap-4 items-center">
                <div className="flex -space-x-4">
                     {/* 1. KLH */}
                     <img src="https://www.google.com/s2/favicons?domain=klh.edu.in&sz=128" className="w-10 h-10 rounded-full border-2 border-[#001E2B] bg-white object-contain p-1" />
                     {/* 2. BITS */}
                     <img src="https://www.google.com/s2/favicons?domain=bits-pilani.ac.in&sz=128" className="w-10 h-10 rounded-full border-2 border-[#001E2B] bg-white object-contain p-1" />
                     {/* 3. More */}
                     <div className="w-10 h-10 rounded-full border-2 border-[#001E2B] bg-slate-800 flex items-center justify-center text-[7px] font-bold text-white uppercase tracking-tighter text-center leading-tight">
                        +AND<br/>MORE
                     </div>
                </div>
                <div className="text-white text-xs font-bold flex flex-col justify-center">
                    <span>1000+ Students</span>
                    <span className="text-[#00ED64]">Joined Already</span>
                </div>
            </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 bg-[#001E2B]/80 p-12 flex flex-col justify-center items-center text-center">
            <div className="mb-8 p-4 bg-white/5 rounded-full border border-white/10 shadow-inner">
                <LockKeyhole size={32} className="text-[#00ED64]"/>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Student Login</h2>
            <p className="text-slate-400 text-sm mb-8">Please use your official college email ID to continue.</p>
            
            <button onClick={handleLogin} className="w-full max-w-xs bg-white text-[#001E2B] py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,237,100,0.4)] transition-all flex items-center justify-center gap-3 group">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="G" /> 
                <span>Continue with Google</span> 
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#001E2B] transition-colors" />
            </button>

            <div className="mt-8 pt-8 border-t border-white/10 w-full max-w-xs">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Supported Campuses</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {/* EXPANDED HYDERABAD CAMPUS LIST */}
                    {['KLH', 'CBIT', 'VNR VJIET', 'Osmania', 'JNTUH', 'Vasavi', 'GRIET', 'SNIST', 'Mahindra', 'IIT Hyd', 'IIIT Hyd', 'BITS Hyd'].map(c => (
                        <span key={c} className="text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5">{c}</span>
                    ))}
                    <span className="text-[10px] text-[#00ED64] bg-white/5 px-2 py-1 rounded border border-white/5 font-bold">and more...</span>
                </div>
            </div>
        </div>

      </div>
      
      {/* Toast Notification */}
      {toast && <CloudToast msg={toast.msg} type={toast.type} />}
      {globalLoading && <GlobalLoaderOverlay />}
    </div>
  );

  const mainMargin = isSidebarOpen ? 'ml-64' : 'ml-0';
  const viewerWidthClass = isChatOpen ? 'w-[calc(100%-450px)]' : 'w-full';

  return (
    <div className="flex min-h-screen text-[#001E2B] font-sans overflow-hidden relative">
      <AnimatedBackground />
      <CloudScrollbarStyle />
      {globalLoading && <GlobalLoaderOverlay text="Processing..." />}
      {toast && <CloudToast msg={toast.msg} type={toast.type} />}

      {!isSidebarOpen && !viewingFile && !paymentResource && <button onClick={() => setIsSidebarOpen(true)} className="fixed top-6 left-6 z-[100] p-3 bg-white/90 rounded-xl shadow-lg border hover:scale-110 transition-all"><Menu size={24} className="text-[#001E2B]" /></button>}

      <div className={`fixed top-0 left-0 h-full z-40 transition-transform duration-500 ease-in-out ${isSidebarOpen && !viewingFile && !paymentResource ? 'translate-x-0' : '-translate-x-full'}`}>
         <Sidebar setActiveTab={setActiveTab} activeTab={activeTab} notificationCount={notificationCount} />
         <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 md:hidden"><X /></button>
      </div>
      
      <main className={`flex-1 ${mainMargin} p-12 transition-all duration-500 relative h-screen overflow-y-auto cloud-scrollbar z-10 ${isChatOpen ? 'mr-[450px]' : 'mr-0'}`}>
        {!viewingFile && !paymentResource && activeTab !== 'upload' && <Watermark />}
        {!viewingFile && !paymentResource && activeTab === 'profile' && <ProfileSection user={user} handleToast={handleToast} />}

        {/* PAYMENT MODAL */}
        {paymentResource && (
            <div className="fixed inset-0 z-50 bg-[#001E2B] flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom-10 fade-in">
                <div className="absolute top-10 left-10"><button onClick={() => { setPaymentResource(null); setOwnerQr(null); }} className="text-white flex items-center gap-2 hover:text-[#00ED64] transition-colors"><ArrowLeft/> Cancel Transaction</button></div>
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#00ED64]"></div>
                    <div className="mb-6 flex justify-center"><div className="p-4 bg-[#00ED64]/10 rounded-full text-[#00ED64]"><Wallet size={48}/></div></div>
                    <h2 className="text-2xl font-black text-[#001E2B] mb-2">Secure Checkout</h2>
                    <p className="text-slate-500 mb-8">Purchase access to <strong>{paymentResource.title}</strong></p>
                    {ownerQr ? (
                        <div className="mb-8 flex flex-col items-center animate-in zoom-in">
                            <img src={ownerQr} alt="Merchant QR" className="w-48 h-48 rounded-xl border-4 border-[#00ED64] shadow-xl object-cover" />
                            <p className="text-[10px] font-bold text-[#001E2B] mt-2 uppercase tracking-widest bg-green-100 px-3 py-1 rounded-full">Verified Merchant QR</p>
                        </div>
                    ) : (
                        <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-2"/>
                            <p className="text-xs text-slate-400 font-bold">Standard UPI Payment</p>
                        </div>
                    )}
                    <div className="flex gap-4 mb-8 bg-slate-50 p-2 rounded-2xl">
                        <button disabled className={`flex-1 py-3 rounded-xl font-bold bg-[#001E2B] text-white shadow-lg flex items-center justify-center gap-2`}><QrCode size={18}/> UPI ONLY</button>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl mb-8">
                        <div className="flex justify-between items-center mb-2 text-xs font-bold text-slate-400"><span>Base Price</span> <span>₹{paymentResource.price}</span></div>
                        <div className="flex justify-between items-center mb-4 text-xs font-bold text-[#00ED64]"><span>Platform Fee (20%)</span> <span>Included</span></div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-200"><span className="text-slate-700 font-black">Total Amount</span><span className="text-3xl font-black text-[#001E2B]">₹{paymentResource.price}</span></div>
                    </div>
                    <button onClick={handlePaymentSuccess} className="w-full bg-[#00ED64] text-[#001E2B] py-4 rounded-2xl font-black text-lg hover:bg-[#00c050] transition-all shadow-lg hover:scale-[1.02]">PAY & UNLOCK</button>
                    <p className="text-[10px] text-slate-400 mt-6 flex items-center justify-center gap-1"><ShieldCheck size={12}/> 100% Secure Transaction via CampusCloud</p>
                </div>
            </div>
        )}

        {/* HEADER */}
        {!viewingFile && !paymentResource && activeTab !== 'profile' && (
          <header className="flex flex-col gap-8 mb-12 pl-4 relative z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-extrabold tracking-tight text-[#001E2B] drop-shadow-sm uppercase">
                {activeTab === 'upload' ? 'Upload' : activeTab === 'library' ? 'Library' : activeTab === 'consumers' ? 'Users' : activeTab === 'requests' ? 'Requests & Messages' : (selectedCollege && !selectedSubject) ? selectedCollege : (selectedCollege && selectedSubject) ? selectedSubject : 'Discover'}
              </h2>
              <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl px-6 py-3 rounded-full border border-white shadow-lg">
                 <div className="text-right hidden md:block"><p className="text-[10px] font-black text-[#00ED64] uppercase">Verified</p><p className="font-bold text-sm text-[#001E2B]">{user.displayName}</p></div>
                 
                 {/* SMART AVATAR (FALLBACK ENABLED) */}
                 <UserAvatar user={user} className="w-10 h-10 rounded-full border-[3px] border-[#00ED64]" />
                 
                 <button onClick={() => signOut(auth)} className="ml-2 p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><LogOut size={18}/></button>
              </div>
            </div>
            {activeTab === 'marketplace' && selectedCollege && selectedSubject && (
              <div className="flex gap-4 animate-in slide-in-from-left-10">
                <div className="flex-1 relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title..." className="w-full bg-white p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-[#00ED64] shadow-sm font-medium" /></div>
                <div className="relative group"><div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Filter size={18} className="text-[#00ED64]" /></div><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-full bg-white pl-12 pr-8 rounded-2xl outline-none focus:ring-2 ring-[#00ED64] shadow-sm font-bold text-sm text-[#001E2B] cursor-pointer"><option value="newest">Newest First</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option></select></div>
              </div>
            )}
          </header>
        )}

        {/* VIEWER */}
        {viewingFile && !paymentResource && (
          <div className={`fixed top-0 left-0 bottom-0 z-[40] bg-[#001E2B] flex flex-col transition-all duration-500 ${viewerWidthClass}`}>
             <div className="flex justify-between items-center p-4 bg-[#001E2B] text-white border-b border-white/10 pl-20">
                <div className="flex items-center gap-4">
                  <button onClick={() => { setViewingFile(null); setIsSidebarOpen(true); setIsPenActive(false); }} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest"><ArrowLeft size={16} /> Exit</button>
                  <h3 className="text-lg font-bold tracking-tight truncate max-w-[250px]">{viewingFile.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                      <button onClick={() => { setIsPenActive(!isPenActive); setToolType('pen'); }} className={`p-2 rounded-full transition-all ${isPenActive && toolType === 'pen' ? 'bg-[#00ED64] text-[#001E2B] shadow-lg scale-110' : 'text-white hover:bg-white/10'}`} title="Pen"><PenTool size={18} /></button>
                      <button onClick={() => { setIsPenActive(true); setToolType('highlighter'); setPenColor('#FFFF00'); }} className={`p-2 rounded-full transition-all ${isPenActive && toolType === 'highlighter' ? 'bg-yellow-400 text-[#001E2B] shadow-lg scale-110' : 'text-white hover:bg-white/10'}`} title="Highlighter"><Highlighter size={18} /></button>
                      <button onClick={() => { setIsPenActive(true); setToolType('eraser'); }} className={`p-2 rounded-full transition-all ${toolType === 'eraser' && isPenActive ? 'bg-white text-[#001E2B] shadow-lg scale-110' : 'text-white hover:bg-white/10'}`} title="Eraser"><Eraser size={18} /></button>
                      <div className="w-px h-5 bg-white/20 mx-1"></div>
                      {[{ color: '#000000' }, { color: '#00ED64' }, { color: '#EF4444' }, { color: '#3B82F6' }, { color: '#FFFF00' }].map((c) => (<button key={c.color} onClick={() => { setPenColor(c.color); setToolType(c.color === '#FFFF00' ? 'highlighter' : 'pen'); setIsPenActive(true); }} className={`w-6 h-6 rounded-full border-2 transition-transform ${penColor === c.color && toolType !== 'eraser' ? 'border-white scale-125' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: c.color }} />))}
                      <div className="w-px h-5 bg-white/20 mx-1"></div>
                      <button onClick={clearCanvas} className="text-[10px] font-bold text-red-300 hover:text-red-100 uppercase">Clear</button>
                   </div>
                   <button onClick={() => setIsNotesOpen(!isNotesOpen)} className={`p-2.5 rounded-xl transition-all ${isNotesOpen ? 'bg-[#00ED64] text-[#001E2B]' : 'bg-white/10 text-white hover:bg-white/20'}`} title="Typed Notes"><StickyNote size={20} /></button>
                   <button onClick={handleSaveStudyData} className="flex items-center gap-2 bg-[#00ED64] text-[#001E2B] px-4 py-2 rounded-xl font-bold text-xs hover:bg-white transition-colors"><Save size={16}/> Save</button>
                   {!isChatOpen && <button onClick={() => setIsChatOpen(true)} className="ml-2 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"><BrainCircuit size={20} /></button>}
                </div>
             </div>
             <div className="flex-1 w-full bg-white relative overflow-hidden">
                <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className={`absolute inset-0 z-50 touch-none ${isPenActive ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} />
                <div className={`absolute top-0 right-0 h-full w-80 bg-[#fefce8] border-l border-yellow-200 z-[60] shadow-2xl transition-transform duration-300 transform ${isNotesOpen ? 'translate-x-0' : 'translate-x-full'} p-6 flex flex-col`}>
                   <div className="flex justify-between items-center mb-4"><h3 className="font-black text-yellow-800 flex items-center gap-2"><StickyNote size={18}/> My Notes</h3><button onClick={() => setIsNotesOpen(false)} className="text-yellow-600 hover:text-yellow-800"><X size={18}/></button></div>
                   <textarea value={personalNote} onChange={(e) => setPersonalNote(e.target.value)} placeholder="Type your study notes here..." className="flex-1 w-full bg-transparent outline-none resize-none text-sm text-slate-700 font-medium leading-relaxed" />
                   <p className="text-[10px] text-yellow-600 mt-2 italic text-center">Auto-saved to your profile</p>
                </div>
                <iframe src={viewingFile.url.match(/\.(jpeg|jpg|gif|png|pdf)$/i) ? viewingFile.url : `https://docs.google.com/viewer?url=${encodeURIComponent(viewingFile.url)}&embedded=true`} className="w-full h-full border-none" title="Viewer" />
             </div>
          </div>
        )}

        <div className="relative z-10">
            {/* LEVEL 1: Colleges */}
            {!viewingFile && !paymentResource && activeTab === 'marketplace' && !selectedCollege && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {colleges.map(college => (
                <button key={college} onClick={() => setSelectedCollege(college)} className="group bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white hover:border-[#00ED64] transition-all text-left relative overflow-hidden shadow-lg hover:-translate-y-2">
                    <div className="p-5 bg-[#00ED64]/10 rounded-3xl w-fit mb-8 text-[#00684A] group-hover:bg-[#00ED64] group-hover:text-[#001E2B] transition-colors"><School size={32} /></div>
                    <h3 className="text-2xl font-bold text-[#001E2B] relative z-10">{college}</h3>
                    <div className="absolute -bottom-10 -right-10 opacity-0 group-hover:opacity-100 group-hover:-translate-y-10 transition-all duration-700 ease-out"><Cloud size={140} className="text-[#00ED64]/20" fill="currentColor" /></div>
                </button>
                ))}
            </div>
            )}

            {/* LEVEL 2: Subjects */}
            {!viewingFile && !paymentResource && activeTab === 'marketplace' && selectedCollege && !selectedSubject && (
            <div className="space-y-6">
                <button onClick={() => setSelectedCollege(null)} className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-[#00ED64] flex items-center gap-2"><ArrowLeft size={16}/> Back to Colleges</button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {subjects.length > 0 ? subjects.map(sub => (
                    <button key={sub} onClick={() => setSelectedSubject(sub)} className="group bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white hover:border-[#00ED64] transition-all text-left relative overflow-hidden shadow-lg hover:-translate-y-2">
                    <div className="p-5 bg-[#00ED64]/10 rounded-3xl w-fit mb-8 text-[#00684A] group-hover:bg-[#00ED64] group-hover:text-[#001E2B] transition-colors"><LayoutGrid size={32} /></div>
                    <h3 className="text-2xl font-bold text-[#001E2B] relative z-10">{sub}</h3>
                    <div className="absolute -bottom-10 -right-10 opacity-0 group-hover:opacity-100 group-hover:-translate-y-10 transition-all duration-700 ease-out"><Cloud size={140} className="text-[#00ED64]/20" fill="currentColor" /></div>
                    </button>
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-40"><School size={64} className="mb-4"/><p className="font-bold text-lg">No subjects listed.</p></div>
                )}
                </div>
            </div>
            )}

            {/* LEVEL 3: Resources */}
            {!viewingFile && !paymentResource && (
            (activeTab === 'marketplace' && selectedCollege && selectedSubject) || 
            activeTab === 'library'
            ) && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {activeTab === 'marketplace' && <button onClick={() => setSelectedSubject(null)} className="col-span-full text-slate-400 font-bold text-xs uppercase tracking-widest mb-4 hover:text-[#00ED64] flex items-center gap-2"><ArrowLeft size={16}/> Back to Subjects</button>}
                {filteredResources.length > 0 ? filteredResources.map((item: any) => (
                <ResourceCard 
                    key={item.id} 
                    item={item} 
                    user={user} 
                    onView={() => setViewingFile({id: item.id, url: item.fileUrl, title: item.title})} 
                    onDownload={handleDownload}
                    onAction={(type: 'buy' | 'request' | 'chat') => handleAction(item, type)} 
                    onDelete={handleDeleteResource} 
                />
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-40"><LayoutGrid size={64} className="mb-4"/><p className="font-bold text-lg">No resources found.</p></div>
                )}
            </div>
            )}

            {/* CONSUMERS */}
            {!viewingFile && !paymentResource && activeTab === 'consumers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {resources.filter(r => r.ownerId === user?.uid && r.approvedUsers?.length > 0).length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-40"><Users size={64} className="mb-4"/><p className="font-bold text-lg">No active students.</p></div>
                ) : (
                    resources.filter(r => r.ownerId === user?.uid && r.approvedUsers?.length > 0).map(res => 
                    res.approvedUsers.map((consumer: any, i: number) => (
                        <div key={`${res.id}-${i}`} className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-[#F0FDF4] rounded-full mb-6 flex items-center justify-center font-black text-[#00ED64] text-3xl border-4 border-white shadow-lg">{consumer?.name?.charAt(0) || "U"}</div>
                            <p className="font-bold text-[#001E2B] text-xl mb-1">{consumer?.name || "Student"}</p>
                            <div className="bg-[#00ED64] text-[#001E2B] px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 mt-4"><Zap size={14} fill="currentColor"/> Active</div>
                        </div>
                    ))
                    )
                )}
            </div>
            )}

            {/* REQUESTS & INBOX TAB */}
            {!viewingFile && !paymentResource && activeTab === 'requests' && (
              <div className="flex flex-col gap-10 pb-20">
                
                {/* SECTION 1: MESSAGES */}
                <div>
                  <h3 className="text-xl font-black text-[#001E2B] mb-6 flex items-center gap-2">
                    <MessageCircle className="text-[#00ED64]" /> Messages & Inquiries
                  </h3>
                  {inboxChats.length === 0 ? (
                    <div className="p-8 bg-slate-50 rounded-[32px] text-center border border-dashed border-slate-300">
                       <p className="text-slate-400 font-bold text-sm">No messages yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inboxChats.map((chat) => {
                         const otherUser = chat.participantsData?.find((p:any) => p.uid !== user.uid);
                         const lastMsg = chat.messages?.[chat.messages.length - 1];
                         
                         // Check if this chat is unread
                         const lastUpdate = chat.lastUpdated?.seconds || 0;
                         const myRead = chat.lastRead?.[user.uid]?.seconds || 0;
                         const isUnread = lastUpdate > myRead && lastMsg?.senderId !== user.uid;

                         return (
                           <div key={chat.id} onClick={() => setActiveChat(chat)} className={`bg-white p-6 rounded-[24px] border ${isUnread ? 'border-[#00ED64] ring-2 ring-[#00ED64]/20' : 'border-slate-100'} hover:border-[#00ED64] shadow-sm hover:shadow-lg transition-all cursor-pointer flex items-center gap-4 group`}>
                              
                              {/* SMART AVATAR FOR INBOX */}
                              <UserAvatar user={{displayName: otherUser?.name || "User", photoURL: otherUser?.photo}} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />

                              <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center mb-1">
                                  <h4 className="font-bold text-[#001E2B] truncate">{otherUser?.name || "User"}</h4>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {lastMsg?.timestamp ? new Date(lastMsg.timestamp.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                  </span>
                                </div>
                                <p className="text-[10px] font-black text-[#00ED64] uppercase tracking-widest mb-1 truncate">{chat.resourceTitle}</p>
                                <div className="flex justify-between items-center">
                                    <p className={`text-xs truncate font-medium ${isUnread ? 'text-[#001E2B] font-bold' : 'text-slate-500'}`}>{lastMsg?.text || "Start conversation..."}</p>
                                    {isUnread && <div className="w-2 h-2 bg-[#00ED64] rounded-full animate-pulse ml-2"></div>}
                                </div>
                              </div>
                           </div>
                         );
                      })}
                    </div>
                  )}
                </div>

                {/* SECTION 2: ACCESS REQUESTS */}
                <div>
                   <h3 className="text-xl font-black text-[#001E2B] mb-6 flex items-center gap-2">
                      <ShieldCheck className="text-amber-500" /> Access Approvals
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {resources.filter(r => r.ownerId === user?.uid && r.requests?.length > 0).length === 0 ? (
                         <div className="col-span-full flex flex-col items-center justify-center py-10 opacity-40"><p className="font-bold text-sm">No pending access requests.</p></div>
                      ) : (
                         resources.filter(r => r.ownerId === user?.uid && r.requests?.length > 0).map(res => 
                            res.requests.map((req: any, i: number) => (
                               <div key={i} className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center">
                                  
                                  {/* SMART AVATAR FOR REQUESTS */}
                                  <UserAvatar user={{displayName: req?.name, photoURL: req?.photo}} className="w-16 h-16 rounded-2xl border-2 border-[#00ED64]/20 mb-4 object-cover" />

                                  <p className="font-bold text-[#001E2B] text-lg mb-1">{req?.name || "Student"}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">Wants: {res.title}</p>
                                  <div className="flex gap-2 w-full">
                                     <button onClick={() => handleApprove(res.id, req)} className="flex-1 bg-[#00ED64] text-[#001E2B] py-2 rounded-xl font-bold text-xs hover:bg-[#00c050] transition-all">GRANT</button>
                                     <button onClick={() => handleDecline(res.id, req)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"><X size={16}/></button>
                                  </div>
                               </div>
                            ))
                         )
                      )}
                   </div>
                </div>
              </div>
            )}

            {!viewingFile && !paymentResource && activeTab === 'upload' && <AddResource setToast={handleToast} setActiveTab={setActiveTab} setGlobalLoading={setGlobalLoading} />}
        </div>
      </main>

      {/* AI SIDEBAR */}
      <div className={`fixed top-0 right-0 h-full bg-white/80 backdrop-blur-3xl border-l border-white/50 shadow-[-30px_0_100px_rgba(0,30,43,0.15)] transition-all duration-500 z-[500] flex flex-col ${isChatOpen ? 'w-[450px]' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 border-b border-white/50 flex justify-between items-center bg-gradient-to-r from-[#001E2B] to-[#002b3d] text-white">
           <div className="flex items-center gap-4">
             <BrainCircuit className="text-[#00ED64]" size={28} />
             <div><h3 className="font-bold text-lg leading-none">Cloud Mind</h3><p className="text-[10px] text-[#00ED64] font-bold uppercase tracking-widest mt-1">GPT-4o Mini</p></div>
           </div>
           <div className="flex gap-2">
             <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="p-2 text-slate-400 hover:text-white bg-white/10 rounded-full transition-all" title="Chat History"><History size={18}/></button>
             <button onClick={startNewChat} className="p-2 text-slate-400 hover:text-white bg-white/10 rounded-full transition-all" title="New Chat"><MessageSquarePlus size={18}/></button>
             <button onClick={() => setIsChatOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"><X size={20}/></button>
           </div>
        </div>
        
        {isHistoryOpen && (
          <div className="bg-[#f8fafc] border-b border-slate-200 p-4 max-h-60 overflow-y-auto">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Previous Sessions</h4>
             {savedSessions.length === 0 && <p className="text-slate-400 text-sm italic">No saved chats yet.</p>}
             {savedSessions.map(session => (
               <button key={session.id} onClick={() => loadSession(session)} className="w-full text-left p-3 mb-2 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-[#00ED64] hover:shadow-md transition-all flex items-center gap-3">
                 <MessageSquare size={16} className="text-[#00ED64]"/>
                 <span className="text-sm font-bold text-[#001E2B] truncate">{session.title}</span>
               </button>
             ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto cloud-scrollbar p-6 space-y-6 bg-[#F9FBFA]/50">
           {chatHistory.map((msg, i) => (
             <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.image && <img src={msg.image} alt="Upload" className="max-w-[200px] rounded-2xl mb-2 border-2 border-[#00ED64] shadow-md" />}
                <div className={`max-w-[90%] p-6 rounded-[26px] text-sm shadow-sm leading-relaxed backdrop-blur-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-[#00ED64] to-[#00c050] text-[#001E2B] font-semibold rounded-tr-none' : 'bg-white/80 text-[#001E2B] border border-white rounded-tl-none'}`}>
                   {msg.role === 'assistant' ? <div className="prose prose-sm max-w-none prose-p:my-2 prose-strong:text-[#001E2B]"><ReactMarkdown>{msg.text}</ReactMarkdown></div> : msg.text}
                </div>
             </div>
           ))}
           {isTyping && <div className="p-4"><CloudDashLoader text="Thinking..." /></div>}
           <div ref={chatEndRef} />
        </div>
        <div className="p-6 bg-white/90 border-t border-white shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
           {selectedImage && <div className="mb-4 relative inline-block animate-in zoom-in"><img src={selectedImage} alt="Preview" className="h-20 rounded-xl border-2 border-[#00ED64]" /><button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button></div>}
           <div className="relative group">
             <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChatMessage()} placeholder="Ask or upload..." className="w-full bg-slate-50 p-5 pr-28 pl-14 rounded-[20px] outline-none focus:ring-2 ring-[#00ED64]" />
             <div className="absolute left-3 top-3"><input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageSelect} /><button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-[#00ED64] hover:bg-[#00ED64]/10 rounded-xl transition-all"><ImageIcon size={20} /></button></div>
             <button onClick={sendChatMessage} className="absolute right-3 top-3 p-2.5 bg-[#001E2B] text-[#00ED64] rounded-xl hover:scale-110 shadow-lg"><Send size={18}/></button>
           </div>
        </div>
      </div>
      
      {!isChatOpen && !viewingFile && !paymentResource && (
        <button onClick={() => setIsChatOpen(true)} className="fixed bottom-10 right-10 z-[600] w-20 h-20 bg-[#001E2B] text-[#00ED64] rounded-[32px] flex items-center justify-center shadow-[0_20px_60px_rgba(0,30,43,0.4)] hover:scale-110 hover:-translate-y-2 transition-all border-4 border-[#00ED64]/20 group">
          <BrainCircuit size={32} className="group-hover:animate-pulse" />
        </button>
      )}

      {/* REAL-TIME CHAT OVERLAY */}
      {activeChat && user && (
         <ChatWindow 
            chat={activeChat} 
            user={user} 
            onClose={() => setActiveChat(null)} 
            onSend={handleSendMessage}
            onRead={handleMarkAsRead}
         />
      )}
    </div>
  );
}