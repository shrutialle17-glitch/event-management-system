import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const PendingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPendingEvents = async () => {
    try {
      const res = await axiosInstance.get('/admin/events/pending');
      setEvents(res.data.data);
    } catch (err) {
      toast.error('Failed to load pending events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axiosInstance.patch(`/admin/events/${id}/approve`);
      toast.success('Event approved successfully');
      fetchPendingEvents();
    } catch (err) {
      toast.error('Failed to approve event');
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await axiosInstance.patch(`/admin/events/${id}/reject`, { rejectionReason: rejectReason });
      toast.success('Event rejected');
      setRejecting(null);
      setRejectReason('');
      fetchPendingEvents();
    } catch (err) {
      toast.error('Failed to reject event');
    }
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading pending events...</div>;
  }

  return (
    <div className="space-y-6 container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6 ">
        <h1 className="text-2xl font-bold text-text">Pending Events</h1>
      </div>

      {events.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-textMuted text-lg">No events are currently pending approval.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map(event => (
            <div key={event._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-text">{event.title}</h2>
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
                    Pending Approval
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-textMuted mb-4">
                  <div>
                    <span className="font-medium">Organizer:</span> {event.organizer.name} ({event.organizer.email})
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {format(new Date(event.date), 'MMM d, yyyy')} at {event.time}
                  </div>
                  <div>
                    <span className="font-medium">Venue:</span> {event.venue}
                  </div>
                  <div>
                    <span className="font-medium">Capacity:</span> {event.capacity}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
              </div>

              <div className="flex flex-col gap-3 min-w-[200px] border-l border-gray-100 pl-6">
                {rejecting === event._id ? (
                  <div className="space-y-2">
                    <textarea 
                      className="w-full text-sm p-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Reason for rejection..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button variant="danger" className="flex-1 py-1 text-sm" onClick={() => handleReject(event._id)}>Confirm</Button>
                      <Button variant="outline" className="flex-1 py-1 text-sm" onClick={() => { setRejecting(null); setRejectReason(''); }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => handleApprove(event._id)}
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </Button>
                    <Button 
                      variant="danger" 
                      className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300"
                      onClick={() => setRejecting(event._id)}
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingEvents;
