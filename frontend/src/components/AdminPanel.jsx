import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // ✅ Central API (No Localhost)
import { ShieldCheck, Trash2, ArrowLeft, Search, User, Mail, Calendar, Loader2 } from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Search Filter
    const results = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(results);
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/auth/admin/users');
      setUsers(res.data);
      setFilteredUsers(res.data);
      setLoading(false);
    } catch (err) {
      alert("Access Denied! You are not an Admin.");
      navigate('/dashboard');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`⚠️ Are you sure you want to delete "${userName}"? This cannot be undone.`)) return;
    
    try {
      await api.delete(`/api/auth/admin/delete-user/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      alert("User deleted successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C15] text-slate-200 font-sans p-4 md:p-8">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-800 rounded-full transition"><ArrowLeft /></button>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-rose-500" /> Admin Panel
            </h1>
        </div>
        
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input 
                type="text" 
                placeholder="Search users..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#151621] border border-slate-700 rounded-xl outline-none focus:border-indigo-500 transition text-white"
            />
        </div>
      </div>

      {/* Users Table */}
      <div className="max-w-6xl mx-auto bg-[#151621] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#1A1B23] text-slate-400 border-b border-slate-700">
                        <th className="p-4 font-bold">User</th>
                        <th className="p-4 font-bold">Email</th>
                        <th className="p-4 font-bold">Role</th>
                        <th className="p-4 font-bold">Joined</th>
                        <th className="p-4 font-bold text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5" className="p-10 text-center text-slate-500 flex justify-center items-center gap-2"><Loader2 className="animate-spin"/> Loading...</td></tr>
                    ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-500">No users found.</td></tr>
                    ) : filteredUsers.map(user => (
                        <tr key={user._id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                            <td className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="User" /> : <div className="w-full h-full flex items-center justify-center"><User size={20}/></div>}
                                </div>
                                <span className="font-bold text-white">{user.name}</span>
                            </td>
                            <td className="p-4 text-slate-400"><div className="flex items-center gap-2"><Mail size={14}/> {user.email}</div></td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="p-4 text-slate-500 text-sm"><div className="flex items-center gap-2"><Calendar size={14}/> {new Date(user.createdAt).toLocaleDateString()}</div></td>
                            <td className="p-4 text-right">
                                {user.role !== 'admin' && (
                                    <button 
                                        onClick={() => handleDeleteUser(user._id, user.name)}
                                        className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition"
                                        title="Delete User"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;