import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Calendar, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      toast.success('Welcome back! 👋');
      const fromPath = location.state?.from?.pathname || location.state?.from || '';
      if (!fromPath || fromPath === '/dashboard' || fromPath === '/') {
        if (user.role === 'admin') navigate('/admin', { replace: true });
        else if (user.role === 'organizer') navigate('/organizer', { replace: true });
        else navigate('/dashboard', { replace: true });
      } else {
        navigate(fromPath, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex-grow flex min-h-[calc(100vh-64px)]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-mesh-dark relative overflow-hidden items-center justify-center noise">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/15 rounded-full blur-[60px]" />
        <div className="relative z-10 text-center px-12">
          <div className="inline-flex items-center gap-2.5 mb-8">
            <div className="bg-gradient-primary p-2.5 rounded-xl shadow-glow">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Event<span className="text-primary">io</span></span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Your next great<br />experience awaits
          </h2>
          <p className="text-white/50 text-lg leading-relaxed max-w-sm mx-auto">
            Discover, register, and check in to world-class events — all in one place.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            {['Conferences', 'Workshops', 'Concerts', 'Networking'].map(t => (
              <span key={t} className="bg-white/10 border border-white/10 text-white/70 text-xs font-medium px-4 py-2 rounded-full backdrop-blur-sm">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="bg-primary p-2 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Event<span className="text-primary">io</span></span>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome back</h1>
              <p className="text-textMuted">Sign in to manage your events and tickets</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="you@example.com"
                {...register('email')}
                error={errors.email}
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••"
                {...register('password')}
                error={errors.password}
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                  Forgot password?
                </Link>
              </div>
              
              <Button type="submit" className="w-full py-3.5 rounded-xl text-base mt-2" isLoading={isSubmitting}>
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-textMuted font-medium">New to Eventio?</span></div>
            </div>

            <Link to="/register">
              <button className="w-full py-3 border-2 border-slate-100 rounded-xl text-sm font-semibold text-slate-700 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
                Create an account
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
