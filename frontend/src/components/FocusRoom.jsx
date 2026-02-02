import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // ✅ USE CENTRAL API
import { Play, Pause, RotateCcw, ArrowLeft, Maximize2, Minimize2, Music, CheckCircle2, Coffee, Brain } from 'lucide-react';

const FocusRoom = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  
  // States
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // focus | break
  const [isZen, setIsZen] = useState(false); 
  const [bgType, setBgType] = useState('default'); 
  const [isPlaying, setIsPlaying] = useState(false);

  // Lofi Stream (Free No-Copyright Lofi)
  const audioRef = useRef(new Audio('https://stream.zeno.fm/0r0xa792kwzuv'));

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) navigate('/login');
    else { const userObj = JSON.parse(userData); fetchTasks(userObj.id || userObj._id); }
  }, [navigate]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
    else if (timeLeft === 0) { setIsActive(false); alert("Session Complete!"); }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const fetchTasks = async (id) => { try { const res = await api.get(`/api/tasks/${id}`); setTasks(res.data.filter(t => !t.isCompleted)); } catch (err) { } };
  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60); };
  
  const toggleMusic = () => {
    if (isPlaying) { audioRef.current.pause(); } 
    else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const markTaskDone = async () => { if (!selectedTask) return; try { await api.put(`/api/tasks/${selectedTask}`); setTasks(tasks.filter(t => t._id !== selectedTask)); setSelectedTask(''); } catch (err) { } };
  const formatTime = (seconds) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`; };

  const backgrounds = {
    space: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4",
    rain: "https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-window-of-a-train-1246-large.mp4",
    forest: "https://assets.mixkit.co/videos/preview/mixkit-sun-rays-through-the-trees-1237-large.mp4"
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center transition-all duration-700 overflow-hidden bg-[#0B0C15] text-white">
      
      {/* 🌌 BACKGROUNDS */}
      {isZen && bgType !== 'default' && (
        <>
            <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"><source src={backgrounds[bgType]} type="video/mp4" /></video>
            <div className="absolute inset-0 bg-black/40 z-0"></div>
        </>
      )}

      {/* HEADER */}
      <div className={`absolute top-6 left-6 z-20 transition-opacity duration-500 ${isZen ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 opacity-70 hover:opacity-100 text-white"><ArrowLeft size={20} /> Dashboard</button>
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        
        {/* CONTROLS */}
        <div className="flex justify-between items-center mb-8">
            <div className="flex gap-2 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
                <button onClick={() => { setMode('focus'); setTimeLeft(25*60); setIsActive(false); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${mode==='focus'?'bg-indigo-600 text-white':'text-slate-400 hover:text-white'}`}>Focus</button>
                <button onClick={() => { setMode('break'); setTimeLeft(5*60); setIsActive(false); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${mode==='break'?'bg-emerald-500 text-white':'text-slate-400 hover:text-white'}`}>Break</button>
            </div>

            <div className="flex gap-2">
                {!isZen && (
                    <div className="flex gap-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
                        <button onClick={() => setBgType('space')} className="p-2 rounded-lg text-xs hover:bg-white/10" title="Space">🚀</button>
                        <button onClick={() => setBgType('rain')} className="p-2 rounded-lg text-xs hover:bg-white/10" title="Rain">🌧️</button>
                        <button onClick={() => setBgType('forest')} className="p-2 rounded-lg text-xs hover:bg-white/10" title="Forest">🌲</button>
                    </div>
                )}
                <button onClick={() => setIsZen(!isZen)} className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition text-white">
                    {isZen ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}
                </button>
            </div>
        </div>

        {/* ⏱️ TIMER CARD */}
        <div className={`p-12 rounded-[3rem] text-center shadow-2xl backdrop-blur-xl border transition-all duration-500 flex flex-col items-center justify-center ${isZen ? 'bg-black/20 border-white/10 text-white scale-110' : 'bg-[#151621] border-slate-800'}`}>
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10">
             {mode === 'focus' ? <Brain size={14} className="text-indigo-400"/> : <Coffee size={14} className="text-emerald-400"/>}
             <span className="text-xs font-bold uppercase tracking-widest opacity-70">{mode === 'focus' ? 'Deep Work' : 'Chill Time'}</span>
          </div>
          
          <div className="text-8xl font-mono font-bold tracking-tighter mb-10 text-white" style={{ textShadow: '0 0 40px rgba(99, 102, 241, 0.3)' }}>
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center justify-center gap-6 w-full">
            <button onClick={toggleTimer} className={`h-20 w-full rounded-2xl flex items-center justify-center text-xl font-bold transition-all shadow-lg hover:scale-[1.02] active:scale-95 text-white`} style={{ backgroundColor: isActive ? '#334155' : '#4F46E5' }}>
              {isActive ? <span className="flex items-center gap-2"><Pause fill="currentColor" /> Pause</span> : <span className="flex items-center gap-2"><Play fill="currentColor" /> Start Focus</span>}
            </button>
            <button onClick={resetTimer} className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl transition hover:bg-white/10 border border-white/10 text-white">
              <RotateCcw className="opacity-50 hover:opacity-100 transition" />
            </button>
          </div>
        </div>

        {/* 📝 TASK & AMBIENCE (Hidden in Zen) */}
        <div className={`mt-6 space-y-4 transition-all duration-500 ${isZen && isActive ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100'}`}>
            <div className="bg-[#151621] border border-slate-800 p-4 rounded-2xl">
                <select value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)} className="w-full bg-transparent outline-none text-white font-medium">
                    <option value="" className="bg-[#151621]">🎯 Select Task to Focus...</option>
                    {tasks.map(t => <option key={t._id} value={t._id} className="bg-[#151621]">{t.title}</option>)}
                </select>
            </div>
            
            {selectedTask && (
                <button onClick={markTaskDone} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition hover:opacity-90 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={20} /> Complete Task
                </button>
            )}

            <button onClick={toggleMusic} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-slate-700 text-slate-400 hover:bg-[#151621] transition">
                <Music size={18} className={isPlaying ? "animate-pulse text-indigo-400" : ""} /> 
                {isPlaying ? 'Pause Lofi Beats' : 'Play Lofi Beats'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default FocusRoom;