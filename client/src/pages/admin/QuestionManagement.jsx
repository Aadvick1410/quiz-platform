import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, ArrowLeft, X } from 'lucide-react';
import { useForm as hookFormUseForm, useFieldArray as hookFormUseFieldArray } from 'react-hook-form';

import { getQuizById } from '../../api/quizzes';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../../api/questions';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';

const questionSchema = z.object({
  questionText: z.string().min(5, 'Question text must be at least 5 characters'),
  marks: z.string().min(1, 'Marks are required'),
  explanation: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  options: z.array(z.object({
    optionText: z.string().min(1, 'Option text is required'),
    isCorrect: z.boolean().optional(),
  })).min(2, 'At least 2 options required')
});

export const QuestionManagement = () => {
  const { id: quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = hookFormUseForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      marks: '1',
      difficulty: 'MEDIUM',
      options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
      ]
    }
  });

  const { fields, append, remove } = hookFormUseFieldArray({
    control,
    name: 'options'
  });

  const watchOptions = watch('options');

  const fetchData = async () => {
    try {
      const [quizRes, questionsRes] = await Promise.all([
        getQuizById(quizId),
        getQuestions(quizId)
      ]);
      setQuiz(quizRes.data);
      setQuestions(questionsRes.data);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const handleCorrectOptionChange = (index) => {
    // We want only one correct option.
    const currentOptions = [...watchOptions];
    currentOptions.forEach((opt, i) => {
      setValue(`options.${i}.isCorrect`, i === index);
    });
  };

  const onSubmit = async (data) => {
    // Validate that exactly one option is correct
    const correctCount = data.options.filter(o => o.isCorrect).length;
    if (correctCount !== 1) {
      toast.error('Please mark exactly one option as correct');
      return;
    }

    try {
      const payload = {
        ...data,
        marks: parseInt(data.marks),
      };

      if (editingId) {
        await updateQuestion(editingId, payload);
        toast.success('Question updated successfully');
      } else {
        await createQuestion(quizId, payload);
        toast.success('Question created successfully');
      }
      
      reset();
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save question');
    }
  };

  const handleEdit = (question) => {
    setEditingId(question.id);
    setValue('questionText', question.questionText);
    setValue('marks', question.marks.toString());
    setValue('explanation', question.explanation || '');
    setValue('difficulty', question.difficulty || 'MEDIUM');
    setValue('options', question.options);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuestion(id);
      toast.success('Question deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  if (isLoading) return <div className="animate-pulse p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/admin/quizzes" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Quizzes
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">
            Questions for: {quiz?.title}
          </h1>
          <p className="text-slate-400">Total {questions.length} questions</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); if(!showForm) {reset(); setEditingId(null);} }}>
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Question</>}
        </Button>
      </div>

      {showForm && (
        <Card className="animate-slide-up border-indigo-500/30">
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Question Text</label>
                  <textarea
                    {...register('questionText')}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 min-h-[100px]"
                    placeholder="Enter your question here..."
                  />
                  {errors.questionText && <p className="text-sm text-red-400">{errors.questionText.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Marks"
                    type="number"
                    {...register('marks')}
                    error={errors.marks?.message}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Difficulty</label>
                    <select 
                      {...register('difficulty')}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Explanation (Optional)</label>
                  <textarea
                    {...register('explanation')}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="Explanation shown after attempt..."
                    rows="2"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Options</h3>
                  <Button type="button" variant="ghost" size="sm" onClick={() => append({ optionText: '', isCorrect: false })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Option
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-4">
                      <div className="pt-3">
                        <input
                          type="radio"
                          name="correctOption"
                          className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500"
                          checked={watchOptions?.[index]?.isCorrect || false}
                          onChange={() => handleCorrectOptionChange(index)}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          {...register(`options.${index}.optionText`)}
                          error={errors.options?.[index]?.optionText?.message}
                        />
                      </div>
                      <div className="pt-1">
                        {fields.length > 2 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                            <X className="w-4 h-4 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {errors.options?.message && <p className="text-sm text-red-400">{errors.options.message}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-700/50">
                <Button type="submit" size="lg">
                  {editingId ? 'Update Question' : 'Save Question'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-slate-400">No questions added yet. Create the first one!</p>
            </CardBody>
          </Card>
        ) : (
          questions.map((question, qIndex) => (
            <Card key={question.id}>
              <CardBody className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-white text-lg">
                    <span className="text-indigo-400 mr-2">Q{qIndex + 1}.</span>
                    {question.questionText}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400 bg-slate-800 px-2 py-1 rounded">
                      {question.marks} Marks
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(question)}>
                      <Edit2 className="w-4 h-4 text-indigo-400" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(question.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {question.options.map((option, oIndex) => (
                    <div 
                      key={option.id} 
                      className={`p-3 rounded-lg border ${
                        option.isCorrect 
                          ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + oIndex)}.
                      </span>
                      {option.optionText}
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <div className="mt-4 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-sm">
                    <span className="font-semibold text-indigo-300">Explanation: </span>
                    <span className="text-slate-300">{question.explanation}</span>
                  </div>
                )}
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
