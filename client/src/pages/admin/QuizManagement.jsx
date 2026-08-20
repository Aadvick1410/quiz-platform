import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Settings, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getQuizzes, createQuiz, updateQuiz, deleteQuiz, togglePublishQuiz } from '../../api/quizzes';
import { getCategories } from '../../api/categories';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const quizSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  duration: z.string().min(1, 'Duration is required'),
  passingScore: z.string().min(1, 'Passing score is required'),
  maxAttempts: z.string().optional(),
});

export const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      difficulty: 'MEDIUM',
      duration: '30',
      passingScore: '60',
      maxAttempts: '3'
    }
  });

  const fetchData = async () => {
    try {
      const [quizzesRes, categoriesRes] = await Promise.all([
        getQuizzes(),
        getCategories()
      ]);
      setQuizzes(quizzesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        categoryId: parseInt(data.categoryId),
        duration: parseInt(data.duration),
        passingScore: parseInt(data.passingScore),
        maxAttempts: data.maxAttempts ? parseInt(data.maxAttempts) : 1
      };

      if (editingId) {
        await updateQuiz(editingId, payload);
        toast.success('Quiz updated successfully');
      } else {
        await createQuiz(payload);
        toast.success('Quiz created successfully');
      }
      
      reset();
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save quiz');
    }
  };

  const handleEdit = (quiz) => {
    setEditingId(quiz.id);
    setValue('title', quiz.title);
    setValue('description', quiz.description || '');
    setValue('categoryId', quiz.categoryId.toString());
    setValue('difficulty', quiz.difficulty);
    setValue('duration', quiz.duration.toString());
    setValue('passingScore', quiz.passingScore.toString());
    setValue('maxAttempts', quiz.maxAttempts.toString());
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await deleteQuiz(id);
      toast.success('Quiz deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
      await togglePublishQuiz(id, newStatus);
      toast.success(`Quiz ${newStatus.toLowerCase()} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Quiz Management</h1>
          <p className="text-slate-400">Create quizzes, manage questions, and publish.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); if(!showForm) {reset(); setEditingId(null);} }}>
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Create Quiz</>}
        </Button>
      </div>

      {showForm && (
        <Card className="animate-slide-up border-indigo-500/30 shadow-indigo-500/10">
          <CardBody>
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Title"
                  placeholder="Quiz title"
                  {...register('title')}
                  error={errors.title?.message}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Category</label>
                  <select 
                    {...register('categoryId')}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-sm text-red-400">{errors.categoryId.message}</p>}
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Description</label>
                  <textarea
                    {...register('description')}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                    rows="3"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Difficulty</label>
                  <select 
                    {...register('difficulty')}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <Input
                  label="Duration (minutes)"
                  type="number"
                  {...register('duration')}
                  error={errors.duration?.message}
                />

                <Input
                  label="Passing Score (%)"
                  type="number"
                  {...register('passingScore')}
                  error={errors.passingScore?.message}
                />

                <Input
                  label="Max Attempts"
                  type="number"
                  {...register('maxAttempts')}
                  error={errors.maxAttempts?.message}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg">
                  {editingId ? 'Update Quiz Details' : 'Create Quiz'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-800 rounded-xl"></div>)}
          </div>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-slate-400">No quizzes found.</p>
            </CardBody>
          </Card>
        ) : (
          quizzes.map(quiz => (
            <Card key={quiz.id} className="group">
              <CardBody className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-white text-lg">{quiz.title}</h3>
                    <Badge variant={
                      quiz.status === 'PUBLISHED' ? 'success' : 
                      quiz.status === 'DRAFT' ? 'warning' : 'default'
                    }>
                      {quiz.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5"><Settings className="w-4 h-4"/> {quiz.category?.name || 'Uncategorized'}</span>
                    <span>•</span>
                    <span>{quiz.difficulty}</span>
                    <span>•</span>
                    <span>{quiz.duration} mins</span>
                    <span>•</span>
                    <span>{quiz._count?.questions || 0} Questions</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    title={quiz.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    onClick={() => handleTogglePublish(quiz.id, quiz.status)}
                  >
                    {quiz.status === 'PUBLISHED' ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-indigo-400" />}
                  </Button>
                  
                  <Link to={`/admin/quizzes/${quiz.id}/questions`}>
                    <Button variant="ghost" size="sm" title="Manage Questions">
                      <Settings className="w-4 h-4 text-slate-300" />
                    </Button>
                  </Link>

                  <Button variant="ghost" size="sm" onClick={() => handleEdit(quiz)} title="Edit Details">
                    <Edit2 className="w-4 h-4 text-slate-300" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(quiz.id)} title="Delete Quiz">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
