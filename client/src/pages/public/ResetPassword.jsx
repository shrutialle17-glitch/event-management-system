import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data) => {
    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, { password: data.password });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. The token may be expired.');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text">Reset Password</h1>
          <p className="text-textMuted mt-2">Enter your new password below.</p>
        </div>

        {success ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-center mb-6">
            <p className="font-medium">Password has been reset successfully!</p>
            <p className="text-sm mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input 
              label="New Password" 
              type="password" 
              placeholder="••••••••"
              {...register('password')}
              error={errors.password}
            />
            <Input 
              label="Confirm New Password" 
              type="password" 
              placeholder="••••••••"
              {...register('confirmPassword')}
              error={errors.confirmPassword}
            />
            
            <Button type="submit" className="w-full py-2.5" isLoading={isSubmitting}>
              Reset Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
