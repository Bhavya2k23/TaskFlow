import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // If no user or token, redirect to login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // If user exists, render the protected page (Dashboard, etc.)
  return children;
};

export default PrivateRoute;