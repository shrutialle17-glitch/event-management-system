import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import FeedbackForm from "../../components/feedback/FeedbackForm";
import { format } from "date-fns";
import toast from "react-hot-toast";

const EventDetails = () => {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [eventRes, feedbackRes] = await Promise.all([
        axiosInstance.get(`/events/${id}`),
        axiosInstance.get(`/feedback/event/${id}`),
      ]);

      setEvent(eventRes.data.data);
      setFeedback(feedbackRes.data.data);
    } catch (error) {
      toast.error("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await axiosInstance.post("/registrations", {
        eventId: id,
      });

      toast.success(res.data.message);

      setEvent((prev) => ({
        ...prev,
        registeredCount: prev.registeredCount + 1,
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-10 text-center">
        Event not found
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Banner */}
      {event.bannerUrl && (
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="w-full h-80 object-cover rounded-xl mb-6"
        />
      )}

      {/* Event Details */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {event.title}
        </h1>

        <p className="text-gray-600 mb-4">
          {event.description}
        </p>

        <div className="space-y-2">
          <p>
            <strong>Date:</strong>{" "}
            {format(new Date(event.date), "PPP")}
          </p>

          <p>
            <strong>Time:</strong>{" "}
            {event.time}
          </p>

          <p>
            <strong>Venue:</strong>{" "}
            {event.venue}
          </p>

          <p>
            <strong>Capacity:</strong>{" "}
            {event.registeredCount} / {event.capacity}
          </p>

          <p>
            <strong>Price:</strong>{" "}
            {event.price === 0
              ? "Free"
              : `₹${event.price}`}
          </p>
        </div>

        <button
          onClick={handleRegister}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Register
        </button>
      </div>

      {/* Feedback Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">
          Feedback
        </h2>

        {feedback.length === 0 ? (
          <p>No feedback yet.</p>
        ) : (
          feedback.map((item) => (
            <div
              key={item._id}
              className="border-b py-4"
            >
              <p className="font-semibold">
                {item.user?.name || "User"}
              </p>

              <p>
                Rating: ⭐ {item.rating}/5
              </p>

              <p>{item.comment}</p>
            </div>
          ))
        )}

        <FeedbackForm
          eventId={id}
          onFeedbackSubmitted={(newFeedback) =>
            setFeedback((prev) => [
              newFeedback,
              ...prev,
            ])
          }
        />
      </div>
    </div>
  );
};

export default EventDetails;