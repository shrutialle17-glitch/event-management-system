import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notificationApi';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, Bell, Info, Calendar, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refetch } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications(1, 20); // Get latest 20
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, eventId, type) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      refetch();
      if (eventId) {
        onClose();
        if (type === 'new-registration-organizer') {
          navigate(`/organizer/events/${eventId}/registrations`);
        } else {
          navigate(`/events/${eventId}`);
        }
      }
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      refetch();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'registration-confirmation':
      case 'attendance-confirmed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'new-registration-organizer':
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'event-updated':
      case 'reminder-1day':
      case 'reminder-1hour':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'event-cancelled':
        return <Info className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-text">Notifications</h3>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={handleMarkAllRead}
            className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"
          >
            <Check className="w-3 h-3" /> Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-textMuted flex flex-col items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-text font-medium">You're all caught up!</p>
            <p className="text-xs text-textMuted mt-1">No new notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(notification => (
              <div 
                key={notification._id}
                onClick={() => handleMarkAsRead(notification._id, notification.event?._id, notification.type)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 ${!notification.isRead ? 'bg-primary/5' : ''}`}
              >
                <div className="mt-1 flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm font-semibold truncate pr-2 ${!notification.isRead ? 'text-text' : 'text-gray-700'}`}>
                      {notification.title}
                    </p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-xs ${!notification.isRead ? 'text-gray-600 font-medium' : 'text-textMuted'} line-clamp-2`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
          <p className="text-xs text-textMuted">Showing recent notifications</p>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
