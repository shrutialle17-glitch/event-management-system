import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { format } from 'date-fns';
import { Ticket, MapPin, Calendar, Clock, Download, Image as ImageIcon, X } from 'lucide-react';
import Button from '../../components/common/Button';
import FeedbackForm from '../../components/feedback/FeedbackForm';
import GalleryUploader from '../../components/gallery/GalleryUploader';
import toast from 'react-hot-toast';

const MyTickets = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await axiosInstance.get('/registrations/mine');
      setRegistrations(res.data.data);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return;
    
    setCancelling(id);
    try {
      await axiosInstance.patch(`/registrations/${id}/cancel`);
      toast.success('Registration cancelled');
      fetchRegistrations(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(null);
    }
  };

  const downloadTicketPdf = async (registrationId, ticketId) => {
    try {
      const response = await axiosInstance.get(`/registrations/${registrationId}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ticket_${ticketId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("PDF Download Error:", err);
      toast.error(err.response?.data?.message || err.message || 'Failed to download ticket PDF');
    }
  };

  const downloadCertificate = async (registrationId, ticketId) => {
    try {
      const response = await axiosInstance.get(`/attendance/${registrationId}/certificate`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${ticketId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Certificate Download Error:", err);
      toast.error(err.response?.data?.message || 'Certificate not available yet.');
    }
  };

  const upcomingRegs = registrations.filter(r => new Date(r.event.date) >= new Date() && r.status !== 'cancelled');
  const pastRegs = registrations.filter(r => new Date(r.event.date) < new Date() && r.status !== 'cancelled');
  const cancelledRegs = registrations.filter(r => r.status === 'cancelled');

  const displayList = activeTab === 'upcoming' ? upcomingRegs : activeTab === 'past' ? pastRegs : cancelledRegs;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-text mb-6">My Tickets</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`py-3 px-6 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-text'}`}
        >
          Upcoming ({upcomingRegs.length})
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={`py-3 px-6 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-text'}`}
        >
          Past Events ({pastRegs.length})
        </button>
        <button 
          onClick={() => setActiveTab('cancelled')}
          className={`py-3 px-6 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'cancelled' ? 'border-red-500 text-red-500' : 'border-transparent text-textMuted hover:text-text'}`}
        >
          Cancelled ({cancelledRegs.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-textMuted">No tickets found in this category.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {displayList.map(reg => (
            <div key={reg._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row">
              
              {/* Event Info Side */}
              <div className="flex-grow p-6 lg:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-text mb-2">{reg.event.title}</h2>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-100 text-textMuted mb-4">
                        Ticket ID: {reg.ticketId}
                      </div>
                    </div>
                    {reg.status === 'checked-in' && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Checked In</span>
                    )}
                    {reg.status === 'waitlisted' && (
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Waitlisted — Position #{reg.waitlistPosition}</span>
                    )}
                    {reg.status === 'cancelled' && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Cancelled</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start text-textMuted">
                      <Calendar className="w-5 h-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium text-text">{format(new Date(reg.event.date), 'MMMM d, yyyy')}</p>
                        <p className="text-sm">{reg.event.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start text-textMuted">
                      <MapPin className="w-5 h-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium text-text">{reg.event.venue}</p>
                        <p className="text-sm">Location</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-auto">
                  {activeTab === 'upcoming' && (
                    <div className="flex gap-3">
                      <Button variant="danger" className="text-sm" onClick={() => handleCancel(reg._id)} isLoading={cancelling === reg._id}>
                        Cancel Ticket
                      </Button>
                    </div>
                  )}
                  {activeTab === 'past' && reg.status === 'checked-in' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FeedbackForm eventId={reg.event._id} />
                      <GalleryUploader eventId={reg.event._id} />
                    </div>
                  )}
                  {activeTab === 'past' && reg.status !== 'checked-in' && (
                    <p className="text-amber-600 text-sm italic">You did not check in to this event.</p>
                  )}
                </div>
              </div>

              {/* QR Code Side (Ticket Stub) */}
              {reg.status !== 'cancelled' && (
                <div className="lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-dashed border-gray-300 p-8 flex flex-col items-center justify-center relative">
                  {/* Decorator cutouts */}
                  <div className="hidden lg:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-background rounded-full border-r border-gray-300 z-10"></div>
                  
                  {reg.status === 'waitlisted' ? (
                    <>
                      <p className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-6">Waitlist</p>
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 w-full text-center">
                        <p className="text-3xl font-bold text-amber-500 mb-2">#{reg.waitlistPosition}</p>
                        <p className="text-sm text-textMuted">Current Position</p>
                      </div>
                      <p className="text-xs text-center text-textMuted px-4 leading-relaxed">You will receive an email and QR code if a spot opens up.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-textMuted uppercase tracking-widest mb-6">Admit One</p>
                      
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-6">
                        {reg.qrImageUrl ? (
                          <img src={reg.qrImageUrl} alt="Ticket QR Code" className="w-48 h-48" />
                        ) : (
                          <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">QR Pending</div>
                        )}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => downloadTicketPdf(reg._id, reg.ticketId)}
                        disabled={!reg.qrImageUrl}
                      >
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                      </Button>

                      {reg.status === 'checked-in' && (
                        <Button 
                          variant="outline" 
                          className="w-full mt-3 border-primary text-primary hover:bg-primary/5" 
                          onClick={() => downloadCertificate(reg._id, reg.ticketId)}
                        >
                          <Download className="w-4 h-4 mr-2" /> Certificate
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
