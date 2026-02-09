import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Syllabus from './components/Syllabus';
import Settings from './components/Settings';
import FocusBattle from './components/FocusBattle';
import Leaderboard from './components/Leaderboard';
import FocusRoom from './components/FocusRoom'; 
import AdminPanel from './components/AdminPanel'; 

// ✅ NEW PAGES
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// 🔐 Private Route
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* ✅ FORGOT & RESET ROUTES */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* 🔒 Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/syllabus" element={<PrivateRoute><Syllabus /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/battle" element={<PrivateRoute><FocusBattle /></PrivateRoute>} />
          <Route path="/focus" element={<PrivateRoute><FocusRoom /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
export default App;