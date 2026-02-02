import { useEffect, useState } from 'react';
import { Sparkles, Zap, Heart, MessageCircle } from 'lucide-react';

const PetWidget = ({ user }) => {
  const [message, setMessage] = useState("");
  const [animate, setAnimate] = useState(false);

  // Pet Stats
  const { xp, level, stage, evolutionName } = user?.pet || { xp: 0, level: 1, stage: 1, mood: 'happy' };
  const xpNeeded = level * 100;
  const progress = Math.min(100, Math.round((xp / xpNeeded) * 100));

  // Determine Sprite based on Stage
  const getSprite = () => {
    if (stage === 1) return "🥚";
    if (stage === 2) return "🐣";
    if (stage === 3) return "🦖";
    return "🐉";
  };

  // Determine Dialogue based on Mood/Stats
  useEffect(() => {
    const dialogues = [
      "Let's crush some tasks!",
      "I'm hungry for XP!",
      "You got this, Boss!",
      "Evolving soon? 👀",
      "Don't break the streak!",
    ];
    
    if (stage === 1) setMessage("Zzz... (Incubating)");
    else if (progress > 80) setMessage("So close to leveling up!");
    else setMessage(dialogues[Math.floor(Math.random() * dialogues.length)]);

    // Idle Animation Interval
    const interval = setInterval(() => {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, [user, stage, progress]);

  return (
    <div className="relative bg-gradient-to-br from-[#1A1B23] to-[#151621] p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col items-center justify-center overflow-hidden group hover:border-indigo-500/50 transition-all duration-500">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Floating Dialogue Bubble */}
      <div className="absolute top-4 right-4 animate-bounce-slow opacity-80">
        <div className="bg-white text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <MessageCircle size={10} /> {message}
        </div>
      </div>

      {/* Pet Sprite with Animations */}
      <div className={`text-8xl mb-4 transition-transform duration-300 cursor-pointer select-none filter drop-shadow-2xl ${animate ? 'animate-bounce' : 'group-hover:scale-110'}`}>
        {getSprite()}
      </div>

      {/* Name & Stage */}
      <div className="text-center z-10">
        <h3 className="text-2xl font-bold text-white tracking-wide">{user?.pet?.name || 'Pixel'}</h3>
        <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-3">{evolutionName}</p>
      </div>

      {/* Stats Bar */}
      <div className="w-full space-y-2 z-10">
        <div className="flex justify-between text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1"><Zap size={12} className="text-yellow-500"/> Lvl {level}</span>
          <span>{xp} / {xpNeeded} XP</span>
        </div>
        
        {/* XP Bar Container */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer Effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Interaction Icons (Decorative) */}
      <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Heart size={16} className="text-rose-500 animate-pulse" />
      </div>
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles size={16} className="text-amber-400 animate-spin-slow" />
      </div>

    </div>
  );
};

export default PetWidget;