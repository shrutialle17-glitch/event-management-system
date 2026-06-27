import React from 'react';
import { Calendar, Globe, ExternalLink, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white mt-auto relative overflow-hidden">
      {/* Subtle gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Soft glow blobs */}
      <div className="absolute -bottom-20 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -top-10 right-1/3 w-48 h-48 bg-accent/5 rounded-full blur-[60px] pointer-events-none" />

      <div className="container mx-auto px-4 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="bg-primary p-2 rounded-xl shadow-button group-hover:shadow-button-hover group-hover:-translate-y-0.5 transition-all duration-250">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Event<span className="text-primary">io</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
              The modern platform for discovering, registering, and managing world-class events seamlessly. Built for organizers and attendees alike.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: <Share2 className="w-4 h-4" />, href: '#' },
                { icon: <Globe className="w-4 h-4" />, href: '#' },
                { icon: <ExternalLink className="w-4 h-4" />, href: '#' },
              ].map((s, i) => (
                <a key={i} href={s.href} className="w-9 h-9 bg-white/8 hover:bg-primary/20 border border-white/8 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all duration-200">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">Explore</h3>
            <ul className="space-y-3">
              {[
                { label: 'Browse Events', href: '/events' },
                { label: 'Conferences', href: '/events?category=conference' },
                { label: 'Workshops', href: '/events?category=workshop' },
                { label: 'Networking', href: '/events?category=networking' },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.href} className="text-slate-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-0.5 inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">Legal</h3>
            <ul className="space-y-3">
              {[
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Cookie Policy', href: '#' },
              ].map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-slate-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-0.5 inline-block">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Eventio. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built with <span className="text-red-400">♥</span> for event lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
