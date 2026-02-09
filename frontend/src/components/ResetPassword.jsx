import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react'; // ✅ Icons Added

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // ✅ Toggle States
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    setError('');

    try {
      const res = await api.put(`/api/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or Expired Token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C15] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#151621] p-8 rounded-3xl border border-slate-800 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Reset Password 🔐</h2>

        {message ? (
            <div className="text-center">
                <div className="text-green-500 mb-2 flex justify-center"><CheckCircle size={40} /></div>
                <p className="text-white font-bold mb-2">Success!</p>
                <p className="text-slate-400 text-sm">Redirecting to login...</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-rose-500 bg-rose-500/10 p-3 rounded-lg text-sm text-center">{error}</div>}
                
                {/* New Password Field */}
                <div>
                    <label className="text-slate-400 text-xs uppercase font-bold ml-1">New Password</label>
                    <div className="relative flex items-center bg-[#0B0C15] border border-slate-700 rounded-xl px-3 mt-1 focus-within:border-indigo-500 transition">
                        <Lock size={18} className="text-slate-500" />
                        <input 
                            type={showPass ? "text" : "password"} 
                            className="w-full bg-transparent p-3 text-white outline-none"
                            placeholder="Min 6 chars"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-500 hover:text-white transition mr-1">
                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label className="text-slate-400 text-xs uppercase font-bold ml-1">Confirm Password</label>
                    <div className="relative flex items-center bg-[#0B0C15] border border-slate-700 rounded-xl px-3 mt-1 focus-within:border-indigo-500 transition">
                        <Lock size={18} className="text-slate-500" />
                        <input 
                            type={showConfirmPass ? "text" : "password"} 
                            className="w-full bg-transparent p-3 text-white outline-none"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="text-slate-500 hover:text-white transition mr-1">
                            {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 mt-4">
                    {loading ? 'Resetting...' : 'Set New Password'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;