import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";
import { Calendar, LogOut, Menu, X } from "lucide-react";
import NotificationBell from "../notifications/NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "organizer") return "/organizer";
    return "/dashboard";
  };

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path));

  const navLinkClass = (path) =>
    `relative text-base font-semibold pb-0.5 transition-colors duration-200 ${
      isActive(path) ? "text-primary" : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <>
      <nav
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(255,255,255,0.96)"
            : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: 
          '1px solid rgba(15,23,42,.06)',
          boxShadow: scrolled ? "0 8px 24px rgba(15,23,42,.08)" : "none",
        }}
      >
        <div className="container mx-auto flex items-center justify-between px-4 h-16">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary group-hover:bg-primary/20 transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Event<span className="text-primary">io</span>
            </span>
          </Link>
          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-7">
            <Link to="/" className={navLinkClass("/")}>
              Home
            </Link>
            <Link to="/events" className={navLinkClass("/events")}>
              Browse Events
            </Link>
            {user && (
              <Link
                to={getDashboardLink()}
                className={navLinkClass(getDashboardLink())}
              >
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
                  className="flex items-center gap-2.5 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl transition-all duration-200"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #00674F 0%, #06b6d4 100%)",
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-base font-semibold text-slate-700 hidden sm:block">
                    {user.name?.split(" ")[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <button className="px-4 py-2 text-base font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200">
                    Log in
                  </button>
                </Link>
                <Link to="/register">
                  <button
                    className="px-4 py-2 text-base font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-px"
                    style={{
                      background:
                        "linear-gradient(135deg, #00674F 0%, #06b6d4 100%)",
                      boxShadow: "0 4px 12px rgba(16,185,129,0.35)",
                    }}
                  >
                    Get Started
                  </button>
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors ml-1"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-4 flex flex-col gap-1">
            <Link
              to="/"
              className="px-4 py-3 rounded-xl text-base text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/events"
              className="px-4 py-3 rounded-xl text-base text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Browse Events
            </Link>
            {user && (
              <Link
                to={getDashboardLink()}
                className="px-4 py-3 rounded-xl text-base text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Dashboard
              </Link>
            )}
            {!user && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <Link to="/login" className="flex-1">
                  <button className="w-full py-2.5 border-2 border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:border-slate-300 transition-colors">
                    Log in
                  </button>
                </Link>
                <Link to="/register" className="flex-1">
                  <button
                    className="w-full py-2.5 text-base font-semibold text-white rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #00674F 0%, #06b6d4 100%)",
                    }}
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
