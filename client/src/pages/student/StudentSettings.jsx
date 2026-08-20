import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, getMe } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { User, Lock, Phone, Camera } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  avatar: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal(''))
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const StudentSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      avatar: '',
      password: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getMe();
        const userData = response.data;
        setAvatar(userData.avatar || null);
        reset({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          password: '',
          confirmPassword: ''
        });
      } catch (error) {
        toast.error('Failed to load profile');
      }
    };
    fetchUser();
  }, [reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        avatar: avatar,
      };
      if (data.password) {
        payload.password = data.password;
      }

      await updateProfile(payload);
      toast.success('Profile updated successfully');
      
      reset({ ...data, password: '', confirmPassword: '' });
      
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-slate-400">Update your profile information and security settings.</p>
      </div>

      <Card>
        <CardBody className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-700 pb-2">
                <User className="w-5 h-5 text-indigo-400" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  {...register('name')}
                  error={errors.name?.message}
                />
                <Input
                  label="Email Address"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-700 pb-2 mt-8">
                <Phone className="w-5 h-5 text-indigo-400" /> Contact & Media
              </h3>
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div>
                  <h3 className="font-medium text-slate-200">Profile Picture</h3>
                  <p className="text-sm text-slate-400 mb-3">JPG, GIF or PNG. Max size 2MB.</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/jpeg, image/png, image/gif" 
                    className="hidden" 
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Upload New
                  </Button>
                  {avatar && (
                    <Button type="button" variant="ghost" size="sm" className="ml-2 text-red-400 hover:text-red-300" onClick={() => setAvatar(null)}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number (Optional)"
                  placeholder="+1 (555) 000-0000"
                  {...register('phone')}
                  error={errors.phone?.message}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-700 pb-2 mt-8">
                <Lock className="w-5 h-5 text-indigo-400" /> Security
              </h3>
              <p className="text-sm text-slate-400 mb-4">Leave password fields blank if you do not want to change it.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <Button type="submit" size="lg" isLoading={isLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
