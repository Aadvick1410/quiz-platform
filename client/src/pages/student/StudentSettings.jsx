import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, getMe } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { User, Lock, Phone, Image as ImageIcon } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
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
        reset({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          avatar: userData.avatar || '',
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
        avatar: data.avatar || null,
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number (Optional)"
                  placeholder="+1 (555) 000-0000"
                  {...register('phone')}
                  error={errors.phone?.message}
                />
                <Input
                  label="Profile Picture URL (Optional)"
                  placeholder="https://example.com/avatar.jpg"
                  {...register('avatar')}
                  error={errors.avatar?.message}
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
