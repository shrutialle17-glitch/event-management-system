import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/public/Home";
import MyTickets from '../pages/user/MyTickets';
import QRScanner from '../pages/organizer/QRScanner';

import BrowseEvents from '../pages/public/BrowseEvents';
import EventDetails from '../pages/public/EventDetails';

const NotFound = () => (
  <div className="p-8 text-center text-2xl font-bold">
    404 - Page Not Found
  </div>
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

      // Fallback 
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
