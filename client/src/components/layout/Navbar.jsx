import React from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-green-600" />
          <span className="text-xl font-bold">
            Event<span className="text-green-600">io</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-700 hover:text-green-600 font-medium"
          >
            Home
          </Link>

          <Link
            to="/login"
            className="text-gray-700 hover:text-green-600 font-medium"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;