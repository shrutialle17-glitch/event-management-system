import axiosInstance from './axiosInstance';

export const getNotifications = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get(`/notifications?page=${page}&limit=${limit}`);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axiosInstance.get('/notifications/unread-count');
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axiosInstance.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axiosInstance.patch('/notifications/read-all');
  return response.data;
};
