import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C15] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#151621] p-8 rounded-3xl border border-slate-800 shadow-xl text-center">
        
        <div className="w-16 h-16 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
            <Mail size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
        <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send you a link to reset your password.</p>

        {message ? (
            <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 text-green-400 mb-6 flex flex-col items-center gap-2">
                <CheckCircle size={24} />
                <p>{message}</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-rose-500 bg-rose-500/10 p-3 rounded-lg text-sm">{error}</div>}
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full bg-[#0B0C15] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-indigo-500 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50">
                    {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={18} />
                </button>
            </form>
        )}
        
        <Link to="/login" className="block mt-6 text-slate-500 hover:text-white transition text-sm">Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;