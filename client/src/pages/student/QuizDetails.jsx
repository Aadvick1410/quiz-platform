import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, Target, ArrowLeft, AlertCircle } from 'lucide-react';
import { getQuizById } from '../../api/quizzes';
import { startQuiz } from '../../api/attempts';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export const QuizDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await getQuizById(id);
        setQuiz(response.data);
      } catch (error) {
        toast.error('Failed to load quiz details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleStartQuiz = async () => {
    setIsStarting(true);
    try {
      // The backend route is `/quizzes/:quizId/start`
      const response = await startQuiz(id);
      toast.success('Quiz started! Good luck.');
      
      // Navigate to the attempt page
      navigate(`/attempt/${response.data.attemptId}`, {
        state: { 
          quiz, 
          attemptId: response.data.attemptId,
          expiresAt: response.data.expiresAt,
          questions: response.data.questions
        }
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start quiz');
      setIsStarting(false);
    }
  };

  if (isLoading) return <div className="animate-pulse p-8">Loading quiz details...</div>;
  if (!quiz) return <div className="p-8 text-center text-slate-400">Quiz not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Link to="/" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Quizzes
      </Link>

      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-900 to-slate-900 border-b border-indigo-500/20 flex items-end p-8">
          <Badge variant="primary" className="mb-[-40px] px-4 py-1 text-sm bg-indigo-600 text-white border-none shadow-lg">
            {quiz.category?.name || 'General'}
          </Badge>
        </div>
        <CardBody className="p-8 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-4">{quiz.title}</h1>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                {quiz.description || 'No description provided.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Duration</p>
                    <p className="font-bold text-white">{quiz.duration} mins</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Questions</p>
                    <p className="font-bold text-white">{quiz._count?.questions || 0}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Passing Score</p>
                    <p className="font-bold text-white">{quiz.passingScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-72 bg-slate-800/80 rounded-xl p-6 border border-slate-700 shrink-0">
              <h3 className="font-bold text-white mb-4">Quiz Rules</h3>
              <ul className="space-y-3 text-sm text-slate-300 mb-6">
                <li className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>The timer cannot be paused once started.</span>
                </li>
                <li className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Unanswered questions will receive 0 marks.</span>
                </li>
                <li className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>You have a maximum of {quiz.maxAttempts} attempts.</span>
                </li>
              </ul>
              
              {(() => {
                const isUpcoming = quiz.scheduledFor && new Date(quiz.scheduledFor) > new Date();
                return (
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleStartQuiz}
                    isLoading={isStarting}
                    disabled={isUpcoming}
                  >
                    {isUpcoming ? `Available ${new Date(quiz.scheduledFor).toLocaleString()}` : 'Start Quiz Now'}
                  </Button>
                );
              })()}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
