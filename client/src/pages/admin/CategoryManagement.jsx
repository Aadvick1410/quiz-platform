import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

export const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
  });

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await updateCategory(editingId, data);
        toast.success('Category updated successfully');
      } else {
        await createCategory(data);
        toast.success('Category created successfully');
      }
      reset();
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setValue('name', category.name);
    setValue('description', category.description || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Category Management</h1>
        <p className="text-slate-400">Create and manage quiz categories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardBody>
              <h2 className="text-lg font-bold text-white mb-4">
                {editingId ? 'Edit Category' : 'Create Category'}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Name"
                  placeholder="e.g. Mathematics"
                  {...register('name')}
                  error={errors.name?.message}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Description</label>
                  <textarea
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all min-h-[100px]"
                    placeholder="Category description..."
                    {...register('description')}
                  />
                  {errors.description && <p className="text-sm text-red-400">{errors.description.message}</p>}
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="ghost" onClick={cancelEdit}>
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-20 bg-slate-800 rounded"></div>
                <div className="h-20 bg-slate-800 rounded"></div>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <Card>
              <CardBody className="text-center py-8">
                <p className="text-slate-400">No categories found. Create one to get started.</p>
              </CardBody>
            </Card>
          ) : (
            categories.map(category => (
              <Card key={category.id} className="group">
                <CardBody className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-slate-400 mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                      <Edit2 className="w-4 h-4 text-indigo-400" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
