import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, ArrowRight, LayoutDashboard, AlertCircle, Award } from 'lucide-react';
import { getAttemptById } from '../../api/attempts';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';

export const QuizResult = () => {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const response = await getAttemptById(id);
        setAttempt(response.data);
      } catch (error) {
        console.error('Failed to load result', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttempt();
  }, [id]);

  if (isLoading) return <div className="animate-pulse p-8 text-center text-slate-400">Loading results...</div>;
  if (!attempt) return <div className="p-8 text-center text-slate-400">Result not found.</div>;

  const isPassed = attempt.status === 'PASSED';
  const { quiz, answers } = attempt;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="text-center space-y-4 mb-12">
        <div className={`inline-flex p-4 rounded-full mb-4 ${
          isPassed ? 'bg-green-100 text-green-600 border border-green-300 shadow-[0_0_30px_rgba(34,197,94,0.2)]' 
                   : 'bg-red-100 text-red-600 border border-red-300 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
        }`}>
          {isPassed ? <Award className="w-16 h-16" /> : <XCircle className="w-16 h-16" />}
        </div>
        <h1 className="text-4xl font-bold text-white">
          {isPassed ? 'Congratulations!' : 'Keep Practicing!'}
        </h1>
        <p className="text-xl text-slate-300">
          You scored <span className={`font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
            {attempt.percentage.toFixed(1)}%
          </span> on {quiz.title}
        </p>
        <p className="text-slate-400">
          Passing score is {quiz.passingScore}%
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-6 text-center">
            <p className="text-sm text-slate-400 font-medium mb-1">Score</p>
            <p className="text-2xl font-bold text-white">{attempt.score}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-6 text-center">
            <p className="text-sm text-slate-400 font-medium mb-1">Correct</p>
            <p className="text-2xl font-bold text-green-600">{attempt.correctAnswers}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-6 text-center">
            <p className="text-sm text-slate-400 font-medium mb-1">Incorrect</p>
            <p className="text-2xl font-bold text-red-600">{attempt.incorrectAnswers}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-6 text-center">
            <p className="text-sm text-slate-400 font-medium mb-1">Time Taken</p>
            <p className="text-2xl font-bold text-slate-200">
              {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Link to="/dashboard">
          <Button variant="secondary" size="lg">
            <LayoutDashboard className="w-5 h-5 mr-2" />
            My Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button size="lg">
            More Quizzes
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Detailed Review</h2>
        <div className="space-y-6">
          {quiz.questions.map((question, idx) => {
            const userAnswer = answers.find(a => a.questionId === question.id);
            const isCorrect = userAnswer?.isCorrect;
            const isUnanswered = !userAnswer || !userAnswer.selectedOptionId;

            return (
              <Card key={question.id} className={
                isCorrect ? 'border-l-4 border-l-green-500' : 
                isUnanswered ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-red-500'
              }>
                <CardBody className="p-6">
                  <div className="flex gap-4 items-start mb-6">
                    <div className="shrink-0 mt-1">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : isUnanswered ? (
                        <AlertCircle className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white mb-1">
                        <span className="text-slate-400 mr-2">Q{idx + 1}.</span>
                        {question.questionText}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {question.marks} Marks • {isCorrect ? 'Earned' : 'Missed'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-10">
                    {question.options.map(option => {
                      const isUserSelected = userAnswer?.selectedOptionId === option.id;
                      const isOptionCorrect = option.isCorrect;

                      let borderClass = 'border-slate-700 bg-slate-800';
                      let textClass = 'text-slate-200';

                      if (isOptionCorrect) {
                        borderClass = 'border-green-400 bg-green-100 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
                        textClass = 'text-green-800 font-bold';
                      } else if (isUserSelected && !isOptionCorrect) {
                        borderClass = 'border-red-300 bg-red-50 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
                        textClass = 'text-red-700 line-through opacity-80';
                      }

                      return (
                        <div key={option.id} className={`p-4 rounded-xl border flex justify-between items-center ${borderClass}`}>
                          <span className={textClass}>{option.optionText}</span>
                          {isOptionCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                          {isUserSelected && !isOptionCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="mt-6 pl-10">
                      <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <h4 className="text-sm font-semibold text-indigo-400 mb-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5" /> Explanation
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
