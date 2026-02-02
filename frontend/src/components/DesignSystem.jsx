import { motion } from 'framer-motion'; // Animation ke liye (optional, standard CSS bhi hai)

// 🎨 BASIC UI / CSS COMPONENTS
export const PageWrapper = ({ children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-[#0B0C15] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300 pb-20 md:pb-10">
    {children}
  </div>
);

export const SectionContainer = ({ children, className = "" }) => (
  <div className={`max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 ${className}`}>
    {children}
  </div>
);

// 📦 CARD & SURFACE COMPONENTS
export const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-xl bg-white/80 dark:bg-[#151621]/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);

export const GradientCard = ({ children, variant = "indigo" }) => {
  const gradients = {
    indigo: "from-indigo-500 to-purple-500 dark:from-indigo-900/40 dark:to-purple-900/40 border-indigo-200 dark:border-indigo-500/20",
    emerald: "from-emerald-500 to-teal-500 dark:from-emerald-900/40 dark:to-teal-900/40 border-emerald-200 dark:border-emerald-500/20",
    rose: "from-rose-500 to-orange-500 dark:from-rose-900/40 dark:to-orange-900/40 border-rose-200 dark:border-rose-500/20",
  };
  return (
    <div className={`bg-gradient-to-r ${gradients[variant]} border rounded-3xl p-8 text-white shadow-lg relative overflow-hidden`}>
      <div className="relative z-10">{children}</div>
      {/* Abstract Shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
    </div>
  );
};

export const MetricTile = ({ icon: Icon, label, value, subtext, color = "indigo" }) => {
  const colors = {
    indigo: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10",
    green: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
    orange: "text-orange-500 bg-orange-50 dark:bg-orange-500/10",
    purple: "text-purple-500 bg-purple-50 dark:bg-purple-500/10",
  };
  return (
    <GlassCard className="flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-1">
      <div className={`p-4 rounded-2xl mb-1 ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <span className="text-3xl font-bold dark:text-white text-slate-800">{value}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      {subtext && <span className="text-[10px] text-slate-400">{subtext}</span>}
    </GlassCard>
  );
};

// 🔘 BUTTON COMPONENTS
export const PrimaryButton = ({ children, onClick, icon: Icon, className = "" }) => (
  <button onClick={onClick} className={`flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 ${className}`}>
    {Icon && <Icon size={18} />} {children}
  </button>
);

export const SecondaryButton = ({ children, onClick, icon: Icon, className = "" }) => (
  <button onClick={onClick} className={`flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 ${className}`}>
    {Icon && <Icon size={18} />} {children}
  </button>
);

export const DangerButton = ({ children, onClick, icon: Icon }) => (
  <button onClick={onClick} className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 px-5 py-2.5 rounded-xl font-bold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all">
    {Icon && <Icon size={18} />} {children}
  </button>
);

// ✏️ FORM & INPUT COMPONENTS
export const ModernInput = ({ type = "text", placeholder, value, onChange, icon: Icon }) => (
  <div className="relative group">
    {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />}
    <input 
      type={type} 
      placeholder={placeholder} 
      value={value} 
      onChange={onChange}
      className={`w-full bg-slate-50 dark:bg-[#0B0C15] border border-slate-200 dark:border-slate-700 rounded-xl py-3 ${Icon ? 'pl-12' : 'pl-4'} pr-4 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
    />
  </div>
);

export const ToggleSwitch = ({ label, active, onToggle, activeColor = "bg-green-500" }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
    <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
    <button 
      onClick={onToggle} 
      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${active ? activeColor : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>
);

// 📊 PROGRESS & STATUS
export const ProgressBar = ({ progress, color = "bg-indigo-500" }) => (
  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
    <div 
      className={`h-full ${color} transition-all duration-1000 ease-out`} 
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

export const StatusBadge = ({ status }) => {
  const styles = status ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles}`}>
      {status ? "Completed" : "Pending"}
    </span>
  );
};

// 🔔 FEEDBACK & ALERTS
export const AlertBox = ({ type = "info", title, message, action, actionLabel }) => {
  const styles = type === 'danger' 
    ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300"
    : "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-300";
  
  return (
    <div className={`p-4 rounded-2xl border flex items-center justify-between animate-fade-in ${styles}`}>
      <div>
        <h4 className="font-bold flex items-center gap-2">{title}</h4>
        <p className="text-sm opacity-80">{message}</p>
      </div>
      {action && (
        <button onClick={action} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// 🧭 NAVIGATION
export const Navbar = ({ children }) => (
  <nav className="fixed top-0 w-full bg-white/80 dark:bg-[#0B0C15]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50 z-50 px-6 py-4 flex justify-between items-center">
    {children}
  </nav>
);