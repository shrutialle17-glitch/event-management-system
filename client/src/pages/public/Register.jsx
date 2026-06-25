import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Calendar, Users, Mic, ArrowRight } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'organizer']),
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'user' }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      const user = await registerUser(data.name, data.email, data.password, data.role);
      toast.success('Account created! Welcome to Eventio 🎉');
      if (user.role === 'organizer') navigate('/organizer', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex-grow flex min-h-[calc(100vh-64px)]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-mesh-dark relative overflow-hidden items-center justify-center noise">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-accent/15 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[60px]" />
        <div className="relative z-10 text-center px-12">
          <div className="inline-flex items-center gap-2.5 mb-8">
            <div className="bg-gradient-primary p-2.5 rounded-xl shadow-glow">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Event<span className="text-primary">io</span></span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Join thousands of<br />event enthusiasts
          </h2>
          <p className="text-white/50 text-lg leading-relaxed max-w-sm mx-auto">
            Whether you want to attend world-class events or host your own, Eventio has you covered.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 max-w-xs mx-auto">
            {[
              { icon: <Users className="w-4 h-4" />, label: 'Attend Events', desc: 'Discover & register' },
              { icon: <Mic className="w-4 h-4" />, label: 'Host Events', desc: 'Create & manage' },
            ].map(item => (
              <div key={item.label} className="bg-white/8 border border-white/10 rounded-2xl p-4 text-left backdrop-blur-sm">
                <div className="text-primary mb-2">{item.icon}</div>
                <p className="text-white text-sm font-semibold">{item.label}</p>
                <p className="text-white/40 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="bg-gradient-primary p-2 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Event<span className="text-primary">io</span></span>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-100">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Create account</h1>
              <p className="text-textMuted">Join Eventio to discover or host amazing events</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input label="Full Name" type="text" placeholder="Jane Doe" {...register('name')} error={errors.name} />
              <Input label="Email Address" type="email" placeholder="you@example.com" {...register('email')} error={errors.email} />
              <Input label="Password" type="password" placeholder="Min. 6 characters" {...register('password')} error={errors.password} />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">I want to...</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'user',      label: 'Attend Events',  icon: <Users className="w-5 h-5" />,    desc: 'Discover & register' },
                    { val: 'organizer', label: 'Host Events',    icon: <Mic className="w-5 h-5" />,      desc: 'Create & manage' },
                  ].map(opt => (
                    <label key={opt.val} className="cursor-pointer relative">
                      <input type="radio" value={opt.val} className="sr-only peer" {...register('role')} />
                      <div className={`p-4 border-2 rounded-2xl transition-all duration-200 text-center
                        ${selectedRole === opt.val 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                      >
                        <div className={`flex justify-center mb-2 ${selectedRole === opt.val ? 'text-primary' : 'text-slate-400'}`}>
                          {opt.icon}
                        </div>
                        <span className={`font-semibold block text-sm ${selectedRole === opt.val ? 'text-primary' : 'text-slate-700'}`}>{opt.label}</span>
                        <span className="text-xs text-textMuted">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.role && <span className="text-xs text-red-500">{errors.role.message}</span>}
              </div>

              <Button type="submit" className="w-full py-3.5 rounded-xl text-base mt-2" isLoading={isSubmitting}>
                Create Account <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-textMuted font-medium">Already have an account?</span></div>
            </div>

            <Link to="/login">
              <button className="w-full py-3 border-2 border-slate-100 rounded-xl text-sm font-semibold text-slate-700 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
                Sign in instead
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
