import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // ✅ USE CENTRAL API (Fixes Localhost issue)
import { useTheme } from '../context/ThemeContext';
import { User, Lock, Trash2, ArrowLeft, Save, ShieldAlert, LogOut, Flame, Camera, Sun, Moon, X } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [passwords, setPasswords] = useState({ old: '', new: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) navigate('/login');
    else { const u = JSON.parse(userData); setUser(u); setName(u.name); setAvatar(u.avatar || ''); }
  }, [navigate]);

  const updateLocalUser = (u) => { localStorage.setItem('user', JSON.stringify(u)); setUser(u); };
  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 3000); };

  const handleImageChange = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.readAsDataURL(file); reader.onloadend = () => { setAvatar(reader.result); uploadAvatar(reader.result); }; };
  
  const uploadAvatar = async (base64) => { 
    try { 
        // ✅ FIX: No localhost, uses Render URL automatically
        const res = await api.put(`/api/auth/update-avatar/${user._id}`, { avatar: base64 }); 
        updateLocalUser({ ...user, avatar: res.data.avatar }); 
        showMsg('success', 'Updated!'); 
    } catch (err) { showMsg('error', 'Failed to upload'); } 
  };

  const handleRemoveAvatar = async () => { 
    if (!window.confirm("Remove photo?")) return; 
    try { 
        await api.put(`/api/auth/remove-avatar/${user._id}`); 
        setAvatar(""); 
        updateLocalUser({ ...user, avatar: "" }); 
    } catch (err) { console.error(err); } 
  };
  
  const handleUpdateProfile = async (e) => { 
    e.preventDefault(); 
    try { 
        const res = await api.put(`/api/auth/update/${user._id}`, { name }); 
        updateLocalUser(res.data); 
        showMsg('success', 'Saved'); 
    } catch (err) { 
        showMsg('error', 'Failed to update profile'); 
    } 
  };

  const handleChangePassword = async (e) => { 
    e.preventDefault(); 
    try { 
        await api.put(`/api/auth/password/${user._id}`, { oldPassword: passwords.old, newPassword: passwords.new }); 
        setPasswords({ old: '', new: '' }); 
        showMsg('success', 'Changed'); 
    } catch (err) { showMsg('error', 'Incorrect Old Password'); } 
  };

  const handleToggleFreeze = async () => { 
    try { 
        const res = await api.put(`/api/auth/toggle-freeze/${user._id}`); 
        updateLocalUser({ ...user, isStreakFrozen: res.data.isStreakFrozen }); 
    } catch (err) { console.error(err); } 
  };

  const handleResetStreak = async () => { 
    if (!window.confirm("Reset Streak to 0?")) return; 
    try { 
        await api.put(`/api/auth/reset-streak/${user._id}`); 
        updateLocalUser({ ...user, streak: 0, isStreakFrozen: false }); 
        showMsg('success', 'Reset'); 
    } catch (err) { console.error(err); } 
  };

  const handleDeleteAccount = async () => { 
    if (!window.confirm("DELETE ACCOUNT PERMANENTLY? This cannot be undone.")) return; 
    try { 
        await api.delete(`/api/auth/delete/${user._id}`); 
        localStorage.clear(); 
        navigate('/register'); 
    } catch (err) { showMsg('error', 'Delete Failed'); } 
  };

  return (
    <div className="min-h-screen bg-[#0B0C15] text-slate-200 font-sans p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl space-y-8 pt-10">
        <div className="flex items-center justify-between"><button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition"><ArrowLeft size={20} /> Back</button><h1 className="text-2xl font-bold text-white">Settings ⚙️</h1></div>
        {msg.text && <div className={`p-4 rounded-xl border text-center font-bold ${msg.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>{msg.text}</div>}

        <div className="bg-[#151621] p-6 rounded-3xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between"><div><h3 className="font-bold flex items-center gap-2 text-white">{theme === 'dark' ? <Moon size={18} className="text-purple-500"/> : <Sun size={18} className="text-amber-500"/>} Appearance</h3><p className="text-slate-500 text-sm">Toggle Light/Dark</p></div><button onClick={toggleTheme} className="px-5 py-2 rounded-xl font-bold bg-[#1A1B23] border border-slate-700 text-white hover:bg-slate-800 transition">{theme === 'dark' ? 'Light Mode ☀️' : 'Dark Mode 🌙'}</button></div>
        </div>

        <div className="bg-[#151621] p-6 rounded-3xl border border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><User size={20} className="text-indigo-500" /> Identity</h2>
          <div className="flex flex-col items-center mb-6"><div className="relative group w-28 h-28"><div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-800 bg-[#1A1B23] shadow-lg">{avatar ? <img src={avatar} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-50"><User size={48} /></div>}</div><label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-500 transition shadow-lg border-2 border-[#151621]"><Camera size={16} className="text-white" /><input type="file" accept="image/*" className="hidden" onChange={handleImageChange} /></label>{avatar && <button onClick={handleRemoveAvatar} className="absolute top-0 right-0 bg-rose-500 p-1.5 rounded-full hover:bg-rose-600 transition shadow-lg border-2 border-[#151621]"><X size={14} className="text-white" /></button>}</div></div>
          <form onSubmit={handleUpdateProfile} className="flex gap-2"><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 p-3 rounded-xl bg-[#1A1B23] border border-slate-700 text-white outline-none" placeholder="Display Name" /><button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition">Save</button></form>
        </div>

        <div className="bg-[#151621] p-6 rounded-3xl border border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Flame size={20} className="text-orange-500" /> Streak</h2>
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800"><div><h3 className="font-bold text-white">Freeze {user?.isStreakFrozen ? '❄️' : ''}</h3><p className="text-slate-500 text-sm">Pause streak.</p></div><button onClick={handleToggleFreeze} className="px-4 py-2 rounded-xl font-bold bg-[#1A1B23] border border-slate-700 text-white">{user?.isStreakFrozen ? 'Unfreeze' : 'Freeze'}</button></div>
          <div className="flex items-center justify-between"><div><h3 className="font-bold text-white">Reset</h3><p className="text-slate-500 text-sm">Start from 0.</p></div><button onClick={handleResetStreak} className="px-4 py-2 rounded-xl font-bold bg-[#1A1B23] border border-slate-700 text-slate-400 hover:text-rose-500 transition">Reset</button></div>
        </div>

        <div className="bg-rose-500/10 p-6 rounded-3xl border border-rose-500/20"><h2 className="text-xl font-bold text-rose-500 mb-2 flex items-center gap-2"><ShieldAlert size={20} /> Danger Zone</h2><div className="flex gap-4 mt-4"><button onClick={handleDeleteAccount} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold transition"><Trash2 size={18} /> Delete Account</button><button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex items-center gap-2 bg-[#1A1B23] border border-slate-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-rose-500/10 transition"><LogOut size={18} /> Logout</button></div></div>
      </div>
    </div>
  );
};

export default Settings;