import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

import OrganizerDashboard from '../pages/organizer/OrganizerDashboard';
import CreateEvent from '../pages/organizer/CreateEvent';
import EditEvent from '../pages/organizer/EditEvent';
import EventAnalytics from '../pages/organizer/EventAnalytics';

const NotFound = () => (
  <div className="p-8 text-center text-2xl font-bold text-red-500">
    404 - Not Found
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/organizer" replace />} />

      <Route element={<DashboardLayout />}>

        <Route
          path="/organizer"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/events/new"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/events/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <EditEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/events/:id/analytics"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <EventAnalytics />
            </ProtectedRoute>
          }
        />

      </Route>

      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRoutes;