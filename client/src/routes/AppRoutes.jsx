import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";

import OrganizerDashboard from "../pages/organizer/OrganizerDashboard";
import CreateEvent from "../pages/organizer/CreateEvent";
import EditEvent from "../pages/organizer/EditEvent";
import EventAnalytics from "../pages/organizer/EventAnalytics";

import Home from "../pages/public/Home";
import BrowseEvents from "../pages/public/BrowseEvents";
import EventDetails from "../pages/public/EventDetails";

import MyTickets from "../pages/user/MyTickets";
import QRScanner from "../pages/organizer/QRScanner";

const NotFound = () => (
  <div className="p-8 text-center text-2xl font-bold">404 - Page Not Found</div>
);

const AppRoutes = () => {
  return (
    <Routes>
      // Public Routes
      <Route path="/" element={<Home />} />
      <Route path="/dashboard/tickets" element={<MyTickets />} />
      <Route path="/events" element={<BrowseEvents />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/organizer/scan" element={<QRScanner />} />
      <Route path="/organizer" element={<OrganizerDashboard />} />
      <Route path="/organizer/events/new" element={<CreateEvent />} />
      <Route path="/organizer/events/:id/edit" element={<EditEvent />} />
      <Route path="/organizer/events/:id/analytics" element={<EventAnalytics />}/>
      // Fallback
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
