import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { Calendar } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full glass-card border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary text-white p-1.5 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-text hidden sm:block">
            Eventio
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-textMuted hover:text-primary font-medium transition-colors"
          >
            Home
          </Link>

          <Link
            to="/events"
            className="text-textMuted hover:text-primary font-medium transition-colors"
          >
            Browse Events
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>

          <Link to="/register">
            <Button variant="primary">Sign Up</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

















/*import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
//import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import { Calendar, UserCircle, LogOut } from 'lucide-react';

const Navbar = () => {
  //const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'organizer') return '/organizer';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-card border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary text-white p-1.5 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-text hidden sm:block">Eventio</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-textMuted hover:text-primary font-medium transition-colors">Home</Link>
          <Link to="/events" className="text-textMuted hover:text-primary font-medium transition-colors">Browse Events</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to={getDashboardLink()} className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <UserCircle className="w-8 h-8 text-gray-400" />
                )}
                <span className="text-sm font-medium hidden sm:block">{user.name}</span>
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="px-2">
                <LogOut className="w-5 h-5 text-textMuted hover:text-red-500 transition-colors" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
*/