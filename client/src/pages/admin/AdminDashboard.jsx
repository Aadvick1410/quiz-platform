import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, XOctagon } from 'lucide-react';
import { getPlatformAnalytics } from '../../api/analytics';
import { Card, CardBody } from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await getPlatformAnalytics();
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  if (!analytics) return <div>Failed to load data</div>;

  const stats = [
    { label: 'Total Students', value: analytics.overview.totalStudents, icon: <Users className="text-blue-400" />, link: '/admin/users' },
    { label: 'Total Quizzes', value: analytics.overview.totalQuizzes, icon: <BookOpen className="text-purple-400" />, link: '/admin/quizzes' },
    { label: 'Passed Attempts', value: analytics.overview.passedAttempts, icon: <GraduationCap className="text-green-400" />, link: '/admin/attempts?status=PASSED' },
    { label: 'Failed Attempts', value: analytics.overview.failedAttempts, icon: <XOctagon className="text-red-400" />, link: '/admin/attempts?status=FAILED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400">Welcome back, Admin. Here's what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link key={i} to={stat.link} className="block">
            <Card hover>
              <CardBody className="flex items-center p-6 gap-4">
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardBody>
            <h2 className="text-lg font-bold text-white mb-6">Attempts Over Time (Last 7 Days)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.charts.attemptsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="passed" name="Passed" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="failed" name="Failed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="text-lg font-bold text-white mb-6">Most Popular Quizzes</h2>
            <div className="space-y-4">
              {analytics.charts.popularQuizzes.map((quiz, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <span className="font-medium text-slate-200">{quiz.name}</span>
                  <span className="text-sm px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                    {quiz.attempts} attempts
                  </span>
                </div>
              ))}
              {analytics.charts.popularQuizzes.length === 0 && (
                <p className="text-slate-400 text-center py-8">No quiz attempts yet.</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardBody>
            <h2 className="text-lg font-bold text-white mb-6">Recent Student Attempts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/30">
                    <th className="p-4 text-sm font-semibold text-slate-300">Student</th>
                    <th className="p-4 text-sm font-semibold text-slate-300">Quiz</th>
                    <th className="p-4 text-sm font-semibold text-slate-300">Date</th>
                    <th className="p-4 text-sm font-semibold text-slate-300">Score</th>
                    <th className="p-4 text-sm font-semibold text-slate-300 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {analytics.charts.recentStudentAttempts?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400">No recent attempts.</td>
                    </tr>
                  ) : (
                    analytics.charts.recentStudentAttempts?.map((attempt, i) => (
                      <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 font-medium text-slate-200">{attempt.studentName}</td>
                        <td className="p-4 text-slate-400">{attempt.quizName}</td>
                        <td className="p-4 text-slate-400 text-sm">
                          {new Date(attempt.date).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-medium text-slate-200">{attempt.score}%</td>
                        <td className="p-4 text-right">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            attempt.status === 'PASSED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {attempt.status}
                          </span>
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
    </div>
  );
};
