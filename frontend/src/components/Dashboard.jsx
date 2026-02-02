import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // ✅ USE CENTRAL API
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ActivityGraph from './ActivityGraph';
import PetWidget from './PetWidget';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { 
  CheckCircle2, Trash2, Plus, Flame, Trophy, Target, CalendarDays, 
  LayoutDashboard, LogOut, BookOpen, Snowflake, Brain, Zap, TrendingUp, 
  AlertTriangle, FileText, History, X, PieChart, User, Swords 
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]); 
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [greeting, setGreeting] = useState('');
  
  const [showTimeMachine, setShowTimeMachine] = useState(false);
  const [historyDate, setHistoryDate] = useState('');
  const [historyTasks, setHistoryTasks] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) navigate('/login');
    else {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchTasks(userObj.id || userObj._id);
      fetchSyllabus(userObj.id || userObj._id);
      fetchUserData(userObj.id || userObj._id);
      setGreeting(getGreeting());
    }
  }, [navigate]);

  const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening'; };
  
  const fetchUserData = async (id) => { 
    try { 
      const res = await api.get(`/api/auth/user/${id}`); 
      setUser(res.data); 
      localStorage.setItem('user', JSON.stringify(res.data)); 
    } catch (err) { } 
  };

  const fetchTasks = async (id) => { try { const res = await api.get(`/api/tasks/${id}`); setTasks(res.data); } catch (err) { } };
  const fetchSyllabus = async (id) => { try { const res = await api.get(`/api/syllabus/${id}`); setSubjects(res.data); } catch (err) { } };
  
  const addTask = async (e) => { e.preventDefault(); if (!newTask.trim()) return; try { const res = await api.post('/api/tasks', { userId: user._id || user.id, title: newTask }); setTasks([res.data, ...tasks]); setNewTask(''); } catch (err) { } };
  
  const toggleTask = async (id) => { 
    try { 
      const res = await api.put(`/api/tasks/${id}`); 
      setTasks(tasks.map(t => t._id === id ? { ...t, isCompleted: res.data.isCompleted } : t)); 
      if (res.data.isCompleted) fetchUserData(user._id || user.id); 
    } catch (err) { } 
  };
  
  const deleteTask = async (id) => { try { await api.delete(`/api/tasks/${id}`); setTasks(tasks.filter(t => t._id !== id)); } catch (err) { } };

  const generateReport = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();
    doc.setFillColor(79, 70, 229); 
    doc.rect(0, 0, 210, 40, 'F'); 
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22); 
    doc.text("TaskFlow Report", 20, 20);
    doc.setFontSize(12); 
    doc.text(`User: ${user?.name} | Date: ${today}`, 20, 30);
    autoTable(doc, { 
        startY: 60, 
        head: [['Metric', 'Value']], 
        body: [
            ['Streak', `${user?.streak || 0} Days`], 
            ['Total Tasks', `${user?.totalTasksCompleted || 0}`],
            ['Pet Level', `${user?.pet?.level || 1} (${user?.pet?.evolutionName})`]
        ], 
        theme: 'grid' 
    });
    doc.save(`Report_${today}.pdf`);
  };

  const fetchHistory = async (date) => { if (!date) return; setHistoryDate(date); try { const res = await api.get(`/api/tasks/date/${user._id || user.id}/${date}`); setHistoryTasks(res.data); } catch (err) { } };

  const filteredTasks = tasks.filter(t => filter === 'all' ? true : filter === 'pending' ? !t.isCompleted : t.isCompleted);
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const pendingCount = tasks.length - completedCount;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const chartData = { labels: ['Done', 'Pending'], datasets: [{ data: [completedCount, pendingCount], backgroundColor: ['#22c55e', '#334155'], borderWidth: 0 }] };

  const focusDNA = useMemo(() => {
    if (tasks.length === 0) return { type: "Novice", icon: <User />, msg: "Start working!" };
    const completed = tasks.filter(t => t.isCompleted);
    if (completed.length === 0) return { type: "Initiator", icon: <Zap />, msg: "Complete tasks first" };
    const h = completed.map(t => new Date(t.updatedAt).getHours());
    if (h.filter(x => x < 12).length > h.filter(x => x >= 12).length) return { type: "Early Bird 🌅", icon: <CheckCircle2 />, msg: "Morning Focus" };
    return { type: "Night Owl 🌙", icon: <Brain />, msg: "Night Focus" };
  }, [tasks]);

  const consistencyScore = useMemo(() => { if (!user?.createdAt) return 100; const d = Math.ceil((new Date() - new Date(user.createdAt)) / 86400000) || 1; return Math.min(100, Math.round(((user?.streak || 0) / d) * 100) + 50); }, [user]);
  const futureYou = useMemo(() => `${Math.max(1, completedCount) * 30} tasks/mo`, [completedCount]);
  const isZeroDay = new Date().getHours() >= 18 && completedCount === 0;

  return (
    <div className="min-h-screen bg-[#0B0C15] text-slate-200 font-sans pb-20 md:pb-10 transition-colors duration-300">
      
      {showTimeMachine && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#151621] border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
                <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><History className="text-cyan-500" /> Time Machine</h2><button onClick={() => setShowTimeMachine(false)} className="p-2 hover:bg-slate-800 rounded-full"><X size={24} /></button></div>
                <div className="mb-6"><input type="date" onChange={(e) => fetchHistory(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 outline-none text-white" /></div>
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {historyDate && historyTasks.length === 0 && <p className="text-center text-slate-500">No activity found. 🕸️</p>}
                    {historyTasks.map(t => ( <div key={t._id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700"><div className={`w-3 h-3 rounded-full ${t.isCompleted ? 'bg-green-500' : 'bg-slate-400'}`}></div><span className={t.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}>{t.title}</span></div> ))}
                </div>
            </div>
        </div>
      )}

      <nav className="fixed top-0 w-full bg-[#0B0C15]/90 backdrop-blur-xl border-b border-slate-800/50 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3"><div className="bg-indigo-600 p-2 rounded-xl"><LayoutDashboard size={20} className="text-white" /></div><span className="font-bold text-xl hidden md:block text-white">TaskFlow</span></div>
        <div className="flex items-center gap-3">
            <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full border ${user?.isStreakFrozen ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500' : 'bg-[#1A1B23] border-slate-800'}`}>{user?.isStreakFrozen ? <Snowflake size={18} className="text-cyan-500 dark:text-cyan-400" /> : <Flame size={18} className="text-orange-500" />}<span className="text-sm font-bold text-white">{user?.streak || 0} {user?.isStreakFrozen ? 'Frozen' : 'Days'}</span></div>
            <div className="flex gap-1 bg-[#1A1B23] p-1 rounded-xl border border-slate-800">
                <button onClick={generateReport} className="p-2 text-slate-400 hover:text-green-500 transition" title="Report"><FileText size={20} /></button>
                <button onClick={() => navigate('/battle')} className="p-2 text-slate-400 hover:text-rose-500 transition" title="Focus Battle"><Swords size={20} /></button>
                <button onClick={() => setShowTimeMachine(true)} className="p-2 text-slate-400 hover:text-cyan-500 transition" title="History"><History size={20} /></button>
                <button onClick={() => navigate('/leaderboard')} className="p-2 text-slate-400 hover:text-yellow-500 transition" title="Leaderboard"><Trophy size={20} /></button>
                <button onClick={() => navigate('/syllabus')} className="p-2 text-slate-400 hover:text-indigo-500 transition" title="Syllabus"><BookOpen size={20} /></button>
                <button onClick={() => navigate('/focus')} className="p-2 text-slate-400 hover:text-purple-500 transition" title="Focus Room"><Target size={20} /></button>
            </div>
            <button onClick={() => navigate('/settings')} className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-700 hover:border-indigo-500 transition shadow-sm">{user?.avatar ? <img src={user.avatar} alt="P" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#1A1B23] flex items-center justify-center text-slate-400"><User size={18} /></div>}</button>
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="p-2 text-slate-400 hover:text-rose-500 transition" title="Logout"><LogOut size={20} /></button>
        </div>
      </nav>

      <div className="h-24"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {isZeroDay && ( <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex items-center justify-between"><div className="text-rose-500 font-bold flex items-center gap-2"><AlertTriangle /> Anti-Zero Day Active!</div><button onClick={() => document.getElementById('taskInput').focus()} className="bg-rose-500 px-4 py-2 rounded-lg text-white font-bold">Do 1 Task</button></div> )}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
             <h1 className="text-3xl md:text-4xl font-bold mb-2">{greeting}, <span className="opacity-90">{user?.name}</span> 👋</h1>
             <p className="opacity-80 text-lg">You have {tasks.length - completedCount} tasks pending today.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Flame className="text-orange-500" />} label="Streak" value={user?.streak || 0} />
            <StatCard icon={<CheckCircle2 className="text-green-500" />} label="Done" value={completedCount} />
            <StatCard icon={<Trophy className="text-yellow-500" />} label="Best" value={user?.streak || 0} />
            <StatCard icon={<Target className="text-purple-500" />} label="Focus" value={`${progress}%`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-[#151621] p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-4"><div className="bg-indigo-500/20 p-3 rounded-full text-indigo-500">{focusDNA.icon}</div><div><h4 className="font-bold text-sm uppercase text-white">Focus DNA</h4><p className="text-xl font-bold text-indigo-500">{focusDNA.type}</p></div></div>
             <div className="bg-[#151621] p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-4"><div className="bg-emerald-500/20 p-3 rounded-full text-emerald-500"><TrendingUp /></div><div><h4 className="font-bold text-sm uppercase text-white">Future You</h4><p className="text-xl font-bold text-emerald-500">{futureYou}</p></div></div>
          </div>
          <div className="bg-[#151621] p-2 rounded-2xl border border-slate-800 shadow-sm">
            <form onSubmit={addTask} className="flex items-center gap-2 p-1">
                <div className="p-3 bg-[#1A1B23] rounded-xl text-slate-400"><Plus size={20} /></div>
                <input id="taskInput" type="text" placeholder="Add a new task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} className="flex-1 bg-transparent h-10 px-2 outline-none text-white placeholder-slate-500" />
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold transition">Add</button>
            </form>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-white">Your Tasks</h2><div className="flex bg-[#151621] p-1 rounded-xl border border-slate-800">{['all', 'pending', 'completed'].map(f => <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition ${filter === f ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-[#1A1B23]'}`}>{f}</button>)}</div></div>
            <div className="grid gap-3">
                {filteredTasks.length === 0 ? <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl text-slate-500">No tasks found.</div> : filteredTasks.map(task => ( <div key={task._id} className="group flex items-center gap-4 p-4 bg-[#151621] border border-slate-800 rounded-2xl hover:border-slate-700 transition-all shadow-sm"><button onClick={() => toggleTask(task._id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.isCompleted ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>{task.isCompleted && <CheckCircle2 size={14} className="text-white" />}</button><span className={`flex-1 ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</span><button onClick={() => deleteTask(task._id)} className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button></div> ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
             <PetWidget user={user} />
             <div className="bg-[#151621] p-6 rounded-3xl border border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-white flex items-center gap-2"><PieChart size={18} className="text-indigo-500"/> Daily Goal</h3></div>
                <div className="w-40 h-40 mx-auto relative">{tasks.length > 0 ? <Doughnut data={chartData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} /> : <p className="text-center text-slate-500 text-xs mt-10">Add tasks</p>}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col"><span className="text-2xl font-bold text-white">{progress}%</span></div>
                </div>
             </div>
             <div className="bg-[#151621] p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center justify-between"><div><h3 className="font-bold text-white flex items-center gap-2"><Brain size={18} className="text-cyan-500"/> Consistency</h3><p className="text-xs text-slate-500 mt-1">Long term score</p></div><div className="text-3xl font-bold text-cyan-500">{consistencyScore}%</div></div>
             <div className="bg-[#151621] p-6 rounded-3xl border border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-white flex items-center gap-2"><BookOpen size={18} className="text-cyan-500"/> Syllabus</h3><button onClick={() => navigate('/syllabus')} className="text-xs text-indigo-500 hover:text-indigo-400 transition">View All</button></div>
                {subjects.slice(0, 3).map(sub => { const total = sub.chapters.length; const done = sub.chapters.filter(c => c.isCompleted).length; const subProgress = total ? Math.round((done / total) * 100) : 0; return (<div key={sub._id} className="mb-4 last:mb-0"><div className="flex justify-between text-sm mb-1"><span className="text-slate-300">{sub.subjectTitle}</span><span className="text-cyan-500">{subProgress}%</span></div><div className="w-full bg-[#1A1B23] rounded-full h-2"><div className="bg-cyan-500 h-full rounded-full" style={{ width: `${subProgress}%` }}></div></div></div>) })}
             </div>
             <div className="bg-[#151621] p-6 rounded-3xl border border-slate-800 shadow-sm">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-green-500"/> History</h3>
                <ActivityGraph userId={user?._id || user?.id} />
             </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (<div className="bg-[#151621] p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1"><div className="mb-1">{icon}</div><span className="text-2xl font-bold text-white">{value}</span><span className="text-[10px] text-slate-500 uppercase">{label}</span></div>);

export default Dashboard;