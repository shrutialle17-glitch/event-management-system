import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/public/Home";

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

      // Fallback 
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
