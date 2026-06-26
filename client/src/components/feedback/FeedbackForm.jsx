import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '../../api/axiosInstance';
import Button from '../common/Button';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

const feedbackSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().max(1000, 'Comment is too long').optional(),
});

const FeedbackForm = ({ eventId, onFeedbackSubmitted, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { rating: 0, comment: '' }
  });

  const onSubmit = async (data) => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    try {
      const res = await axiosInstance.post('/feedback', { eventId, rating: data.rating, comment: data.comment });
      toast.success('Feedback submitted successfully!');

      if (onSuccess) {
        onSuccess();
      } 

      if (onFeedbackSubmitted) onFeedbackSubmitted(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const handleRatingClick = (val) => {
    setRating(val);
    setValue('rating', val, { shouldValidate: true });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-6">
      <h3 className="text-lg font-bold text-text mb-4">Leave Feedback</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-2">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Comment (Optional)</label>
          <textarea
            {...register('comment')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Share your experience..."
          ></textarea>
          {errors.comment && <p className="text-red-500 text-xs mt-1">{errors.comment.message}</p>}
        </div>

        <Button type="submit" isLoading={isSubmitting}>Submit Feedback</Button>
      </form>
    </div>
  );
};

export default FeedbackForm;
