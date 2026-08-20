import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Clock, Award, BarChart, Settings } from 'lucide-react';
import { getQuizzes } from '../api/quizzes';
import { getCategories } from '../api/categories';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await getCategories();
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedDifficulty) params.difficulty = selectedDifficulty;

        const response = await getQuizzes(params);
        setQuizzes(response.data);
      } catch (error) {
        console.error('Failed to load quizzes', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchQuizzes();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory, selectedDifficulty]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden glass border border-slate-700/50 p-8 md:p-12 text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/40 to-slate-900/40 -z-10"></div>
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Test Your Knowledge with <span className="text-gradient">QuizMaster</span>
          </h1>
          <p className="text-lg text-slate-300">
            Challenge yourself with premium quizzes across various topics. Improve your skills, earn high scores, and climb the leaderboard.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 min-w-[140px]"
          >
            <option value="">All Levels</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Quiz Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-slate-800/50 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl">
          <p className="text-xl text-slate-400">No quizzes found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => {
            const isUpcoming = quiz.scheduledFor && new Date(quiz.scheduledFor) > new Date();
            
            return (
              <Card key={quiz.id} hover={!isUpcoming} className={`flex flex-col h-full ${!isUpcoming ? 'cursor-pointer' : 'opacity-70 cursor-not-allowed'}`} onClick={() => !isUpcoming && navigate(`/quizzes/${quiz.id}`)}>
                <CardBody className="flex flex-col h-full p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="primary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      {quiz.category?.name || 'General'}
                    </Badge>
                    {isUpcoming ? (
                      <Badge variant="default" className="bg-indigo-900 text-indigo-100 border-indigo-500">
                        Starts {new Date(quiz.scheduledFor).toLocaleString()}
                      </Badge>
                    ) : (
                      <Badge variant={
                        quiz.difficulty === 'HARD' ? 'danger' : 
                        quiz.difficulty === 'MEDIUM' ? 'warning' : 'success'
                      }>
                        {quiz.difficulty}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 flex-1">
                    {quiz.title} {isUpcoming && '(Upcoming)'}
                  </h3>
                  
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                    {quiz.description || 'No description provided.'}
                  </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 mt-auto pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{quiz.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>{quiz._count?.questions || 0} Qs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span>{quiz.passingScore}% Pass</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-slate-400" />
                    <span>{quiz.maxAttempts} Tries</span>
                  </div>
                </div>
              </CardBody>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
