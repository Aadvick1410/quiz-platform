import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { submitQuiz } from '../../api/attempts';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import toast from 'react-hot-toast';

export const QuizAttempt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: quizId } = useParams();
  
  // Try to get data from location state (set in QuizDetails)
  const state = location.state;
  
  // State for quiz logic
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!state) return; // Wait for redirect if no state

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expires = new Date(state.expiresAt).getTime();
      const diff = Math.floor((expires - now) / 1000);
      return diff > 0 ? diff : 0;
    };

    setTimeLeft(calculateTimeLeft());

    timerRef.current = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [state]);

  if (!state) {
    // If accessed directly without state, redirect to details
    return <Navigate to={`/quizzes/${quizId}`} replace />;
  }

  const { quiz, attemptId, questions } = state;
  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleManualSubmit = async () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to submit your quiz?')) {
        return;
      }
    }
    
    await submit();
  };

  const handleAutoSubmit = async () => {
    toast('Time is up! Submitting quiz automatically.', { icon: '⏳' });
    await submit();
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, oId]) => ({
        questionId: parseInt(qId),
        selectedOptionId: oId
      }));

      // Add null for unanswered questions
      questions.forEach(q => {
        if (!answers[q.id]) {
          formattedAnswers.push({ questionId: q.id, selectedOptionId: null });
        }
      });

      const response = await submitQuiz(quizId, {
        attemptId,
        answers: formattedAnswers
      });
      
      toast.success('Quiz submitted successfully!');
      navigate(`/result/${response.data.result.id}`, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit quiz');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col fixed inset-0 z-[100]">
      {/* Top Bar */}
      <header className="glass border-b border-slate-700/50 p-4 shrink-0 flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl font-bold text-white hidden sm:block">{quiz.title}</h1>
          <p className="text-sm text-slate-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold ${
          timeLeft < 60 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 border border-slate-700 text-indigo-400'
        }`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
        
        <Button 
          variant="danger" 
          onClick={handleManualSubmit}
          isLoading={isSubmitting}
          className="hidden sm:inline-flex"
        >
          Submit Quiz
        </Button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 glass border-r border-slate-700/50 hidden lg:flex flex-col p-4 shrink-0 overflow-y-auto">
          <h3 className="font-semibold text-slate-300 mb-4 uppercase text-sm tracking-wider">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = currentQuestionIndex === idx;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    isCurrent 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900'
                      : isAnswered 
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 space-y-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-indigo-500/20 border border-indigo-500/30"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700"></div>
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-indigo-600"></div>
              <span>Current</span>
            </div>
          </div>
        </aside>

        {/* Question Area */}
        <main className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto relative z-0">
          <div className="max-w-3xl w-full mx-auto animate-fade-in flex-1">
            
            <div className="mb-8">
              <div className="flex justify-between items-start mb-4">
                <span className="text-indigo-400 font-medium">Question {currentQuestionIndex + 1}</span>
                <span className="text-slate-400 text-sm bg-slate-800 px-3 py-1 rounded-full">
                  {currentQuestion.marks} {currentQuestion.marks === 1 ? 'Mark' : 'Marks'}
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-white leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </div>

            <div className="space-y-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-indigo-500' : 'border-slate-500 group-hover:border-slate-400'
                    }`}>
                      {isSelected && <div className="w-3 h-3 rounded-full bg-indigo-500 animate-fade-in" />}
                    </div>
                    <div className="flex-1">
                      <span className="text-slate-400 font-medium mr-3">{String.fromCharCode(65 + idx)}.</span>
                      <span className={isSelected ? 'text-indigo-100 font-medium' : 'text-slate-300'}>
                        {option.optionText}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Bottom Navigation */}
          <div className="max-w-3xl w-full mx-auto mt-8 flex justify-between items-center pt-6 border-t border-slate-700/50">
            <Button 
              variant="secondary" 
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={isFirstQuestion}
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Previous
            </Button>
            
            <Button 
              variant="secondary" className="sm:hidden"
              onClick={handleManualSubmit}
              isLoading={isSubmitting}
            >
              Submit
            </Button>
            
            <Button 
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={isLastQuestion}
            >
              Next <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};
