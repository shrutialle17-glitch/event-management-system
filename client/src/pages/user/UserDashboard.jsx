import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { Ticket, Calendar, Clock, MapPin, ChevronRight, ArrowUpRight, Star, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../../components/common/Button';

const UserDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axiosInstance.get('/registrations/mine');
        setRegistrations(res.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const upcomingEvents = registrations.filter(
    reg => new Date(reg.event.date) >= new Date() && reg.status !== 'cancelled'
  ).slice(0, 3);

  const totalTickets = registrations.length;
  const upcomingCount = registrations.filter(r => new Date(r.event.date) >= new Date() && r.status !== 'cancelled').length;
  const checkedInCount = registrations.filter(r => r.status === 'checked-in').length;

  const statusConfig = {
    'checked-in': { label: 'Checked In', cls: 'badge-green' },
    'registered': { label: 'Registered', cls: 'badge-blue' },
    'cancelled': { label: 'Cancelled', cls: 'badge-red' },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #0c4a6e 100%)' }}>
        {/* Decorative orbs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: 'rgba(16,185,129,0.2)' }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-[60px] pointer-events-none" style={{ background: 'rgba(6,182,212,0.15)' }} />
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover ring-4 shadow-lg" style={{ ringColor: 'rgba(255,255,255,0.2)' }} />
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold ring-4 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome back, {user.name?.split(' ')[0]}!</h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Here's an overview of your event activity.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Ticket className="w-6 h-6" />, label: 'Total Tickets', value: totalTickets, color: 'bg-primary/10 text-primary', trend: null },
            { icon: <Calendar className="w-6 h-6" />, label: 'Upcoming Events', value: upcomingCount, color: 'bg-blue-100 text-blue-600', trend: null },
            { icon: <Star className="w-6 h-6" />, label: 'Attended', value: checkedInCount, color: 'bg-amber-100 text-amber-600', trend: null },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-textMuted text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{loading ? '—' : stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/events" className="group flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center text-white shadow-button flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <p className="font-bold text-slate-900">Browse Events</p>
              <p className="text-sm text-textMuted">Find something new to attend</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
          </Link>
          <Link to="/dashboard/tickets" className="group flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
              <Ticket className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <p className="font-bold text-slate-900">My Tickets</p>
              <p className="text-sm text-textMuted">View all your registered events</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
          </Link>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Up Next For You</h2>
              <p className="text-sm text-textMuted mt-0.5">Your nearest upcoming events</p>
            </div>
            <Link to="/dashboard/tickets" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors group">
              View All <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="p-5 flex gap-4 animate-pulse">
                  <div className="w-24 h-20 bg-slate-200 rounded-xl flex-shrink-0" />
                  <div className="flex-grow space-y-2.5 py-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                </div>
              ))
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Calendar className="w-8 h-8" />
                </div>
                <p className="font-bold text-slate-900 mb-1">No upcoming events</p>
                <p className="text-textMuted text-sm max-w-xs mx-auto mb-6">Browse the directory to find something interesting!</p>
                <Link to="/events"><Button>Browse Events</Button></Link>
              </div>
            ) : (
              upcomingEvents.map(reg => {
                const sc = statusConfig[reg.status] || { label: reg.status, cls: 'badge-gray' };
                return (
                  <div key={reg._id} className="p-5 flex flex-col sm:flex-row gap-4 hover:bg-slate-50/60 transition-colors group">
                    <div className="w-full sm:w-28 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                      {reg.event.bannerUrl ? (
                        <img src={reg.event.bannerUrl} alt="Event" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Calendar className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <Link to={`/events/${reg.event._id}`}>
                          <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug">{reg.event.title}</h3>
                        </Link>
                        <span className={`badge flex-shrink-0 ${sc.cls}`}>{sc.label}</span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-textMuted mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(reg.event.date), 'MMM d, yyyy')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{reg.event.time}</span>
                        <span className="flex items-center gap-1 max-w-[200px] truncate"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{reg.event.venue}</span>
                      </div>

                      <Link to="/dashboard/tickets">
                        <Button variant="outline" className="text-xs py-1.5 px-3 rounded-lg">View Ticket</Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
