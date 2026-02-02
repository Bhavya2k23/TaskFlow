import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await api.post('/api/auth/register', formData);
      setMessage('Account Created! Redirecting to Login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-2xl border border-slate-700">
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          Create Account 🚀
        </h2>
        <p className="text-slate-400 text-center mb-6">
          Join us and start tracking today
        </p>

        {message && (
          <div
            className={`mb-4 p-3 rounded text-center text-sm font-semibold ${
              message.includes('Created') ? 'bg-green-600' : 'bg-red-500'
            } text-white`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-700 border border-slate-600 p-3 text-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-700 border border-slate-600 p-3 text-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-700 border border-slate-600 p-3 text-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white hover:bg-indigo-500 transition duration-300 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
