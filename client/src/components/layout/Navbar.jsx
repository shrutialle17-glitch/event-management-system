import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import { Calendar, LogOut, Menu, X } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'organizer') return '/organizer';
    return '/dashboard';
  };

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const navLinkClass = (path) =>
    `relative text-sm font-semibold pb-0.5 transition-colors duration-200 ${
      isActive(path) ? 'text-primary' : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <>
      <nav
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid rgba(15,23,42,0.06)' : '1px solid rgba(15,23,42,0.03)',
          boxShadow: scrolled ? '0 2px 20px rgba(15,23,42,0.05)' : 'none',
        }}
      >
        <div className="container mx-auto flex items-center justify-between px-4 h-16">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="p-2 bg-primary rounded-xl flex-shrink-0 shadow-button group-hover:-translate-y-0.5 transition-transform duration-250">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Event<span className="text-primary">io</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={navLinkClass('/')}>Home</Link>
            <Link to="/events" className={navLinkClass('/events')}>Browse Events</Link>
            {user && (
              <Link to={getDashboardLink()} className={navLinkClass(getDashboardLink())}>
                Dashboard
              </Link>
            )}
          </div>

          {/* ── Right Side Actions ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <>
                <NotificationBell />
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1.5 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-100"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-primary">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                    {user.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-xl text-slate-400 hover:text-error hover:bg-error/10 transition-all duration-200"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" className="!px-4">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" className="!px-5">Get Started</Button>
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors ml-1"
              onClick={() => setMobileOpen(o => !o)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            style={{ backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-4 flex flex-col gap-1">
            <Link to="/" className="px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
              Home
            </Link>
            <Link to="/events" className="px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
              Browse Events
            </Link>
            {user && (
              <Link to={getDashboardLink()} className="px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
                Dashboard
              </Link>
            )}
            {!user && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <Link to="/login" className="flex-1">
                  <button className="w-full py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors">
                    Log in
                  </button>
                </Link>
                <Link to="/register" className="flex-1">
                  <button
                    className="w-full py-2.5 text-sm font-semibold text-white rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
