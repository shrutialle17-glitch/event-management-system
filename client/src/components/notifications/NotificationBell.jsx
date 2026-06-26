import React, { useState } from "react";
import { Bell } from "lucide-react";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Dummy notifications
  const notifications = [
    "Welcome to Event Management!",
    "Your event registration is confirmed.",
    "New event added near you."
  ];

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="w-6 h-6 text-gray-700" />

        {/* Notification Count */}
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {notifications.length}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-3 font-semibold border-b">
            Notifications
          </div>

          {notifications.map((item, index) => (
            <div
              key={index}
              className="p-3 border-b last:border-b-0 hover:bg-gray-50"
            >
              {item}
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;