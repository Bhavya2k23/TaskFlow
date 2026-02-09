import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { Trophy, ArrowLeft, Share2, Flame, User, Swords, RefreshCw, Crown, Trash2, Copy } from 'lucide-react'; 

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ Yahan apni Live Website ka link daalo (Vercel wala)
  // Maine tumhare screenshot se dekh kar daal diya hai
  const WEBSITE_URL = "https://task-flow-tracker-6mjf3cw94-bhavyas-projects-aa53dbe7.vercel.app";

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setCurrentUser(JSON.parse(u));
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => { 
    try { 
      const res = await api.get('/api/auth/leaderboard'); 
      setLeaders(res.data); 
    } catch (err) { console.error("Leaderboard error:", err); } 
  };

  const shareStats = () => { 
    // ✅ Updated Message
    const text = `🔥 I am on a ${currentUser?.streak || 0}-day streak on TaskFlow! Can you beat me? Join here: ${WEBSITE_URL}`; 
    navigator.clipboard.writeText(text);
    alert("Link copied to clipboard! 📋 Share it anywhere.");
  };

  const challengeFriend = () => { 
    // ✅ Updated Message & Fixed Emoji
    const text = `🚀 I challenge you! Beat my ${currentUser?.streak || 0}-day streak on TaskFlow! Join now: ${WEBSITE_URL}`; 
    
    // WhatsApp URL Format Fix
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank'); 
  };

  const handleReset = async () => {
    if (!window.confirm("ARE YOU SURE? This will reset everyone's stats to 0!")) return;
    try {
      await api.put('/api/auth/reset-leaderboard');
      fetchLeaderboard(); 
      alert("Leaderboard has been reset!");
    } catch (err) {
      const msg = err.response?.data?.message || "Reset failed. You might not have permission.";
      alert(msg);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;
    
    try {
        await api.delete(`/api/auth/admin/delete-user/${userId}`);
        alert(`${userName} has been deleted.`);
        fetchLeaderboard(); 
    } catch (err) {
        alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0C15] text-slate-900 dark:text-slate-200 font-sans p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-3xl font-bold flex items-center gap-2 text-yellow-500">
          <Trophy /> Leaderboard
        </h1>
        {currentUser?.role === 'admin' && (
            <button onClick={handleReset} className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-xl hover:bg-rose-500 hover:text-white transition" title="Reset All Stats">
            <RefreshCw size={20} />
            </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
            {leaders.length === 0 ? <p className="text-center text-slate-500">No players found.</p> : leaders.map((player, index) => {
                const isMe = currentUser && player._id === currentUser._id;
                let rankIcon = <span className="text-slate-500 font-mono">#{index + 1}</span>;
                let bgClass = "bg-white dark:bg-[#151621] border-slate-200 dark:border-slate-800";
                
                if (index === 0) { rankIcon = "🥇"; bgClass = "bg-yellow-500/10 border-yellow-500/50"; }
                if (index === 1) { rankIcon = "🥈"; bgClass = "bg-slate-300/20 border-slate-400/50"; }
                if (index === 2) { rankIcon = "🥉"; bgClass = "bg-orange-500/10 border-orange-500/50"; }
                if (isMe) bgClass += " ring-2 ring-indigo-500";

                return (
                    <div key={player._id} className={`flex items-center gap-4 p-4 rounded-2xl border ${bgClass} transition-all hover:scale-[1.01] group`}>
                        <div className="text-xl font-bold w-8 text-center">{rankIcon}</div>
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-700 bg-slate-800">
                            {player.avatar ? <img src={player.avatar} alt="P" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-500"><User size={20} /></div>}
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-bold ${isMe ? 'text-indigo-500' : 'dark:text-white'}`}>
                                {player.name} {isMe && "(You)"} {index === 0 && <Crown size={14} className="inline text-yellow-500"/>}
                            </h3>
                            <p className="text-xs text-slate-500">{player.totalTasksCompleted || 0} Tasks 🔨</p>
                        </div>
                        
                        <div className="text-right mr-2">
                            <div className="flex items-center gap-1 font-bold text-orange-500"><Flame size={16} fill="currentColor" /> {player.streak || 0}</div>
                            <span className="text-[10px] text-slate-500 uppercase">Streak</span>
                        </div>

                        {/* ✅ DELETE BUTTON (Visible only to Admin & not for themselves) */}
                        {currentUser?.role === 'admin' && !isMe && (
                            <button 
                                onClick={() => handleDeleteUser(player._id, player.name)}
                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                                title="Delete User"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>

        <div className="space-y-6">
            <div className="bg-indigo-600 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden">
                <h3 className="text-white font-bold text-xl mb-2">Show Off! 🚀</h3>
                <p className="text-indigo-200 text-sm mb-6">Share your streak.</p>
                <button onClick={shareStats} className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition mb-3">
                    <Copy size={18} /> Copy Link
                </button>
            </div>
            <div className="bg-white dark:bg-[#151621] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center">
                <h3 className="dark:text-white font-bold text-lg mb-2 flex items-center justify-center gap-2"><Swords className="text-rose-500"/> Friend Duel</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Challenge your friend.</p>
                <button onClick={challengeFriend} className="w-full bg-[#25D366] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg">
                    <Share2 size={18} /> Challenge (WhatsApp)
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;