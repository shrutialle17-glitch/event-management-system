import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['conference', 'workshop', 'concert', 'sports', 'networking', 'webinar', 'other']),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  venue: z.string().min(3, 'Venue is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  isOnline: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']),
});

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(eventSchema),
  });

  const isOnline = watch('isOnline');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axiosInstance.get(`/events/${id}`);
        const eventData = res.data.data;
        // Format date for input type="date"
        eventData.date = format(new Date(eventData.date), 'yyyy-MM-dd');
        reset(eventData);
        setBannerUrl(eventData.bannerUrl || '');
      } catch (err) {
        toast.error('Failed to load event');
        navigate('/organizer');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, reset, navigate]);

  const onSubmit = async (data) => {
    try {
      await axiosInstance.put(`/events/${id}`, data);
      toast.success('Event updated successfully');
      navigate('/organizer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('banner', file);

    setUploadingBanner(true);
    try {
      const res = await axiosInstance.post(`/events/${id}/banner`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBannerUrl(res.data.data.bannerUrl);
      toast.success('Banner updated successfully');
    } catch (err) {
      toast.error('Failed to upload banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center text-textMuted hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        {/* Banner Upload Section */}
        <div className="h-64 bg-gray-100 relative group flex items-center justify-center border-b border-gray-200">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-gray-400 flex flex-col items-center">
              <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
              <span>No Banner Image</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <label className="cursor-pointer bg-white text-text px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition flex items-center gap-2 shadow-lg">
              {uploadingBanner ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></span>
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploadingBanner ? 'Uploading...' : 'Change Banner'}
              <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} disabled={uploadingBanner} />
            </label>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-text mb-8">Edit Event</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Same form fields as CreateEvent */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">Event Title</label>
              <input {...register('title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Description</label>
              <textarea {...register('description')} rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Category</label>
                <select {...register('category')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 bg-white">
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="concert">Concert</option>
                  <option value="sports">Sports</option>
                  <option value="networking">Networking</option>
                  <option value="webinar">Webinar</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('isOnline')} className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                  <span className="text-sm font-medium text-text">This is an online event</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Date</label>
                <input type="date" {...register('date')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Time</label>
                <input type="time" {...register('time')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">{isOnline ? 'Meeting Link / Virtual Venue' : 'Physical Location'}</label>
              <input {...register('venue')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Total Capacity</label>
                <input type="number" {...register('capacity')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Ticket Price (₹)</label>
                <input type="number" {...register('price')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Event Status</label>
              <select {...register('status')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 bg-white">
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published (Live)</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed (Past)</option>
              </select>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <Button type="submit" isLoading={isSubmitting} className="px-8">
                Update Event
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
