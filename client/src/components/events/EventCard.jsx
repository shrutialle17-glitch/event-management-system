import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar as CalendarIcon, Users } from 'lucide-react';
import { format } from 'date-fns';

const EventCard = ({ event }) => {
  return (
    <Link to={`/events/${event._id}`} className="group h-full">
      <div className="glass-card bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full border border-gray-100">
        <div className="h-48 relative overflow-hidden bg-gray-100">
          {event.bannerUrl ? (
            <img 
              src={event.bannerUrl} 
              alt={event.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary uppercase tracking-wide">
            {event.category}
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          <div className="space-y-2 mt-auto pt-4 border-t border-gray-50">
            <div className="flex items-center text-sm text-textMuted">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {format(new Date(event.date), 'MMM d, yyyy')} • {event.time}
            </div>
            <div className="flex items-center text-sm text-textMuted">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center text-sm text-textMuted">
              <Users className="w-4 h-4 mr-2" />
              {event.registeredCount} / {event.capacity} registered
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
