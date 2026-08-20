import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAdminAttempts } from '../../api/analytics';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const AttemptsList = () => {
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const filterStatus = searchParams.get('status') || 'ALL';

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await getAdminAttempts();
        setAttempts(response.data);
      } catch (error) {
        toast.error('Failed to fetch attempts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const filteredAttempts = attempts.filter(a => filterStatus === 'ALL' || a.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Quiz Attempts</h1>
          <p className="text-slate-400">View detailed history of all student quiz attempts.</p>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setSearchParams({ status: 'ALL' })}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filterStatus === 'ALL' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-100'}`}
          >
            All
          </button>
          <button
            onClick={() => setSearchParams({ status: 'PASSED' })}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${filterStatus === 'PASSED' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-slate-100'}`}
          >
            <CheckCircle className="w-4 h-4" /> Passed
          </button>
          <button
            onClick={() => setSearchParams({ status: 'FAILED' })}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${filterStatus === 'FAILED' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-100'}`}
          >
            <XCircle className="w-4 h-4" /> Failed
          </button>
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="p-4 text-sm font-semibold text-slate-300">Student Name</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Email</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Quiz Title</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Date Attempted</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Score</th>
                  <th className="p-4 text-sm font-semibold text-slate-300 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 animate-pulse">Loading attempts...</td>
                  </tr>
                ) : filteredAttempts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">No attempts found for this filter.</td>
                  </tr>
                ) : (
                  filteredAttempts.map(attempt => (
                    <tr key={attempt.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 font-medium text-slate-200">
                        {attempt.user.name}
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {attempt.user.email}
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-200 block">{attempt.quiz.title}</span>
                        <span className="text-xs text-slate-500">{attempt.quiz.category.name}</span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {new Date(attempt.startedAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-slate-200">
                        {attempt.percentage.toFixed(0)}%
                      </td>
                      <td className="p-4 text-right">
                        <Badge variant={attempt.status === 'PASSED' ? 'success' : 'danger'}>
                          {attempt.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
