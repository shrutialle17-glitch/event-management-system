import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import Button from "../../components/common/Button";
import EventCard from "../../components/events/EventCard";
import {
  CalendarDays,
  Users,
  Star,
  ArrowRight,
  ScanLine,
  Ticket,
  Zap,
  Globe,
  Shield,
} from "lucide-react";

const CATEGORIES = [
  {
    value: "conference",
    label: "🎤 Conference",
    color: "hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700",
  },
  {
    value: "workshop",
    label: "🛠 Workshop",
    color: "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700",
  },
  {
    value: "concert",
    label: "🎵 Concert",
    color: "hover:bg-pink-50 hover:border-pink-200 hover:text-pink-700",
  },
  {
    value: "sports",
    label: "⚽ Sports",
    color: "hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700",
  },
  {
    value: "networking",
    label: "🤝 Networking",
    color: "hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700",
  },
  {
    value: "webinar",
    label: "💻 Webinar",
    color: "hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700",
  },
  {
    value: "other",
    label: "✨ Other",
    color: "hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700",
  },
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          axiosInstance
            .get("/events/stats")
            .catch(() => ({ data: { data: null } })),
          axiosInstance.get("/events?limit=6&time=upcoming"),
        ]);
        if (statsRes.data?.data) setStats(statsRes.data.data);
        if (eventsRes.data?.data?.events)
          setFeaturedEvents(eventsRes.data.data.events);
      } catch (error) {
        console.error("Failed to fetch home data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const getDashboardPath = () => {
    if (!user) return "/register";
    if (user.role === "admin") return "/admin";
    if (user.role === "organizer") return "/organizer";
    return "/dashboard";
  };

  return (
    <div className="flex flex-col flex-grow">
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-mesh-dark text-white pt-28 pb-40 noise">
        {/* Blurred orbs */}
        <div className="absolute -top-10 left-10 w-[420px] h-[420px] bg-[#00674F]/20 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[380px] h-[380px] bg-[#008A68]/15 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-[#00674F]/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-8 animate-fade-in">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            The next-generation event platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up leading-[1.05]">
            Discover, register, <br className="hidden md:block" />
            and{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00674F] via-[#008A68] to-[#00A37A] animate-gradient-x">
              check in
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 animate-fade-in-up-delay-1 leading-relaxed">
            All in one place. The modern platform for world-class events — built
            for organizers and attendees alike.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-2">
            <Link to="/events">
              <Button className="text-base px-8 py-3.5 rounded-2xl shadow-button hover:scale-[1.03] transition-all duration-300">
                Browse Events <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={getDashboardPath()}>
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-base border border-[#00674F] text-[#00674F] bg-white/5 backdrop-blur-sm hover:bg-[#00674F] hover:text-white transition-all duration-300 hover:scale-[1.03]">
                {user ? "Go to Dashboard" : "Get Started Free"}
              </button>
            </Link>
          </div>

          {/* Trust row */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-white/55 text-xs font-medium animate-fade-in-up-delay-2">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Secure QR check-in
            </span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Multi-category events
            </span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> Badges & certificates
            </span>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────────────────── */}
      {!loading && !stats ? null : (
        <section className="relative -mt-16 z-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div
              className="glass-card rounded-3xl p-8 md:p-10 flex flex-wrap gap-8 justify-around items-center border border-white/60"
              style={{
                boxShadow: "0 12px 30px rgba(15,23,42,.10)",
              }}
            >
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex flex-col items-center gap-2"
                  >
                    <div className="h-10 w-20 bg-slate-200 rounded-xl" />
                    <div className="h-3 w-28 bg-slate-100 rounded-full" />
                  </div>
                ))
              ) : (
                <>
                  {[
                    {
                      val: stats.totalEvents,
                      label: "Total Events",
                      color: "text-primary",
                    },
                    {
                      val: stats.totalUsers,
                      label: "Total Users",
                      color: "text-secondary",
                    },
                    {
                      val: stats.eventsHosted,
                      label: "Events Hosted",
                      color: "text-accent",
                    },
                    {
                      val: stats.totalRegistrations,
                      label: "Happy Attendees",
                      color: "text-violet-500",
                    },
                  ].map(({ val, label, color }) => (
                    <div key={label} className="text-center">
                      <p
                        className={`text-4xl font-extrabold ${color} mb-1 tracking-tight`}
                      >
                        {val?.toLocaleString()}
                      </p>
                      <p className="text-xs text-textMuted font-semibold uppercase tracking-widest">
                        {label}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── UPCOMING EVENTS ────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="section-label">Discover</p>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Upcoming Events
              </h2>
              <p className="text-textMuted mt-2">
                Find something worth showing up for.
              </p>
            </div>
            <Link
              to="/events"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors group"
            >
              View All{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden border border-slate-100"
                  style={{ boxShadow: "0 4px 24px rgba(15,23,42,0.06)" }}
                >
                  <div className="h-48 shimmer" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 shimmer w-3/4" />
                    <div className="h-3 shimmer w-1/2" />
                    <div className="h-3 shimmer w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="bg-slate-50 rounded-3xl p-20 text-center border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-card text-slate-300">
                <CalendarDays className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No upcoming events yet
              </h3>
              <p className="text-textMuted max-w-md mx-auto mb-8">
                Be the first to host an amazing event on Eventio.
              </p>
              <Link to="/register">
                <Button>Create an Event</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────── */}
      <section className="py-20 bg-mesh">
        <div className="container mx-auto px-4 text-center">
          <p className="section-label">Explore</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Browse by Category
          </h3>
          <p className="text-textMuted mb-10 max-w-lg mx-auto">
            Find events that match your interests.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => navigate(`/events?category=${cat.value}`)}
                className={`px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${cat.color}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="section-label">Simple steps</p>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-textMuted mb-16 max-w-xl mx-auto">
            Getting into your favourite events has never been simpler.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-primary/20 via-accent/40 to-primary/20 z-0" />

            {[
              {
                icon: <CalendarDays className="w-8 h-8" />,
                step: "01",
                title: "Browse Events",
                desc: "Find something worth showing up for. Filter by category, date, and more.",
                gradient: "from-primary/10 to-teal-100/50",
                iconColor: "text-primary",
              },
              {
                icon: <Ticket className="w-8 h-8" />,
                step: "02",
                title: "Register & Get Ticket",
                desc: "Instant confirmation with a secure QR ticket delivered to your account.",
                gradient: "from-blue-50 to-cyan-50",
                iconColor: "text-blue-600",
              },
              {
                icon: <ScanLine className="w-8 h-8" />,
                step: "03",
                title: "Check In at Venue",
                desc: "Scan your QR code and walk in. No lines, no hassle.",
                gradient: "from-violet-50 to-purple-50",
                iconColor: "text-violet-600",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative z-10 flex flex-col items-center group"
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-3xl flex items-center justify-center mb-6 shadow-card group-hover:shadow-card-hover group-hover:-translate-y-1 transition-all duration-300 ${item.iconColor}`}
                >
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-slate-300 mb-2 tracking-widest uppercase">
                  {item.step}
                </span>
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-textMuted text-sm leading-relaxed max-w-xs">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────── */}
      <section className="py-28 bg-mesh-dark text-white relative overflow-hidden noise">
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <Users className="w-3.5 h-3.5 text-primary" />
            Join thousands of organizers
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
            Ready to host your
            <br />
            next big event?
          </h2>
          <p className="text-lg text-white/60 mb-12 max-w-xl mx-auto leading-relaxed">
            Use Eventio to manage ticketing, QR check-ins, attendee engagement,
            and everything in between.
          </p>
          <Link to="/register">
            <Button className="text-base px-10 py-4 rounded-2xl shadow-glow-lg">
              Host an Event <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
