import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { ArrowLeft, Star, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Reports = () => {
  const [reports, setReports] = useState({ flaggedFeedback: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axiosInstance.get('/admin/reports');
        setReports(res.data.data);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Reports...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/admin" className="flex items-center text-textMuted hover:text-primary mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Platform Moderation</h1>
        <p className="text-textMuted">Review flagged content and low-rated feedback.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          Flagged Feedback (≤ 2 Stars)
        </h2>

        {reports.flaggedFeedback.length === 0 ? (
          <div className="text-center py-12 text-textMuted bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No flagged feedback currently requires review.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.flaggedFeedback.map(fb => (
              <div key={fb._id} className="p-4 border border-red-100 bg-red-50/30 rounded-xl flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-text">{fb.user?.name || 'Unknown User'}</span>
                    <span className="text-textMuted text-xs">•</span>
                    <span className="text-textMuted text-xs">{format(new Date(fb.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Event: </span>
                    <Link to={`/events/${fb.event?._id}`} className="text-primary hover:underline text-sm font-medium">
                      {fb.event?.title || 'Deleted Event'}
                    </Link>
                  </div>
                  
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < fb.rating ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
                    ))}
                  </div>

                  {fb.comment && (
                    <p className="text-text mt-2 italic border-l-2 border-red-300 pl-3">"{fb.comment}"</p>
                  )}
                </div>
                
                <div className="flex items-start">
                  <button className="text-sm font-medium text-red-600 hover:text-red-800 bg-white border border-red-200 px-4 py-2 rounded-lg transition-colors">
                    Delete Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
