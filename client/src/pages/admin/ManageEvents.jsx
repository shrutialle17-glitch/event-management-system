import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { ArrowLeft, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get('/admin/events');
      setEvents(res.data.data);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to permanently delete this event? This action cannot be undone.')) return;
    try {
      await axiosInstance.delete(`/admin/events/${eventId}`);
      toast.success('Event deleted');
      setEvents(events.filter(e => e._id !== eventId));
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Events...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Link to="/admin" className="flex items-center text-textMuted hover:text-primary mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Global Events Directory</h1>
        <p className="text-textMuted">Monitor and moderate all events on the platform.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-textMuted uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Event Details</th>
                <th className="px-6 py-4">Organizer</th>
                <th className="px-6 py-4">Metrics</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map(event => (
                <tr key={event._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-text mb-1">{event.title}</div>
                    <div className="text-xs text-textMuted">
                      {format(new Date(event.date), 'MMM d, yyyy')} • {event.category}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{event.organizer?.name || 'Unknown'}</p>
                    <p className="text-xs text-textMuted">{event.organizer?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <span className="font-medium">{event.registeredCount}</span> / {event.capacity} regs
                    </div>
                    <div className="text-xs text-textMuted mt-1">₹{event.price}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase
                      ${event.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <Link to={`/events/${event._id}`} target="_blank" className="inline-block text-gray-500 hover:text-primary transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(event._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;
