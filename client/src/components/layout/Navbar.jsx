import React from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-600">
            <Calendar className="w-5 h-5 text-white" />
          </div>

          <span className="text-xl font-bold text-slate-900">
            Event<span className="text-emerald-600">io</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-slate-700 hover:text-emerald-600 font-medium"
          >
            Home
          </Link>

          <Link
            to="/events"
            className="text-slate-700 hover:text-emerald-600 font-medium"
          >
            Events
          </Link>

          <Link
            to="/login"
            className="text-slate-700 hover:text-emerald-600 font-medium"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;