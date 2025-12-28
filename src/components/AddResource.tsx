'use client';
import { useState, useRef } from 'react';
import { db, storage, auth } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, X, CheckCircle, Image as ImageIcon, Tag, Sparkles, School, Book, PenTool, Layers } from 'lucide-react';

// --- STANDARD COLLEGES LIST ---
const COLLEGES = [
  "KL University", "JNTUH", "Osmania University", "CBIT", "VNR VJIET",
  "Vasavi College", "Gokaraju Rangaraju", "Sreenidhi (SNIST)",
  "Mahindra University", "IIT Hyderabad", "IIIT Hyderabad",
  "BITS Hyderabad", "Other"
];

// --- TITLES TO BLOCK (Forces user to be specific) ---
const BLOCKED_TITLES = ['cse', 'ece', 'eee', 'aids', 'mech', 'civil', 'it', 'aiml'];

// --- SMART SUBJECT MAPPING ---
const SUBJECT_MAP: { [key: string]: string } = {
  // MATHS
  "dm": "Discrete Mathematics", "mfcs": "Discrete Mathematics",
  "mo": "Mathematical Optimization", "p&s": "Probability and Statistics",
  "la": "Linear Algebra", "m1": "Mathematics I", "m2": "Mathematics II",
  // CSE
  "os": "Operating Systems", "cn": "Computer Networks",
  "dbms": "Database Management Systems", "sql": "Database Management Systems",
  "daa": "Design and Analysis of Algorithms", "dsa": "Data Structures",
  "cd": "Compiler Design", "toc": "Theory of Computation",
  "wt": "Web Technologies", "ai": "Artificial Intelligence",
  "ml": "Machine Learning", "oops": "Object Oriented Programming",
  "java": "Java Programming", "python": "Python Programming",
  // ECE/EEE
  "bee": "Basic Electrical Engineering", "edc": "Electronic Devices & Circuits",
  "dld": "Digital Logic Design", "ss": "Signals and Systems"
};

export default function AddResource({ setToast, setActiveTab, setGlobalLoading }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  // New state fields
  const [customCollege, setCustomCollege] = useState('');
  const [group, setGroup] = useState(''); // Stores CSE, ECE, etc.

  const [formData, setFormData] = useState({ 
    title: '', subject: '', price: '', college: '', 
    category: 'Notes', condition: 'Good' 
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
    // 1. VALIDATION
    if (!formData.title || !formData.subject || !group) {
      setToast("Title, Subject, and Group are required.", 'error');
      return;
    }

    // Check for blocked titles
    if (BLOCKED_TITLES.includes(formData.title.toLowerCase().trim())) {
        setToast("Please use a specific title (e.g. 'Data Structures'), not just the Branch name.", 'error');
        return;
    }
    
    setGlobalLoading(true);
    try {
      // 2. Upload Main File
      let fileUrl = '';
      if (file) {
        const storageRef = ref(storage, `resources/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
      }

      // 3. Upload Cover Image
      let coverUrl = '';
      if (coverFile) {
        const coverRef = ref(storage, `covers/${Date.now()}_${coverFile.name}`);
        await uploadBytes(coverRef, coverFile);
        coverUrl = await getDownloadURL(coverRef);
      }

      // --- DATA NORMALIZATION ---
      
      // A. College
      let finalCollege = formData.college;
      if (formData.college === 'Other') {
         finalCollege = customCollege.trim().replace(/\b\w/g, l => l.toUpperCase());
      }

      // B. Subject
      const cleanSubInput = formData.subject.toLowerCase().replace(/\./g, '').trim();
      let finalSubject = SUBJECT_MAP[cleanSubInput]; 
      if (!finalSubject) {
          finalSubject = formData.subject.trim().replace(/\b\w/g, l => l.toUpperCase());
      }

      // 4. Save Data
      await addDoc(collection(db, "resources"), {
        ...formData,
        subject: finalSubject,
        college: finalCollege,
        group: group, // Saving the branch/group
        price: Number(formData.price) || 0,
        fileUrl,
        coverUrl,
        ownerId: auth.currentUser?.uid,
        ownerName: auth.currentUser?.displayName || 'Anonymous',
        createdAt: Timestamp.now(),
        requests: [],
        approvedUsers: []
      });

      setToast("Item Listed Successfully!", 'success');
      
      setTimeout(() => {
        setActiveTab('marketplace');
      }, 500);

    } catch (err: any) {
      console.error(err);
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
                <div className="relative">
                    <PenTool size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input className="w-full bg-slate-50 p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-[#00ED64] font-bold text-[#001E2B]" placeholder="e.g. B.S. Grewal Engineering" onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
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

          {/* GROUP & SUBJECT */}
          <div className="grid grid-cols-2 gap-6">
             {/* NEW GROUP DROPDOWN */}
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Group / Branch *</label>
                <div className="relative">
                   <Layers size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                   <select 
                      className="w-full bg-slate-50 p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-[#00ED64] font-medium appearance-none cursor-pointer" 
                      onChange={e => setGroup(e.target.value)}
                      value={group}
                   >
                      <option value="">Select Group...</option>
                      <option value="CSE">CSE (Computer Science)</option>
                      <option value="ECE">ECE (Electronics)</option>
                      <option value="EEE">EEE (Electrical)</option>
                      <option value="AIDS">AI & DS</option>
                      <option value="MECH">Mechanical</option>
                      <option value="CIVIL">Civil</option>
                      <option value="OTHER">Other / Basic Sciences</option>
                   </select>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Subject / Dept</label>
                <div className="relative">
                    <Book size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input 
                        className="w-full bg-slate-50 p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-[#00ED64] font-medium" 
                        placeholder="e.g. OS, DM, or Mech" 
                        onChange={e => setFormData({...formData, subject: e.target.value})} 
                    />
                </div>
                {/* Visual Hint */}
                {SUBJECT_MAP[formData.subject.toLowerCase().replace(/\./g, '').trim()] && (
                  <p className="text-[10px] text-[#00ED64] font-bold pl-2 animate-pulse">
                      Will save as: {SUBJECT_MAP[formData.subject.toLowerCase().replace(/\./g, '').trim()]}
                  </p>
                )}
             </div>
          </div>

          {/* COLLEGE DROPDOWN */}
          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">College</label>
             <div className="relative">
                <School size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                <select 
                    className="w-full bg-slate-50 p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-[#00ED64] font-medium appearance-none cursor-pointer" 
                    onChange={e => setFormData({...formData, college: e.target.value})}
                    value={formData.college}
                >
                    <option value="">Select Campus...</option>
                    {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             {formData.college === 'Other' && (
                <input 
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-[#00ED64] font-medium mt-2 animate-in fade-in" 
                    placeholder="Type college name..." 
                    value={customCollege}
                    onChange={e => setCustomCollege(e.target.value)} 
                />
             )}
          </div>

          {/* COVER IMAGE UPLOAD */}
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

          {/* DOCUMENT FILE UPLOAD */}
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
