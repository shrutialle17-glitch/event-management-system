import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const ForgotPassword = () => {
  const [successMessage, setSuccessMessage] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data) => {
    try {
      const res = await axiosInstance.post('/auth/forgot-password', { email: data.email });
      setSuccessMessage(res.data.message);
      toast.success('Reset link sent!');
    } catch (err) {
      toast.error('Failed to send reset link');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text">Forgot Password</h1>
          <p className="text-textMuted mt-2">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {successMessage ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-center mb-6">
            <p className="font-medium">{successMessage}</p>
            <p className="text-sm mt-2">Please check your inbox and spam folder.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email}
            />
            
            <Button type="submit" className="w-full py-2.5" isLoading={isSubmitting}>
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-textMuted">
          Remember your password?{' '}
          <Link to="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
