import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Zap, BarChart2 } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0C15] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20"><LayoutDashboard className="text-white" size={24} /></div>
            <span className="text-2xl font-bold text-white tracking-tight">TaskFlow</span>
        </div>
        <div className="flex gap-4">
            <button onClick={() => navigate('/login')} className="text-slate-400 hover:text-white font-medium transition">Login</button>
            <button onClick={() => navigate('/register')} className="bg-white text-indigo-900 px-6 py-2.5 rounded-full font-bold hover:bg-indigo-50 transition shadow-lg shadow-indigo-500/20 transform hover:-translate-y-0.5">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center mt-16 md:mt-24 px-4 max-w-5xl mx-auto">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold tracking-wide uppercase">
            🚀 The #1 Productivity App for Students
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
          Level Up Your Life, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">One Task at a Time.</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Stop procrastinating. Track your daily goals, maintain streaks, and visualize your progress with our smart dashboard.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
            <button onClick={() => navigate('/register')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-xl shadow-indigo-600/20 transform hover:-translate-y-1">Start Tracking Free</button>
            <button onClick={() => navigate('/login')} className="bg-[#151621] border border-slate-700 hover:border-slate-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition hover:bg-slate-800">Existing User?</button>
        </div>
      </header>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto mt-32 px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <FeatureCard 
            icon={<ShieldCheck />} 
            title="Daily Task Management" 
            desc="Add, track, and complete tasks effortlessly with our clean and intuitive interface." 
            color="indigo"
        />
        <FeatureCard 
            icon={<Zap />} 
            title="Maintain Streaks" 
            desc="Keep the momentum going! Our streak counter motivates you to stay consistent every day." 
            color="orange"
        />
        <FeatureCard 
            icon={<BarChart2 />} 
            title="Visual Analytics" 
            desc="See your productivity grow with interactive charts and GitHub-style heatmaps." 
            color="green"
        />
      </section>

      <footer className="text-center py-8 text-slate-600 border-t border-slate-800 bg-[#0B0C15]">
        <p>© 2026 TaskFlow. Built with MERN Stack.</p>
      </footer>
    </div>
  );
};

// Helper Component for consistency
const FeatureCard = ({ icon, title, desc, color }) => {
    const colors = {
        indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/50",
        orange: "bg-orange-500/10 text-orange-400 border-orange-500/50",
        green: "bg-green-500/10 text-green-400 border-green-500/50"
    };
    return (
        <div className="bg-[#151621] p-8 rounded-3xl border border-slate-800 hover:border-slate-600 transition duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className={`${colors[color]} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-xl`}>{icon}</div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{desc}</p>
        </div>
    );
};

export default Home;