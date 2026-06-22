import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Search, SlidersHorizontal, CalendarDays } from 'lucide-react';
import EventCard from '../../components/events/EventCard';

const CATEGORIES = ['conference', 'workshop', 'concert', 'networking', 'sports', 'webinar', 'other'];
const CATEGORY_EMOJI = { conference:'🎤', workshop:'🛠', concert:'🎵', networking:'🤝', sports:'⚽', webinar:'💻', other:'✨' };

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const categoryParam = searchParams.get('category') || '';
  const searchParam   = searchParams.get('search') || '';
  const timeParam     = searchParams.get('time') || '';

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        let url = '/events?';
        if (categoryParam) url += `category=${categoryParam}&`;
        if (searchParam)   url += `search=${searchParam}&`;
        if (timeParam)     url += `time=${timeParam}&`;
        const res = await axiosInstance.get(url);
        setEvents(res.data.data.events);
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [categoryParam, searchParam, timeParam]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) searchParams.set('search', searchInput.trim());
    else searchParams.delete('search');
    setSearchParams(searchParams);
  };

  const setCategory = (cat) => {
    if (cat) searchParams.set('category', cat);
    else searchParams.delete('category');
    setSearchParams(searchParams);
  };

  const setTime = (val) => {
    if (val) searchParams.set('time', val);
    else searchParams.delete('time');
    setSearchParams(searchParams);
  };

  const activeFiltersCount = [categoryParam, searchParam, timeParam].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100" style={{boxShadow:'0 1px 0 rgba(15,23,42,0.06)'}}>
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-1">Browse Events</h1>
          <p className="text-textMuted">Find your next great experience</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center shadow-card border border-slate-100">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2 min-w-0">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events by name or venue..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all bg-slate-50 placeholder-slate-400"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex-shrink-0">
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 md:border-l md:border-slate-100 md:pl-4">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0 hidden md:block" />
            <select
              className="flex-1 md:flex-initial px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-slate-50 text-slate-700 font-medium cursor-pointer"
              value={timeParam}
              onChange={e => setTime(e.target.value)}
            >
              <option value="">All Dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past Events</option>
            </select>

            <select
              className="flex-1 md:flex-initial px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-slate-50 text-slate-700 font-medium cursor-pointer"
              value={categoryParam}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{CATEGORY_EMOJI[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Tabs */}
        <div className="flex bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm mb-6 w-fit">
          {[
            { key: '',         label: 'All Events' },
            { key: 'upcoming', label: '🗓 Upcoming' },
            { key: 'past',     label: '📁 Past Events' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setTime(tab.key)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={
                timeParam === tab.key
                  ? { background: 'linear-gradient(135deg,#10b981,#06b6d4)', color: 'white', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }
                  : { color: '#64748b' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <button
            onClick={() => setCategory('')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200 ${!categoryParam ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat === categoryParam ? '' : cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200 ${categoryParam === cat ? 'bg-primary text-white shadow-button' : 'bg-white border border-slate-200 text-slate-500 hover:border-primary/30 hover:text-primary'}`}
            >
              {CATEGORY_EMOJI[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-textMuted font-medium">
              <span className="font-bold text-slate-900">{events.length}</span> events found
              {activeFiltersCount > 0 && <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">{activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active</span>}
            </p>
            {activeFiltersCount > 0 && (
              <button onClick={() => setSearchParams({})} className="text-xs text-slate-500 hover:text-red-500 font-medium transition-colors">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white border border-slate-100" style={{boxShadow:'0 4px 24px rgba(15,23,42,0.06)'}}>
                <div className="h-48 shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-5 shimmer w-3/4" />
                  <div className="h-3 shimmer w-1/2" />
                  <div className="h-3 shimmer w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <CalendarDays className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No events found</h3>
            <p className="text-textMuted max-w-sm mx-auto mb-6">Try adjusting your search or filter criteria.</p>
            <button onClick={() => { setSearchInput(''); setSearchParams({}); }} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured section */}
            {!categoryParam && !searchParam && events.some(e => e.isFeatured) && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Featured Events</h2>
                  <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">Hot 🔥</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.filter(e => e.isFeatured).map(event => (
                    <div key={event._id} className="relative">
                      <div className="absolute -top-3 -right-3 z-10 bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg font-bold">★</div>
                      <EventCard event={event} />
                    </div>
                  ))}
                </div>
                <div className="mt-10 border-t border-slate-100" />
              </div>
            )}

            {/* All Events */}
            <div>
              {(!categoryParam && !searchParam && events.some(e => e.isFeatured)) && (
                <h2 className="text-2xl font-bold text-slate-900 mb-6">All Events</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.filter(e => categoryParam || searchParam || !e.isFeatured).map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseEvents;
