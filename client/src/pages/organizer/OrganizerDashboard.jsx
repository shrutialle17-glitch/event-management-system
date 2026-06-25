import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
//import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { PlusCircle, Calendar as CalendarIcon, Users, Settings, ScanLine, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

const OrganizerDashboard = () => {
  //const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const res = await axiosInstance.get('/events');
        setEvents(res.data.data);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  const totalRegistrations = events.reduce((acc, event) => acc + event.registeredCount, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 rounded-2xl shadow-lg">

        <div>
          <h1 className="text-3xl font-bold text-white">
            Organizer Dashboard
          </h1>
          <p className="text-blue-100 mt-1">
            Manage your events and track registrations.
          </p>
        </div>
        <Link to="/organizer/events/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 rounded-2xl border border-gray-100 flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-xl text-primary">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-textMuted font-medium">Total Events</p>
            <p className="text-2xl font-bold text-text">{events.length}</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-gray-100 flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-xl text-primary">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-textMuted font-medium">Total Registrations</p>
            <p className="text-2xl font-bold text-text">{totalRegistrations}</p>
          </div>
        </div>
        <Link to="/organizer/scan" className="glass-card p-6 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-between group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-4 rounded-xl text-white">
              <ScanLine className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="text-primary-dark font-medium">QR Check-in</p>
              <p className="text-sm font-semibold text-primary">Launch Scanner</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-text">My Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-textMuted uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Registrations</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-textMuted">
                    You haven't created any events yet.
                  </td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-text mb-1">{event.title}</div>
                      <div className="text-xs text-textMuted max-w-xs truncate">{event.venue}</div>
                    </td>
                    <td className="px-6 py-4 text-textMuted whitespace-nowrap">
                      <div>{format(new Date(event.date), 'MMM d, yyyy')}</div>
                      <div className="text-xs">{event.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${event.status === 'published' ? 'bg-green-100 text-green-700' :
                          event.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                            event.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'}`
                      }>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-textMuted">
                          {event.registeredCount} / {event.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <Link to={`/organizer/events/${event._id}/analytics`} title="Analytics">
                        <Button variant="ghost" className="p-2"><BarChart3 className="w-4 h-4" /></Button>
                      </Link>
                      <Link to={`/organizer/events/${event._id}/registrations`} title="Registrations">
                        <Button variant="ghost" className="p-2"><Users className="w-4 h-4" /></Button>
                      </Link>
                      <Link to={`/organizer/events/${event._id}/edit`} title="Edit">
                        <Button variant="ghost" className="p-2"><Settings className="w-4 h-4" /></Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
