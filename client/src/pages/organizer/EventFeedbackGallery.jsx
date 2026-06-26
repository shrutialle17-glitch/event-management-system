import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Star, Heart, MessageSquare, X, Image, MessageCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EventFeedbackGallery = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feedback');
  const [selectedItem, setSelectedItem] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, feedbackRes, galleryRes] = await Promise.all([
          axiosInstance.get(`/events/${id}`),
          axiosInstance.get(`/feedback/event/${id}`),
          axiosInstance.get(`/gallery/event/${id}`),
        ]);
        setEvent(eventRes.data.data);
        setFeedback(feedbackRes.data.data || []);
        setGallery(galleryRes.data.data || []);
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleLike = async (itemId) => {
    if (!user) { toast.error('Please log in to like'); return; }
    try {
      const res = await axiosInstance.patch(`/gallery/${itemId}/like`);
      const updatedLikes = res.data.data.likes;
      setGallery(g => g.map(item => item._id === itemId ? { ...item, likes: updatedLikes } : item));
      if (selectedItem?._id === itemId) setSelectedItem(prev => ({ ...prev, likes: updatedLikes }));
    } catch {
      toast.error('Failed to like');
    }
  };

  const handleComment = async (itemId) => {
    if (!user) { toast.error('Please log in to comment'); return; }
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      const res = await axiosInstance.post(`/gallery/${itemId}/comment`, { text: commentText });
      const updatedComments = res.data.data.comments;
      setGallery(g => g.map(item => item._id === itemId ? { ...item, comments: updatedComments } : item));
      if (selectedItem?._id === itemId) setSelectedItem(prev => ({ ...prev, comments: updatedComments }));
      setCommentText('');
      toast.success('Comment posted!');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setCommenting(false);
    }
  };

  const avgRating = feedback.length
    ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1)
    : null;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100" style={{ boxShadow: '0 1px 0 rgba(15,23,42,0.06)' }}>
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <Link to="/organizer" className="inline-flex items-center gap-1.5 text-sm text-textMuted hover:text-primary font-medium mb-4 group transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{event?.title}</h1>
            <p className="text-textMuted text-sm mt-0.5">Feedback & Gallery</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Reviews',
              value: feedback.length,
              sub: avgRating ? `Avg ${avgRating} ★` : 'No ratings yet',
              style: 'linear-gradient(135deg,#f59e0b,#ea580c)',
            },
            {
              label: 'Gallery Photos',
              value: gallery.length,
              sub: `${gallery.reduce((s, i) => s + (i.likes?.length || 0), 0)} total likes`,
              style: 'linear-gradient(135deg,#10b981,#06b6d4)',
            },
            {
              label: 'Comments',
              value: gallery.reduce((s, i) => s + (i.comments?.length || 0), 0),
              sub: 'Across all photos',
              style: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
            },
          ].map(s => (
            <div key={s.label} className="relative overflow-hidden rounded-2xl p-5 text-white"
                 style={{ background: s.style, boxShadow: '0 4px 24px rgba(15,23,42,0.1)' }}>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-4xl font-extrabold tracking-tight">{s.value}</p>
              <p className="text-white/60 text-xs mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm mb-6 w-fit">
          {[
            { key: 'feedback', label: `⭐ Reviews (${feedback.length})` },
            { key: 'gallery',  label: `📸 Gallery (${gallery.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={
                activeTab === tab.key
                  ? { background: 'linear-gradient(135deg,#10b981,#06b6d4)', color: 'white', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }
                  : { color: '#64748b' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── FEEDBACK TAB ─── */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            {feedback.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
                  <Star className="w-8 h-8" />
                </div>
                <p className="font-bold text-slate-900 mb-1">No reviews yet</p>
                <p className="text-textMuted text-sm">Feedback will appear here after attendees submit their reviews.</p>
              </div>
            ) : (
              <>
                {/* Average Summary */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6 flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-6xl font-extrabold text-amber-500">{avgRating}</p>
                    <div className="flex gap-0.5 justify-center mt-2">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-textMuted mt-1">{feedback.length} review{feedback.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5,4,3,2,1].map(star => {
                      const count = feedback.filter(f => f.rating === star).length;
                      const pct = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-600 w-4">{star}</span>
                          <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-textMuted w-5">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="grid gap-4">
                  {feedback.map(fb => (
                    <div key={fb._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                             style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}>
                          {fb.user?.name?.charAt(0)}
                        </div>
                        <div className="flex-grow">
                          <p className="font-bold text-slate-900 text-sm">{fb.user?.name}</p>
                          <p className="text-xs text-textMuted">{fb.createdAt ? format(new Date(fb.createdAt), 'MMM d, yyyy') : ''}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-4 h-4 ${s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      {fb.comment && (
                        <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 rounded-xl p-3">{fb.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── GALLERY TAB ─── */}
        {activeTab === 'gallery' && (
          <div>
            {gallery.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                  <Image className="w-8 h-8" />
                </div>
                <p className="font-bold text-slate-900 mb-1">No photos yet</p>
                <p className="text-textMuted text-sm">Attendees can upload photos from the event page.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {gallery.map(item => (
                  <div
                    key={item._id}
                    className="group relative rounded-2xl overflow-hidden bg-slate-100 aspect-square cursor-pointer"
                    style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
                    onClick={() => { setSelectedItem(item); setCommentText(''); }}
                  >
                    {item.mediaType === 'video' ? (
                      <video src={item.mediaUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.mediaUrl} alt="Gallery" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                      <div className="flex justify-end gap-3 text-white">
                        <span className="flex items-center gap-1 text-sm font-bold">
                          <Heart className={`w-4 h-4 ${item.likes?.includes(user?._id) ? 'fill-red-400 text-red-400' : ''}`} />
                          {item.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-1 text-sm font-bold">
                          <MessageSquare className="w-4 h-4" />
                          {item.comments?.length || 0}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold">{item.uploadedBy?.name || 'Attendee'}</p>
                        {item.caption && <p className="text-white/70 text-xs mt-0.5 line-clamp-2">{item.caption}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── LIGHTBOX MODAL (Like & Comment) ─── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row h-full max-h-[88vh] shadow-2xl">
            {/* Media */}
            <div className="flex-1 bg-black flex items-center justify-center min-h-[40vh]">
              {selectedItem.mediaType === 'video' ? (
                <video src={selectedItem.mediaUrl} controls autoPlay className="max-w-full max-h-full object-contain" />
              ) : (
                <img src={selectedItem.mediaUrl} alt="Gallery" className="max-w-full max-h-full object-contain" />
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-96 flex flex-col bg-white flex-shrink-0">
              {/* Uploader */}
              <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                     style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}>
                  {selectedItem.uploadedBy?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{selectedItem.uploadedBy?.name || 'Attendee'}</p>
                  <p className="text-xs text-textMuted">{selectedItem.createdAt ? format(new Date(selectedItem.createdAt), 'MMM d, yyyy') : ''}</p>
                </div>
              </div>

              {/* Caption + Comments scroll */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedItem.caption && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                         style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}>
                      {selectedItem.uploadedBy?.name?.charAt(0) || 'A'}
                    </div>
                    <p className="text-sm text-slate-700">
                      <span className="font-bold text-slate-900 mr-1">{selectedItem.uploadedBy?.name || 'Attendee'}</span>
                      {selectedItem.caption}
                    </p>
                  </div>
                )}

                {selectedItem.comments?.map((c, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
                      {c.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-bold text-slate-900 mr-1">{c.user?.name || 'User'}</span>
                        {c.text}
                      </p>
                      <p className="text-xs text-textMuted mt-0.5">{c.createdAt ? format(new Date(c.createdAt), 'MMM d, h:mm a') : ''}</p>
                    </div>
                  </div>
                ))}

                {!selectedItem.comments?.length && !selectedItem.caption && (
                  <p className="text-center text-textMuted text-sm pt-10">No comments yet. Be the first!</p>
                )}
              </div>

              {/* Like & Comment Action */}
              <div className="p-4 border-t border-slate-100 flex-shrink-0">
                {/* Like button */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => handleLike(selectedItem._id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-red-50 group"
                  >
                    <Heart className={`w-5 h-5 transition-all ${selectedItem.likes?.includes(user?._id) ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-400 group-hover:text-red-400'}`} />
                    <span className="font-bold text-sm text-slate-700">{selectedItem.likes?.length || 0} likes</span>
                  </button>
                </div>

                {/* Comment input */}
                <form
                  onSubmit={e => { e.preventDefault(); handleComment(selectedItem._id); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    className="flex-1 text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commenting}
                    className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFeedbackGallery;
