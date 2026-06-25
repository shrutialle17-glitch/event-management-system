import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from '../context/AuthContext';

import OrganizerDashboard from "../pages/organizer/OrganizerDashboard";
import CreateEvent from "../pages/organizer/CreateEvent";
import EditEvent from "../pages/organizer/EditEvent";
import EventAnalytics from "../pages/organizer/EventAnalytics";


import BrowseEvents from "../pages/public/BrowseEvents";
import EventDetails from "../pages/public/EventDetails";
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';

import UserDashboard from '../pages/user/UserDashboard';
import ProfileSettings from '../pages/user/ProfileSettings';
import MyTickets from "../pages/user/MyTickets";
import QRScanner from "../pages/organizer/QRScanner";

const NotFound = () => (
  <div className="p-8 text-center text-2xl font-bold">404 - Page Not Found</div>
);


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
      <Route path="/events" element={<BrowseEvents />} />
      <Route path="/events/:id" element={<EventDetails />} />
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
        <Route path="/dashboard/tickets" element={<ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}><MyTickets /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}><ProfileSettings /></ProtectedRoute>} />

        {/* Organizer Protected Routes */}
        <Route path="/organizer" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><OrganizerDashboard /></ProtectedRoute>} />
        <Route path="/organizer/events/new" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><CreateEvent /></ProtectedRoute>} />
        <Route path="/organizer/events/:id/edit" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><EditEvent /></ProtectedRoute>} />
        
        

        <Route path="/organizer/scan" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><QRScanner /></ProtectedRoute>} />
        <Route path="/organizer/events/:id/feedback" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><EventFeedbackGallery /></ProtectedRoute>} />

      </Route>
      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
