'use client';
import { useState } from 'react';
import { Upload, X, CheckCircle, Image as ImageIcon, Tag, Sparkles } from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase';

export default function AddResource({ setToast, setActiveTab, setGlobalLoading }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    title: '', subject: '', price: '', college: '', 
    category: 'Notes', condition: 'Good' // Defaults
  });

  const categories = ['Notes', 'Textbook', 'Electronics', 'Supplies', 'Research'];
  const conditions = ['Brand New', 'Like New', 'Good', 'Fair', 'Digital'];

  const handleFile = (e: any) => { if (e.target.files[0]) setFile(e.target.files[0]); };
  
  const handleCover = (e: any) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!formData.title || !formData.subject) {
      setToast("Title and Subject are required.", 'error');
      return;
    }
    
    setGlobalLoading(true);
    try {
      // 1. Upload Main File (Optional if selling physical item, but good to have spec sheet)
      let fileUrl = '';
      if (file) {
        const storageRef = ref(storage, `resources/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
      }

      // 2. Upload Cover Image
      let coverUrl = '';
      if (coverFile) {
        const coverRef = ref(storage, `covers/${Date.now()}_${coverFile.name}`);
        await uploadBytes(coverRef, coverFile);
        coverUrl = await getDownloadURL(coverRef);
      }

      // 3. Save Data
      await addDoc(collection(db, "resources"), {
        ...formData,
        price: Number(formData.price) || 0,
        fileUrl,
        coverUrl,
        ownerId: auth.currentUser?.uid,
        ownerName: auth.currentUser?.displayName || 'Anonymous',
        createdAt: Timestamp.now(),
        requests: [],
        approvedUsers: []
      });

      // FIX: Use simple string to avoid the parent component's error interpretation logic
      setToast("Item Listed Successfully!", 'success');
      
      // Delay tab switch slightly to ensure toast is visible and state is stable
      setTimeout(() => {
        setActiveTab('marketplace');
      }, 500);

    } catch (err: any) {
      console.error(err);
      // Pass actual error message to avoid [object Object]
      setToast(err.message || "Upload Failed", 'error');
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-[#001E2B]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white p-8 rounded-[40px] shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto cloud-scrollbar">
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-[#001E2B] tracking-tight">List an Item</h2>
          <button onClick={() => setActiveTab('marketplace')} className="p-3 bg-slate-50 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"><X /></button>
        </div>

        <div className="space-y-6">
          
          {/* TITLE & PRICE */}
          <div className="grid grid-cols-3 gap-6">
             <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Item Title *</label>
                <input className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-[#00ED64] font-bold text-[#001E2B]" placeholder="e.g. B.S. Grewal Higher Engineering" onChange={e => setFormData({...formData, title: e.target.value})} />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Price (₹)</label>
                <input type="number" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-[#00ED64] font-bold text-[#001E2B]" placeholder="0 = Free" onChange={e => setFormData({...formData, price: e.target.value})} />
             </div>
          </div>

          {/* CATEGORY & CONDITION */}
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-1"><Tag size={12}/> Category</label>
                <select className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-[#00ED64] font-medium" onChange={e => setFormData({...formData, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-1"><Sparkles size={12}/> Condition</label>
                <select className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-[#00ED64] font-medium" onChange={e => setFormData({...formData, condition: e.target.value})}>
                  {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>

          {/* SUBJECT & COLLEGE */}
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Subject / Dept</label>
                <input className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-[#00ED64] font-medium" placeholder="e.g. Mechanical" onChange={e => setFormData({...formData, subject: e.target.value})} />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">College (Optional)</label>
                <input className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-[#00ED64] font-medium" placeholder="e.g. JNTUH" onChange={e => setFormData({...formData, college: e.target.value})} />
             </div>
          </div>

          {/* COVER IMAGE UPLOAD (REQUIRED FOR VISUALS) */}
          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Cover Image (Photo of Item)</label>
             <label className={`border-2 border-dashed rounded-3xl p-6 flex items-center justify-center cursor-pointer transition-all group gap-6 ${coverFile ? 'border-[#00ED64] bg-[#F0FDF4]' : 'border-slate-200 hover:border-[#00ED64] hover:bg-slate-50'}`}>
                <input type="file" className="hidden" onChange={handleCover} accept="image/*" />
                {coverPreview ? (
                  <img src={coverPreview} className="h-24 w-24 object-cover rounded-xl shadow-md border-2 border-white" alt="Preview" />
                ) : (
                  <div className="p-4 bg-slate-100 rounded-full group-hover:bg-[#00ED64] group-hover:text-white transition-colors"><ImageIcon size={24} /></div>
                )}
                <div className="flex-1">
                   <p className="font-bold text-[#001E2B]">{coverFile ? "Image Selected" : "Upload Item Photo"}</p>
                   <p className="text-xs text-slate-400">JPG, PNG supported</p>
                </div>
             </label>
          </div>

          {/* DOCUMENT FILE UPLOAD (OPTIONAL) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Attach File (Optional for Physical Items)</label>
            <label className={`border-2 border-dashed rounded-3xl p-4 flex items-center gap-4 cursor-pointer transition-all group ${file ? 'border-[#00ED64] bg-[#F0FDF4]' : 'border-slate-200 hover:border-[#00ED64] hover:bg-slate-50'}`}>
                <input type="file" className="hidden" onChange={handleFile} accept=".pdf,.docx,.pptx" />
                <div className={`p-3 rounded-full ${file ? 'bg-[#00ED64] text-white' : 'bg-slate-100 text-slate-400'}`}><Upload size={20} /></div>
                <p className="font-bold text-sm text-[#001E2B]">{file ? file.name : "Attach PDF/DOCX (Optional)"}</p>
            </label>
          </div>

          <button onClick={handleUpload} className="w-full bg-[#001E2B] text-white p-5 rounded-2xl font-black text-lg hover:scale-[1.01] active:scale-95 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3">
             PUBLISH ITEM
          </button>
        </div>
      </div>
    </div>
  );
}