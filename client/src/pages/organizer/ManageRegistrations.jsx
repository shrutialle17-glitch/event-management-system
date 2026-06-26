import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { ArrowLeft, Download, User as UserIcon, CheckCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  'checked-in': { cls: 'badge-green', label: 'Checked In' },
  'registered':  { cls: 'badge-blue',  label: 'Registered' },
  'cancelled':   { cls: 'badge-red',   label: 'Cancelled' },
};

const ManageRegistrations = () => {
  const { id } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regRes, eventRes] = await Promise.all([
          axiosInstance.get(`/registrations/event/${id}`),
          axiosInstance.get(`/events/${id}`)
        ]);
        setRegistrations(regRes.data.data);
        setEvent(eventRes.data.data);
      } catch (err) {
        console.error('Failed to load registrations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleManualCheckIn = async (registrationId) => {
    if (!window.confirm('Manually check in this attendee?')) return;
    setCheckingIn(registrationId);
    try {
      await axiosInstance.post('/qr/manual-checkin', { registrationId });
      toast.success('Attendee checked in!');
      setRegistrations(registrations.map(reg =>
        reg._id === registrationId ? { ...reg, status: 'checked-in' } : reg
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    } finally {
      setCheckingIn(null);
    }
  };

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Ticket ID', 'Status', 'Payment', 'Registered At'];
    const csvContent = [
      headers.join(','),
      ...registrations.map(r => [
        `"${r.user.name}"`,
        `"${r.user.email}"`,
        `"${r.ticketId}"`,
        `"${r.status}"`,
        `"${r.paymentStatus}"`,
        `"${format(new Date(r.createdAt), 'yyyy-MM-dd HH:mm')}"`
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event?.title.replace(/\s+/g, '_')}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = registrations.filter(r =>
    !search ||
    r.user.name.toLowerCase().includes(search.toLowerCase()) ||
    r.user.email.toLowerCase().includes(search.toLowerCase()) ||
    r.ticketId?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-textMuted">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading registrations...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100" style={{boxShadow:'0 1px 0 rgba(15,23,42,0.06)'}}>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Link to="/organizer" className="inline-flex items-center gap-1.5 text-sm text-textMuted hover:text-primary font-medium transition-colors mb-4 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Registrations</h1>
              <p className="text-textMuted font-medium mt-0.5">{event?.title}</p>
            </div>
            <button
              onClick={downloadCSV}
              disabled={registrations.length === 0}
              className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total',       value: registrations.length,                                         color: 'text-slate-900', bg: 'bg-slate-50' },
            { label: 'Checked In',  value: registrations.filter(r => r.status === 'checked-in').length,  color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Pending',     value: registrations.filter(r => r.status === 'registered').length,  color: 'text-blue-600',  bg: 'bg-blue-50' },
            { label: 'Cancelled',   value: registrations.filter(r => r.status === 'cancelled').length,   color: 'text-red-600',   bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border border-slate-100 rounded-2xl p-5 text-center shadow-sm`}>
              <p className={`text-3xl font-extrabold ${s.color} tracking-tight`}>{s.value}</p>
              <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email or ticket ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 shadow-sm"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Attendee</th>
                  <th>Ticket ID</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Registered On</th>
                  <th className="text-right">Check-In</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-textMuted text-sm">
                      {search ? 'No attendees match your search.' : 'No registrations yet.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(reg => {
                    const sc = STATUS_CONFIG[reg.status] || { cls: 'badge-gray', label: reg.status };
                    return (
                      <tr key={reg._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            {reg.user.avatarUrl ? (
                              <img src={reg.user.avatarUrl} className="w-9 h-9 rounded-xl object-cover" alt="avatar" />
                            ) : (
                              <div className="w-9 h-9 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                                <span className="text-primary font-bold text-sm">{reg.user.name?.charAt(0)}</span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">{reg.user.name}</p>
                              <p className="text-xs text-textMuted">{reg.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{reg.ticketId}</span>
                        </td>
                        <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                        <td>
                          <span className={`badge ${reg.paymentStatus === 'paid' ? 'badge-green' : 'badge-gray'}`}>
                            {reg.paymentStatus}
                          </span>
                        </td>
                        <td className="text-textMuted text-sm">{format(new Date(reg.createdAt), 'MMM d, yyyy')}</td>
                        <td className="text-right">
                          {reg.status === 'registered' && (
                            <button
                              onClick={() => handleManualCheckIn(reg._id)}
                              disabled={checkingIn === reg._id}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {checkingIn === reg._id ? 'Checking...' : 'Check In'}
                            </button>
                          )}
                          {reg.status === 'checked-in' && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold">
                              <CheckCircle className="w-4 h-4" /> Done
                            </span>
                          )}
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

export default ManageRegistrations;
