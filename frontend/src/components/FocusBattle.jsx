import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import { socket } from '../services/socket'; 
import confetti from 'canvas-confetti';
import { Sword, AlertTriangle, Play, Trophy, Skull, ArrowLeft, LogOut, Share2, Copy, RefreshCw } from 'lucide-react'; 

const FocusBattle = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  const [user, setUser] = useState(null);
  
  // ✅ LIVE WEBSITE URL (Ab Localhost nahi jayega)
  const WEBSITE_URL = "https://task-flow-tracker-6mjf3cw94-bhavyas-projects-aa53dbe7.vercel.app";

  // Game States
  const [room, setRoom] = useState("");
  const [inLobby, setInLobby] = useState(true);
  const [battleStarted, setBattleStarted] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [gameResult, setGameResult] = useState(null); // 'WIN' or 'LOSE'
  const [timer, setTimer] = useState(0); // Seconds

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) navigate('/login');
    else {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // ✅ AUTO-JOIN LOGIC: Check if URL has ?room=1234
        const roomParam = searchParams.get('room');
        if (roomParam) {
            setRoom(roomParam);
            // Small delay to ensure socket connects before joining
            setTimeout(() => {
                if(socket.connected) {
                    socket.emit("join_room", { room: roomParam, username: parsedUser.name });
                    setInLobby(false);
                }
            }, 500);
        }
    }

    // ✅ Ensure Socket is Connected
    if (!socket.connected) {
      socket.connect();
    }

    // 👂 Listen for Events
    const handleUserJoined = (username) => {
      setOpponent(username);
    };

    const handleBattleStarted = () => {
      setBattleStarted(true);
      setGameResult(null);
    };

    const handleGameOver = (data) => {
      setBattleStarted(false);
      if (data.winner === "Opponent") {
        triggerWin();
        setGameResult({ type: 'WIN', msg: "You Won! " + data.reason });
      } else {
        setGameResult({ type: 'LOSE', msg: data.reason });
      }
    };

    socket.on("user_joined", handleUserJoined);
    socket.on("battle_started", handleBattleStarted);
    socket.on("game_over", handleGameOver);

    // 🧹 Cleanup Listeners on Unmount
    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("battle_started", handleBattleStarted);
      socket.off("game_over", handleGameOver);
    };
  }, [navigate, searchParams]);

  // 🕵️ ANTI-CHEAT LOGIC
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && battleStarted && !gameResult) {
        socket.emit("player_lost_focus", { room, username: user?.name });
        setGameResult({ type: 'LOSE', msg: "You switched tabs! You lost." });
        setBattleStarted(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [battleStarted, gameResult, room, user]);

  // ⏱️ Timer Logic
  useEffect(() => {
    let interval;
    if (battleStarted) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [battleStarted]);

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", { room, username: user.name });
      setInLobby(false);
    }
  };

  // ✅ CREATE RANDOM ROOM
  const createRoom = () => {
    const randomID = Math.floor(1000 + Math.random() * 9000).toString();
    setRoom(randomID);
  };

  // ✅ SHARE ROOM LINK (WhatsApp - FIXED with Live URL)
  const shareRoom = () => {
    if (!room) return alert("Create or Enter a Room ID first!");
    
    const link = `${WEBSITE_URL}/battle?room=${room}`;
    const text = `⚔️ Challenge! Join my Focus Battle Room: ${room} \n👉 Click here: ${link}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyRoomLink = () => {
     if (!room) return;
     const link = `${WEBSITE_URL}/battle?room=${room}`;
     navigator.clipboard.writeText(link);
     alert("Battle Link Copied! 📋 Share it anywhere.");
  };

  const startBattle = () => {
    socket.emit("start_battle", room);
  };

  // ✅ EXIT FUNCTION
  const handleExit = () => {
    if (battleStarted && !gameResult) {
        if(window.confirm("Leaving mid-battle means you LOSE. Confirm?")) {
            socket.emit("player_lost_focus", { room, username: user?.name });
            setInLobby(true);
            setBattleStarted(false);
            setGameResult(null);
            setRoom("");
            setTimer(0);
        }
    } else {
        setInLobby(true);
        setBattleStarted(false);
        setGameResult(null);
        setRoom("");
        navigate('/dashboard');
    }
  };

  const triggerWin = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#0B0C15] text-white flex items-center justify-center p-4 font-sans">
      
      {/* 1. LOBBY SCREEN */}
      {inLobby && (
        <div className="bg-[#151621] p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full text-center relative">
          
          <button 
            onClick={() => navigate('/dashboard')} 
            className="absolute top-4 left-4 text-slate-500 hover:text-white transition"
            title="Back to Dashboard"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="bg-indigo-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <Sword size={32} className="text-indigo-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Focus Battle ⚔️</h1>
          <p className="text-slate-400 mb-6">Challenge a friend. Switching tabs = Automatic Defeat.</p>
          
          {/* Room Input Area */}
          <div className="relative mb-4">
             <input 
                type="text" 
                placeholder="Enter Room ID (e.g. 1234)" 
                className="w-full p-4 rounded-xl bg-[#0B0C15] border border-slate-700 outline-none text-white text-center text-xl tracking-widest font-mono"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
             />
             {/* Copy & Refresh Buttons inside input */}
             <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                 {room && (
                    <button onClick={copyRoomLink} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition" title="Copy Link">
                        <Copy size={16} />
                    </button>
                 )}
                 <button onClick={createRoom} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition" title="Generate Random ID">
                    <RefreshCw size={16} />
                 </button>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={joinRoom} className="bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold transition">Enter Arena</button>
              <button onClick={shareRoom} className="bg-[#25D366] hover:opacity-90 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
                 <Share2 size={18} /> Share
              </button>
          </div>
        </div>
      )}

      {/* 2. WAITING ROOM / BATTLE */}
      {!inLobby && !gameResult && (
        <div className={`transition-all duration-500 ${battleStarted ? 'scale-100' : 'scale-95'} w-full max-w-2xl`}>
          <div className="bg-[#151621] p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
            
            {/* ✅ EXIT BUTTON */}
            <button onClick={handleExit} className="absolute top-4 right-4 p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition" title="Exit Battle"><LogOut size={20} /></button>

            {/* Status Header */}
            <div className="flex justify-between items-center mb-10">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center font-bold text-xl">{user?.name[0]}</div>
                 <div><h3 className="font-bold">You</h3><p className="text-green-500 text-xs">Focused</p></div>
               </div>
               <div className="text-2xl font-mono font-bold text-slate-500">VS</div>
               <div className="flex items-center gap-3 text-right">
                 <div><h3 className="font-bold">{opponent || "Waiting..."}</h3><p className="text-slate-500 text-xs">{opponent ? "Ready" : "Searching..."}</p></div>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${opponent ? 'bg-rose-500' : 'bg-slate-700 animate-pulse'}`}>{opponent ? opponent[0] : "?"}</div>
               </div>
            </div>

            {/* Timer / Action Area */}
            <div className="text-center py-10">
              {!battleStarted ? (
                 <div>
                    <p className="text-slate-400 mb-2">Room ID: <span className="font-mono text-white bg-slate-800 px-2 py-1 rounded">{room}</span></p>
                    <p className="text-slate-500 text-sm mb-6">Share this ID with your friend to join.</p>
                    {opponent ? (
                        <button onClick={startBattle} className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-full font-bold flex items-center gap-2 mx-auto animate-bounce"><Play size={20}/> Start Battle</button>
                    ) : (
                        <button onClick={shareRoom} className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto"><Share2 size={16}/> Invite Friend</button>
                    )}
                 </div>
              ) : (
                <div className="animate-pulse">
                   <div className="text-8xl font-black font-mono tracking-wider mb-4">{formatTime(timer)}</div>
                   <div className="flex items-center justify-center gap-2 text-rose-500 font-bold bg-rose-500/10 inline-block px-4 py-2 rounded-full border border-rose-500/20">
                      <AlertTriangle size={18} /> DO NOT SWITCH TABS
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. GAME OVER SCREEN */}
      {gameResult && (
        <div className="bg-[#151621] p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full text-center animate-fade-in">
           {gameResult.type === 'WIN' ? (
             <div className="text-yellow-500 mb-4"><Trophy size={64} className="mx-auto" /></div>
           ) : (
             <div className="text-rose-500 mb-4"><Skull size={64} className="mx-auto" /></div>
           )}
           
           <h2 className={`text-4xl font-bold mb-2 ${gameResult.type === 'WIN' ? 'text-yellow-400' : 'text-rose-500'}`}>
             {gameResult.type === 'WIN' ? "VICTORY!" : "DEFEAT"}
           </h2>
           <p className="text-slate-400 mb-8">{gameResult.msg}</p>

           <div className="flex gap-4">
             <button onClick={() => { setGameResult(null); setInLobby(true); }} className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-xl font-bold">Main Menu</button>
             <button onClick={() => navigate('/dashboard')} className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold">Dashboard</button>
           </div>
        </div>
      )}

    </div>
  );
};

export default FocusBattle;