import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import FeedbackForm from "../../components/feedback/FeedbackForm";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Star,
  Heart,
  MessageSquare,
  X,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [feedback, setFeedback] = useState([]);
  //const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  //const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  //const [commentText, setCommentText] = useState('');
  //const [commenting, setCommenting] = useState(false);
  const [hasAttended, setHasAttended] = useState(false);
  const [alreadyFeedback, setAlreadyFeedback] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const [eventRes, feedbackRes] = await Promise.all([
          axiosInstance.get(`/events/${id}`),
          axiosInstance.get(`/feedback/event/${id}`),
          //axiosInstance.get(`/gallery/event/${id}`)
        ]);
        setEvent(eventRes.data.data);
        setFeedback(feedbackRes.data.data);
        //setGallery(galleryRes.data.data);

        const regRes = await axiosInstance.get("/registrations/mine");

        const myReg = regRes.data.data?.find(
          (r) => r.event?._id === id || r.event === id,
        );

        if (myReg) {
          setIsRegistered(true);
        }

        if (myReg?.status === "checked-in") {
          setHasAttended(true);
        }

        // Check if logged-in user has checked-in to this event
        if (user) {
          try {
            const regRes = await axiosInstance.get(`/registrations/mine`);
            const myReg = regRes.data.data?.find(
              (r) => r.event?._id === id || r.event === id,
            );
            if (myReg?.status === "checked-in") setHasAttended(true);
            // Check if user already left feedback
            const alreadyLeft = feedbackRes.data.data?.some(
              (f) => f.user?._id === user._id || f.user === user._id,
            );
            setAlreadyFeedback(alreadyLeft);
          } catch (_) {}
        }
      } catch (err) {
        toast.error("Failed to load event details");
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id, navigate, user]);

  const handleRegister = async () => {
    if (!user) {
      toast.error("Please login to register for this event");
      navigate("/login", { state: { from: `/events/${id}` } });
      return;
    }

    setRegistering(true);
    try {
      const res = await axiosInstance.post("/registrations", { eventId: id });
      toast.success(res.data.message);
      setIsRegistered(true);
      // Update local count to reflect change
      setEvent((prev) => ({
        ...prev,
        registeredCount: prev.registeredCount + 1,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register");
    } finally {
      setRegistering(false);
    }
  };
  /*
  const handleLike = async (itemId) => {
    if (!user) {
      toast.error('Please login to like this photo');
      return;
    }
    try {
      const res = await axiosInstance.patch(`/gallery/${itemId}/like`);
      setGallery(gallery.map(item => 
        item._id === itemId ? { ...item, likes: res.data.data.likes } : item
      ));
      if (selectedGalleryItem?._id === itemId) {
        setSelectedGalleryItem(prev => ({ ...prev, likes: res.data.data.likes }));
      }
    } catch (err) {
      toast.error('Failed to like');
    }
  };

  const handleComment = async (itemId) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (!commentText.trim()) return;
    
    setCommenting(true);
    try {
      const res = await axiosInstance.post(`/gallery/${itemId}/comment`, { text: commentText });
      setGallery(gallery.map(item => 
        item._id === itemId ? { ...item, comments: res.data.data.comments } : item
      ));
      if (selectedGalleryItem?._id === itemId) {
        setSelectedGalleryItem(prev => ({ ...prev, comments: res.data.data.comments }));
      }
      setCommentText('');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setCommenting(false);
    }
  };*/

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded-2xl mb-8"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      </div>
    );
  }

  if (!event) return null;

  const isFull = event.registeredCount >= event.capacity;
  const isPast = new Date(event.date) < new Date();

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-textMuted hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to events
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Banner */}
          <div className="h-64 md:h-96 bg-gray-100 w-full relative">
            {event.bannerUrl ? (
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Banner Image
              </div>
            )}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold text-primary uppercase tracking-wider">
              {event.category}
            </div>
          </div>

          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-text mb-4">
                  {event.title}
                </h1>
                <div className="flex items-center text-textMuted space-x-2">
                  {event.organizer?.avatarUrl ? (
                    <img
                      src={event.organizer.avatarUrl}
                      alt="Organizer"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      O
                    </div>
                  )}
                  <span>
                    Organized by{" "}
                    <span className="font-semibold text-text">
                      {event.organizer?.name || "Unknown"}
                    </span>
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-text mb-3">
                  About this event
                </h2>
                <div className="text-textMuted leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>

              {/* Feedback section for past events */}
              {isPast && (
                <div className="space-y-6">
                  {/* Average rating bar */}
                  {feedback.length > 0 &&
                    (() => {
                      const avg = (
                        feedback.reduce((s, f) => s + f.rating, 0) /
                        feedback.length
                      ).toFixed(1);
                      return (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5">
                          <h2 className="text-xl font-bold text-slate-900 mb-3">
                            Attendee Reviews
                          </h2>
                          <div className="flex items-center gap-4 mb-4">
                            <span className="text-5xl font-extrabold text-amber-500">
                              {avg}
                            </span>
                            <div>
                              <div className="flex gap-0.5 mb-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-5 h-5 ${s <= Math.round(avg) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-textMuted">
                                {feedback.length} review
                                {feedback.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {feedback.map((fb) => (
                              <div
                                key={fb._id}
                                className="bg-white rounded-xl p-4 shadow-sm"
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                    style={{
                                      background:
                                        "linear-gradient(135deg,#10b981,#06b6d4)",
                                    }}
                                  >
                                    {fb.user?.name?.charAt(0)}
                                  </div>
                                  <span className="font-semibold text-slate-900 text-sm">
                                    {fb.user?.name}
                                  </span>
                                  <div className="flex gap-0.5 ml-auto">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={`w-3.5 h-3.5 ${s <= fb.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {fb.comment && (
                                  <p className="text-textMuted text-sm leading-relaxed">
                                    {fb.comment}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                  {/* Feedback submission form */}
                  {user && hasAttended && !alreadyFeedback && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        Leave Your Review
                      </h3>
                      <p className="text-sm text-textMuted mb-4">
                        You attended this event — share your experience!
                      </p>
                      <FeedbackForm
                        eventId={id}
                        onFeedbackSubmitted={(newFb) => {
                          setFeedback((prev) => [...prev, newFb]);
                          setAlreadyFeedback(true);
                          toast.success("Thanks for your feedback! ⭐");
                        }}
                      />
                    </div>
                  )}

                  {user && hasAttended && alreadyFeedback && (
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
                      <p className="text-green-700 font-semibold">
                        ✓ You've already submitted feedback for this event
                      </p>
                    </div>
                  )}

                  {user && !hasAttended && isPast && (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5 text-center">
                      <p className="text-textMuted text-sm">
                        Only attendees who checked in can leave feedback.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-text">
                        {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-text">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-text">
                        {event.isOnline ? "Online Event" : event.venue}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-primary mr-3" />
                    <p className="font-medium text-text">
                      {event.registeredCount} / {event.capacity} attending
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <p className="text-2xl font-bold text-text mb-4">
                    {event.price === 0 ? "Free" : `₹${event.price}`}
                  </p>

                  {user?.role === "organizer" &&
                  user._id === event.organizer._id ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/organizer/events/${id}/edit`)}
                    >
                      Edit Event
                    </Button>
                  ) : isRegistered ? (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-600"
                      disabled
                    >
                      ✓ Registered
                    </Button>
                  ) : isPast ? (
                    <Button className="w-full" disabled>
                      Event has ended
                    </Button>
                  ) : isFull ? (
                    <Button
                      className="w-full shadow-lg py-3 bg-amber-500 hover:bg-amber-600 border-amber-500 text-white"
                      onClick={handleRegister}
                      isLoading={registering}
                    >
                      Join Waitlist
                    </Button>
                  ) : (
                    <Button
                      className="w-full shadow-lg shadow-primary/30 py-3"
                      onClick={handleRegister}
                      isLoading={registering}
                    >
                      Register Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
