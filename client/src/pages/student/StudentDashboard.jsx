import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getMyAttempts } from '../../api/attempts';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const StudentDashboard = () => {
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await getMyAttempts();
        setAttempts(response.data);
      } catch (error) {
        console.error('Failed to load attempts', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  if (isLoading) return <div className="animate-pulse p-8">Loading dashboard...</div>;

  const passedCount = attempts.filter(a => a.status === 'PASSED').length;
  const averageScore = attempts.length > 0
    ? attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">My Learning Dashboard</h1>
        <p className="text-slate-400">Track your progress and review past quiz attempts.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-sm text-slate-400 font-medium mb-1">Attempted</p>
            <p className="text-2xl font-bold text-white">{attempts.length}</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-sm text-slate-400 font-medium mb-1">Avg Score</p>
            <p className="text-2xl font-bold text-indigo-400">{averageScore.toFixed(0)}%</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-sm text-slate-400 font-medium mb-1">Highest</p>
            <p className="text-2xl font-bold text-yellow-400">
              {attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)).toFixed(0) : 0}%
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-sm text-slate-400 font-medium mb-1">Passed</p>
            <p className="text-2xl font-bold text-green-400">{passedCount}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-sm text-slate-400 font-medium mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-400">{attempts.length - passedCount}</p>
          </CardBody>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="grid grid-cols-1 gap-4">
          {attempts.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <p className="text-slate-400 mb-4">You haven't taken any quizzes yet.</p>
                <Link to="/">
                  <Button>Explore Quizzes</Button>
                </Link>
              </CardBody>
            </Card>
          ) : (
            attempts.map(attempt => (
              <Card key={attempt.id} hover>
                <CardBody className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white text-lg">{attempt.quiz.title}</h3>
                      <Badge variant={
                        attempt.status === 'PASSED' ? 'success' : 
                        attempt.status === 'FAILED' ? 'danger' : 'warning'
                      }>
                        {attempt.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{attempt.quiz.category.name}</span>
                      <span>•</span>
                      <span>{new Date(attempt.startedAt).toLocaleDateString()}</span>
                      {attempt.completedAt && (
                        <>
                          <span>•</span>
                          <span>Time: {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 self-end md:self-auto">
                    <div className="text-right">
                      <p className="text-sm text-slate-400 font-medium">Score</p>
                      <p className={`text-xl font-bold ${
                        attempt.status === 'PASSED' ? 'text-green-400' : 'text-slate-200'
                      }`}>
                        {attempt.percentage.toFixed(0)}%
                      </p>
                    </div>
                    
                    {attempt.status !== 'IN_PROGRESS' && (
                      <Link to={`/result/${attempt.id}`}>
                        <Button variant="secondary">View Details</Button>
                      </Link>
                    )}
                    {attempt.status === 'IN_PROGRESS' && (
                      <Link to={`/attempt/${attempt.quizId}`}>
                        <Button>Resume</Button>
                      </Link>
                    )}
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
