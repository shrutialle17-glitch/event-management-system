import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { PlusCircle, Calendar as CalendarIcon, Users, Settings, ScanLine, BarChart3, TrendingUp, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  published:  { cls: 'badge-green',  label: 'Published' },
  draft:      { cls: 'badge-gray',   label: 'Draft' },
  completed:  { cls: 'badge-blue',   label: 'Completed' },
  cancelled:  { cls: 'badge-red',    label: 'Cancelled' },
};

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const res = await axiosInstance.get('/events/organizer/mine');
        setEvents(res.data.data);
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  const totalRegistrations = events.reduce((acc, e) => acc + e.registeredCount, 0);
  const publishedEvents = events.filter(e => e.status === 'published').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #0c4a6e 100%)' }}>
        {/* Decorative orbs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: 'rgba(16,185,129,0.2)' }} />
        <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full blur-[60px] pointer-events-none" style={{ background: 'rgba(6,182,212,0.15)' }} />
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: '#5eead4' }}>Organizer Dashboard</p>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Manage your events and track registrations.</p>
              </div>
            </div>
            <Link to="/organizer/events/new">
              <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }}>
                <PlusCircle className="w-4 h-4" /> Create Event
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <CalendarIcon className="w-6 h-6" />, label: 'Total Events',       value: events.length,        color: 'bg-primary/10 text-primary' },
            { icon: <TrendingUp className="w-6 h-6" />,   label: 'Published',          value: publishedEvents,      color: 'bg-green-100 text-green-600' },
            { icon: <Users className="w-6 h-6" />,        label: 'Total Registrations', value: totalRegistrations,  color: 'bg-blue-100 text-blue-600' },
            { icon: <ScanLine className="w-6 h-6" />,     label: 'QR Check-in',        value: null,                 color: 'bg-violet-100 text-violet-600', isLink: '/organizer/scan' },
          ].map((stat, i) => (
            stat.isLink ? (
              <Link key={i} to={stat.isLink} className="stat-card border border-primary/15 bg-gradient-to-br from-primary/5 to-white group hover:from-primary/10 transition-all">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div className="flex-grow">
                  <p className="text-textMuted text-sm font-medium">{stat.label}</p>
                  <p className="text-sm font-bold text-primary">Launch Scanner →</p>
                </div>
              </Link>
            ) : (
              <div key={i} className="stat-card">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-textMuted text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{loading ? '—' : stat.value}</p>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Events</h2>
              <p className="text-sm text-textMuted mt-0.5">{events.length} event{events.length !== 1 ? 's' : ''} created</p>
            </div>
            <Link to="/organizer/events/new">
              <Button variant="outline" className="text-sm py-2">
                <PlusCircle className="w-4 h-4" /> New Event
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Registrations</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1,2,3].map(i => (
                    <tr key={i}>
                      <td><div className="h-4 shimmer w-48" /></td>
                      <td><div className="h-4 shimmer w-28" /></td>
                      <td><div className="h-6 shimmer w-20 rounded-full" /></td>
                      <td><div className="h-4 shimmer w-24" /></td>
                      <td />
                    </tr>
                  ))
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-textMuted">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                          <CalendarIcon className="w-7 h-7" />
                        </div>
                        <p className="font-semibold text-slate-700">No events yet</p>
                        <p className="text-sm">Create your first event to get started.</p>
                        <Link to="/organizer/events/new"><Button className="mt-2">Create Event</Button></Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  events.map(event => {
                    const pct = Math.min((event.registeredCount / event.capacity) * 100, 100);
                    const sc = STATUS_CONFIG[event.status] || { cls: 'badge-gray', label: event.status };
                    return (
                      <tr key={event._id}>
                        <td>
                          <p className="font-bold text-slate-900 mb-0.5">{event.title}</p>
                          <p className="text-xs text-textMuted truncate max-w-[200px]">{event.venue}</p>
                        </td>
                        <td>
                          <p className="font-medium text-slate-700">{format(new Date(event.date), 'MMM d, yyyy')}</p>
                          <p className="text-xs text-textMuted">{event.time}</p>
                        </td>
                        <td>
                          <span className={`badge ${sc.cls}`}>{sc.label}</span>
                        </td>
                        <td>
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-textMuted">{event.registeredCount} / {event.capacity}</span>
                              <span className="font-semibold text-slate-700">{Math.round(pct)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/organizer/events/${event._id}/analytics`} title="Analytics">
                              <button className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all duration-200">
                                <BarChart3 className="w-4 h-4" />
                              </button>
                            </Link>
                            <Link to={`/organizer/events/${event._id}/feedback`} title="Feedback & Gallery">
                              <button className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200">
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            </Link>
                            <Link to={`/organizer/events/${event._id}/registrations`} title="Registrations">
                              <button className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                                <Users className="w-4 h-4" />
                              </button>
                            </Link>
                            <Link to={`/organizer/events/${event._id}/edit`} title="Edit">
                              <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200">
                                <Settings className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
