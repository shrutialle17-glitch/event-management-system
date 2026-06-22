import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
  return children;
}

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Determine fallback redirect based on role
    let fallbackPath = '/dashboard';
    if (user.role === 'admin') fallbackPath = '/admin';
    else if (user.role === 'organizer') fallbackPath = '/organizer';

    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
