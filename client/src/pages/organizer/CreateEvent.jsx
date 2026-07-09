import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Input from '../../components/common/Button'; // Using native inputs for now to manage layout better
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

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
  status: z.enum(['draft', 'published']),
});

const CreateEvent = () => {
  const navigate = useNavigate();
  const [bannerFile, setBannerFile] = useState(null);
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      category: 'conference',
      isOnline: false,
      capacity: 100,
      price: 0,
      status: 'draft'
    }
  });

  const isOnline = watch('isOnline');

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      // Send data to backend
      const res = await axiosInstance.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Event created successfully');
      // Redirect to edit page to allow further changes
      navigate(`/organizer/events/${res.data.data._id}/edit`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center text-textMuted hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <h1 className="text-3xl font-bold text-text mb-8">Create New Event</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Event Banner</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Event Title</label>
              <input 
                {...register('title')} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" 
                placeholder="Awesome Tech Conference 2024"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Description</label>
              <textarea 
                {...register('description')} 
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" 
                placeholder="Detailed description of your event..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Category</label>
                <select 
                  {...register('category')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 bg-white"
                >
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="concert">Concert</option>
                  <option value="sports">Sports</option>
                  <option value="networking">Networking</option>
                  <option value="webinar">Webinar</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
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
                <input 
                  type="date" 
                  {...register('date')} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" 
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Time</label>
                <input 
                  type="time" 
                  {...register('time')} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" 
                />
                {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                {isOnline ? 'Meeting Link / Virtual Venue' : 'Physical Location'}
              </label>
              <input 
                {...register('venue')} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" 
                placeholder={isOnline ? "https://zoom.us/j/..." : "123 Event Center, City, State"}
              />
              {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Total Capacity</label>
                <input 
                  type="number" 
                  {...register('capacity')} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" 
                />
                {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Ticket Price (₹) - 0 for Free</label>
                <input 
                  type="number" 
                  {...register('price')} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1" 
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Initial Status</label>
              <select 
                {...register('status')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 bg-white"
              >
                <option value="draft">Draft (Hidden from public)</option>
                <option value="published">Published (Visible and open)</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <Button type="submit" isLoading={isSubmitting} className="px-8">
              Save & Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
