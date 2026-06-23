import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { ArrowLeft, Users, CheckCircle, Ticket, IndianRupee } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const EventAnalytics = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, regRes] = await Promise.all([
          axiosInstance.get(`/events/${id}`),
          axiosInstance.get(`/registrations/event/${id}`)
        ]);
        setEvent(eventRes.data.data);
        setRegistrations(regRes.data.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!event) return <div className="p-8 text-center text-red-500">Event not found</div>;

  // Calculate Metrics
  const totalRegs = registrations.length;
  const checkedIn = registrations.filter(r => r.status === 'checked-in').length;
  const pending = registrations.filter(r => r.status === 'registered').length;
  const cancelled = registrations.filter(r => r.status === 'cancelled').length;
  const revenue = registrations.filter(r => r.paymentStatus === 'paid').length * event.price;

  const statusData = [
    { name: 'Checked In', value: checkedIn, color: '#10B981' },
    { name: 'Pending', value: pending, color: '#3B82F6' },
    { name: 'Cancelled', value: cancelled, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // Group registrations by day for Bar Chart
  const regByDay = registrations.reduce((acc, reg) => {
    const date = new Date(reg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(regByDay).map(date => ({
    date,
    count: regByDay[date]
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Link to="/organizer" className="flex items-center text-textMuted hover:text-primary mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-1">Event Analytics</h1>
        <p className="text-textMuted font-medium text-lg">{event.title}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-xl text-primary"><Users className="w-8 h-8" /></div>
          <div>
            <p className="text-textMuted text-sm font-medium">Registrations</p>
            <p className="text-2xl font-bold text-text">{totalRegs} <span className="text-sm text-gray-400 font-normal">/ {event.capacity}</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-xl text-green-600"><CheckCircle className="w-8 h-8" /></div>
          <div>
            <p className="text-textMuted text-sm font-medium">Checked In</p>
            <p className="text-2xl font-bold text-text">{checkedIn}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 p-4 rounded-xl text-amber-600"><Ticket className="w-8 h-8" /></div>
          <div>
            <p className="text-textMuted text-sm font-medium">Attendance Rate</p>
            <p className="text-2xl font-bold text-text">
              {totalRegs > 0 ? Math.round((checkedIn / totalRegs) * 100) : 0}%
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-xl text-purple-600"><IndianRupee className="w-8 h-8" /></div>
          <div>
            <p className="text-textMuted text-sm font-medium">Est. Revenue</p>
            <p className="text-2xl font-bold text-text">₹{revenue}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Timeline Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-text mb-6">Registration Timeline</h3>
          <div className="h-80">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-textMuted">No data available</div>
            )}
          </div>
        </div>

        {/* Status Breakdown Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-text mb-6">Status Breakdown</h3>
          <div className="flex-grow flex items-center justify-center h-80">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-textMuted">No data available</div>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {statusData.map(entry => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm font-medium text-text">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics;
