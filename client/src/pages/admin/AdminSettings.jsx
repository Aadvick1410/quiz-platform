import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axios';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, Camera } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().optional(),
});

export const AdminSettings = () => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: '',
    }
  });

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

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const payload = { ...data, avatar };
      if (!payload.password) delete payload.password;
      
      await api.put('/auth/profile', payload);
      toast.success('Profile updated successfully');
      window.location.reload(); 
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-slate-400">Manage your profile details and security.</p>
      </div>

      <Card>
        <CardBody className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-700/50 pb-4 mb-6">Profile Information</h2>
            
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                icon={<User className="w-5 h-5 text-slate-400" />}
                {...register('name')}
                error={errors.name?.message}
              />
              
              <Input
                label="Email Address"
                type="email"
                icon={<Mail className="w-5 h-5 text-slate-400" />}
                {...register('email')}
                error={errors.email?.message}
              />
              
              <Input
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                icon={<Phone className="w-5 h-5 text-slate-400" />}
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>

            <h2 className="text-lg font-bold text-white border-b border-slate-700/50 pb-4 mt-8 mb-6">Security</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="New Password"
                type="password"
                placeholder="Leave blank to keep current"
                icon={<Lock className="w-5 h-5 text-slate-400" />}
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <div className="flex justify-end pt-6">
              <Button type="submit" isLoading={isSaving} className="px-8">
                Save Changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
