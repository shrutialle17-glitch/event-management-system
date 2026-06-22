import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar as CalendarIcon, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_COLORS = {
  conference: 'bg-violet-100 text-violet-700',
  workshop: 'bg-blue-100 text-blue-700',
  concert: 'bg-pink-100 text-pink-700',
  sports: 'bg-orange-100 text-orange-700',
  networking: 'bg-teal-100 text-teal-700',
  webinar: 'bg-cyan-100 text-cyan-700',
  other: 'bg-slate-100 text-slate-600',
};

const EventCard = ({ event }) => {
  const pct = event.capacity > 0 ? Math.min((event.registeredCount / event.capacity) * 100, 100) : 0;
  const catColor = CATEGORY_COLORS[event.category?.toLowerCase()] || CATEGORY_COLORS.other;
  const isFull = pct >= 100;
  const isAlmostFull = pct >= 80 && !isFull;

  return (
    <Link to={`/events/${event._id}`} className="group block h-full">
      <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1.5"
        style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04)' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 16px 48px rgba(15,23,42,0.14), 0 4px 12px rgba(15,23,42,0.06)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04)'}
      >
        {/* Banner Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
          {event.bannerUrl ? (
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
              <CalendarIcon className="w-12 h-12" />
              <span className="text-xs font-medium">No image</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Category badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-sm ${catColor}`}>
            {event.category}
          </div>

          {/* Status badges */}
          {isFull && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-500/90 text-white backdrop-blur-sm">
              Full
            </div>
          )}
          {isAlmostFull && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-500/90 text-white backdrop-blur-sm">
              Almost Full
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200 leading-snug">
            {event.title}
          </h3>

          <div className="space-y-2 flex-grow">
            <div className="flex items-center text-sm text-slate-500 gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-medium">{format(new Date(event.date), 'MMM d, yyyy')}</span>
              <span className="text-slate-300">•</span>
              <span>{event.time}</span>
            </div>
            <div className="flex items-center text-sm text-slate-500 gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-slate-50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-grow">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.registeredCount} registered</span>
                  <span className="font-semibold text-slate-600">{Math.round(pct)}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-400' : isAlmostFull ? 'bg-amber-400' : 'bg-gradient-to-r from-primary to-accent'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors duration-200 flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors duration-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
