import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Profile state
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  
  // Preferences state
  const [prefs, setPrefs] = useState({
    emailReminders: true,
    emailUpdates: true,
    emailNewRegistrations: true,
    inAppEnabled: true,
  });

  // Badges state
  const [badges, setBadges] = useState([]);
  const [earnedBadgeKeys, setEarnedBadgeKeys] = useState([]);

  useEffect(() => {
    // Fetch current user from /me to get latest preferences
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        if (res.data.data.notificationPreferences) {
          setPrefs(res.data.data.notificationPreferences);
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };
    
    const fetchBadges = async () => {
      try {
        const res = await axiosInstance.get('/auth/badges');
        setBadges(res.data.data.allBadges || []);
        setEarnedBadgeKeys(res.data.data.earnedBadges?.map(b => b.badgeKey) || []);
      } catch (err) {
        console.error('Failed to fetch badges', err);
      }
    };

    fetchUser();
    fetchBadges();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axiosInstance.put('/auth/profile', { name, phone, avatarUrl });
      updateUser(res.data.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePrefsChange = async (e) => {
    const { name, checked } = e.target;
    const newPrefs = { ...prefs, [name]: checked };
    setPrefs(newPrefs);
    
    try {
      await axiosInstance.patch('/auth/notification-preferences', { [name]: checked });
      toast.success('Preferences updated');
    } catch (err) {
      toast.error('Failed to update preferences');
      setPrefs(prefs); // revert
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);
    formData.append('eventId', 'temp'); // Workaround for existing upload logic if it requires eventId, or we need a profile upload route.
    // Wait, the current uploadMedia in gallery requires eventId. 
    // Since we don't have a dedicated avatar upload endpoint, we will just simulate it or use a placeholder if we don't build one.
    // For now, let's keep it as a text input for URL or implement a dedicated route.
    // I will use an external placeholder for simplicity in this MVP unless we build the endpoint.
    toast.error('Avatar upload endpoint requires implementation. Please use a URL for now.');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-text mb-8">Profile Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* Profile Form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-soft">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-3xl font-bold ring-4 ring-white shadow-sm">
                      {name.charAt(0)}
                    </div>
                  )}
                  {/* Avatar Upload (Mocked for now) */}
                  <label className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-slate-100 cursor-pointer text-slate-500 hover:text-primary transition-colors hover:-translate-y-0.5">
                    <Camera className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-medium text-textMuted">Email Address</p>
                  <p className="text-slate-900 font-bold">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Full Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
                <Input 
                  label="Phone Number" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <Input 
                label="Avatar URL (Optional)" 
                value={avatarUrl} 
                onChange={(e) => setAvatarUrl(e.target.value)} 
                placeholder="https://..."
              />
              
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" isLoading={loading}>Save Changes</Button>
              </div>
            </form>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-soft">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-bold text-slate-900">Event Reminders (Email)</p>
                  <p className="text-sm text-textMuted">Receive 24-hour and 1-hour reminders before your events.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="emailReminders" className="sr-only peer" checked={prefs.emailReminders} onChange={handlePrefsChange} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-bold text-slate-900">Event Updates (Email)</p>
                  <p className="text-sm text-textMuted">Get notified when an event you're attending is updated or cancelled.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="emailUpdates" className="sr-only peer" checked={prefs.emailUpdates} onChange={handlePrefsChange} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {user.role !== 'user' && (
                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">New Registrations (Email)</p>
                    <p className="text-sm text-textMuted">Receive an email every time someone registers for your event.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="emailNewRegistrations" className="sr-only peer" checked={prefs.emailNewRegistrations} onChange={handlePrefsChange} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-soft">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Your Badges</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {badges.map(badge => {
                const isEarned = earnedBadgeKeys.includes(badge.key);
                return (
                  <div 
                    key={badge.key} 
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 transition-all ${
                      isEarned ? 'bg-primary/5 shadow-sm scale-100' : 'bg-slate-50 opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <p className="font-bold text-sm text-center text-slate-900 mb-1 leading-tight">{badge.label}</p>
                    <p className="text-xs text-center text-textMuted leading-snug">{badge.description}</p>
                  </div>
                );
              })}
            </div>
            {badges.length === 0 && <p className="text-textMuted text-sm">No badges available.</p>}
          </div>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <h3 className="font-bold text-primary mb-2">Security Notice</h3>
            <p className="text-sm text-primary/80">To change your email address or password, please log out and use the forgot password flow, or contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
