import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';

import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';

import UserDashboard from '../pages/user/UserDashboard';
import ProfileSettings from '../pages/user/ProfileSettings';

const NotFound = () => <div className="p-8 text-center text-2xl font-bold text-red-500">404 - Not Found</div>;

const AppRoutes = () => {
  const { user } = useAuth();

  const getDashboardRoute = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'organizer') return '/organizer';
    return '/dashboard';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      {/* Auth Routes - redirect to dashboard if logged in */}
      <Route 
        path="/login" 
        element={user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Register />} 
      />

      {/* Protected Dashboard Routes Wrapped in DashboardLayout */}
      <Route element={<DashboardLayout />}>
        {/* User Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}><UserDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}><ProfileSettings /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
