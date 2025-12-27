import { LayoutGrid, Upload, Bell, Users, BookOpen, UserCircle, ChevronsLeft } from 'lucide-react';

// Add 'onClose' to the props definition
export default function Sidebar({ activeTab, setActiveTab, notificationCount = 0, onClose }: any) {
  const menu = [
    { id: 'marketplace', icon: <LayoutGrid size={20} />, label: 'Marketplace' },
    { id: 'upload', icon: <Upload size={20} />, label: 'Upload Resource' },
    { 
      id: 'requests', 
      icon: <Bell size={20} />, 
      label: 'Incoming Requests',
      hasBadge: true 
    },
    { id: 'consumers', icon: <Users size={20} />, label: 'My Consumers' },
    { id: 'library', icon: <BookOpen size={20} />, label: 'My Library' },
    { id: 'profile', icon: <UserCircle size={20} />, label: 'Profile & Wallet' } 
  ];

  return (
    <aside className="w-64 bg-white h-screen border-r border-slate-100 p-8 flex flex-col relative">
      
      {/* HEADER WITH LOGO AND CLOSE ARROW */}
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00ED64] rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-[#00ED64]/10">C</div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">CampusHub</span>
        </div>

        {/* NEW HIDE BUTTON */}
        <button 
          onClick={onClose}
          className="p-2 text-slate-300 hover:text-[#00ED64] hover:bg-slate-50 rounded-full transition-all"
          title="Collapse Sidebar"
        >
          <ChevronsLeft size={24} />
        </button>
      </div>
      
      <nav className="space-y-4 flex-1">
        {menu.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all relative ${activeTab === item.id ? 'bg-[#00ED64] text-black shadow-lg shadow-[#00ED64]/20' : 'text-slate-400 hover:text-[#00ED64] hover:bg-[#00ED64]/5'}`}
          >
            {item.icon} 
            <span className="text-sm">{item.label}</span>
            
            {/* NOTIFICATION BADGE */}
            {item.hasBadge && notificationCount > 0 && (
              <span className="absolute right-4 bg-red-500 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full animate-bounce shadow-md">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-slate-50">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
             <div className="w-2 h-2 bg-[#00ED64] rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">AI Engine Online</span>
          </div>
      </div>
    </aside>
  );
}
