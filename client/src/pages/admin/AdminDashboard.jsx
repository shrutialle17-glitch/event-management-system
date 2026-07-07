import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Users, Calendar, Ticket, IndianRupee, Flag, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axiosInstance.get('/admin/analytics');
        setAnalytics(res.data.data);
      } catch (err) {
        console.error('Failed to fetch platform analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Analytics...</div>;
  if (!analytics) return null;

  const { totals, registrationsPerMonth } = analytics;

  // Format chart data
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = registrationsPerMonth.map(item => ({
    name: `${monthNames[item._id.month - 1]} '${item._id.year.toString().slice(2)}`,
    registrations: item.count
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-8xl">
      <div className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent" />
        <div className="container mx-auto px-6 py-10 max-w-8xl relative">
          <h1 className="text-3xl font-semibold text-white">Platform overview</h1>
          <p className="text-sm text-slate-400 mt-1.5">Usage and revenue across the whole platform.</p>
        </div>
      </div>

      {/* Admin Nav Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link to="/admin/users" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-primary/50 hover:shadow-md transition-all text-center group">
          <Users className="w-6 h-6 mx-auto mb-2 text-textMuted group-hover:text-primary transition-colors" />
          <p className="font-semibold text-text group-hover:text-primary transition-colors">Manage Users</p>
        </Link>
        <Link to="/admin/events" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-primary/50 hover:shadow-md transition-all text-center group">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-textMuted group-hover:text-primary transition-colors" />
          <p className="font-semibold text-text group-hover:text-primary transition-colors">Manage Events</p>
        </Link>
        <Link to="/admin/events/pending" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-primary/50 hover:shadow-md transition-all text-center group">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-textMuted group-hover:text-amber-500 transition-colors" />
          <p className="font-semibold text-text group-hover:text-amber-500 transition-colors">Pending Events</p>
        </Link>
        <Link to="/admin/reports" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-primary/50 hover:shadow-md transition-all text-center group">
          <Flag className="w-6 h-6 mx-auto mb-2 text-textMuted group-hover:text-primary transition-colors" />
          <p className="font-semibold text-text group-hover:text-primary transition-colors">View Reports</p>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600"><Users className="w-8 h-8" /></div>
          <div>
            <p className="text-textMuted text-sm font-medium">Total Users</p>
            <p className="text-2xl font-bold text-text">{totals.users}</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-xl text-green-600"><Calendar className="w-8 h-8" /></div>
          <div>
            <p className="text-textMuted text-sm font-medium">Total Events</p>
            <p className="text-2xl font-bold text-text">{totals.events}</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-amber-100 p-4 rounded-xl text-amber-600"><Ticket className="w-8 h-8" /></div>
          <div>
            <p className="text-textMuted text-sm font-medium">Registrations</p>
            <p className="text-2xl font-bold text-text">{totals.registrations}</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-xl text-purple-600"><IndianRupee className="w-8 h-8" /></div>
          <div>
            <p className="text-textMuted text-sm font-medium">Platform Volume</p>
            <p className="text-2xl font-bold text-text">₹{totals.revenue}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-text mb-6">Platform Registrations (Last 6 Months)</h3>
        <div className="h-[400px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--role-accent-hex, #00674F)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--role-accent-hex, #00674F)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" dataKey="registrations" stroke="var(--role-accent-hex, #00674F)" strokeWidth={3} fillOpacity={1} fill="url(#colorRegs)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-textMuted">Not enough data to generate chart</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
