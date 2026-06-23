import React from 'react';
import { Calendar, Globe, ExternalLink, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-text">Eventio</span>
            </Link>
            <p className="text-textMuted max-w-sm">
              The modern platform for discovering, registering, and managing world-class events seamlessly.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-text mb-4">Explore</h3>
            <ul className="space-y-2">
              <li><Link to="/events" className="text-textMuted hover:text-primary transition-colors">Browse Events</Link></li>
              <li><Link to="/events?category=conference" className="text-textMuted hover:text-primary transition-colors">Conferences</Link></li>
              <li><Link to="/events?category=workshop" className="text-textMuted hover:text-primary transition-colors">Workshops</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-text mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-textMuted hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-textMuted hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-textMuted">
          <p>&copy; {new Date().getFullYear()} Eventio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
