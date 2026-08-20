import React, { useState, useEffect } from 'react';
import { getPlatformAnalytics } from '../../api/analytics';
import { Card, CardBody } from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const AdminAnalytics = () => {
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

  if (isLoading) return <div className="animate-pulse">Loading analytics...</div>;
  if (!analytics) return <div>Failed to load data</div>;

  const pieData = [
    { name: 'Passed', value: analytics.overview.passedAttempts },
    { name: 'Failed', value: analytics.overview.failedAttempts },
  ];
  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Platform Analytics</h1>
        <p className="text-slate-400">Deep dive into user performance and engagement metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="p-6 text-center">
            <h3 className="text-sm font-medium text-slate-400 mb-2">Average Score</h3>
            <p className="text-4xl font-bold text-indigo-400">{analytics.overview.averageScore}%</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-6 text-center">
            <h3 className="text-sm font-medium text-slate-400 mb-2">Overall Pass Rate</h3>
            <p className="text-4xl font-bold text-green-400">{analytics.overview.passRate}%</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-6 text-center">
            <h3 className="text-sm font-medium text-slate-400 mb-2">Total Questions</h3>
            <p className="text-4xl font-bold text-purple-400">{analytics.overview.totalQuestions}</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <h2 className="text-lg font-bold text-white mb-6">Attempts Over Time (Last 7 Days)</h2>
            <div className="h-[350px] w-full">
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
            <h2 className="text-lg font-bold text-white mb-6">Pass vs Fail Ratio</h2>
            <div className="h-[350px] w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <h2 className="text-lg font-bold text-white mb-6">Most Popular Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.charts.popularQuizzes.map((quiz, i) => (
              <div key={i} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 flex flex-col justify-between">
                <span className="font-bold text-slate-200 mb-4 truncate" title={quiz.name}>{quiz.name}</span>
                <div className="flex justify-between items-end">
                  <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Total Attempts</span>
                  <span className="text-2xl font-bold text-indigo-400">{quiz.attempts}</span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
