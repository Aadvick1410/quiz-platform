import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { getLeaderboard } from '../api/leaderboard';
import { getCategories } from '../api/categories';
import { Card, CardBody } from '../components/ui/Card';

export const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await getLeaderboard(selectedCategory);
        setLeaders(response.data);
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedCategory]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-indigo-900/40 to-slate-900/40 p-8 rounded-3xl border border-slate-700/50">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Top Performers
          </h1>
          <p className="text-slate-300 mt-2">Check out the highest scoring students on the platform.</p>
        </div>
        
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-auto px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
          >
            <option value="">Overall Leaderboard</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="p-4 pl-6 text-sm font-semibold text-slate-300 w-24">Rank</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Student</th>
                  <th className="p-4 text-sm font-semibold text-slate-300 text-center">Quizzes Passed</th>
                  <th className="p-4 pr-6 text-sm font-semibold text-slate-300 text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400 animate-pulse">Loading rankings...</td>
                  </tr>
                ) : leaders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400">No attempts found for this category yet.</td>
                  </tr>
                ) : (
                  leaders.map((leader, index) => {
                    const rank = index + 1;
                    return (
                      <tr key={leader.user.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex justify-center items-center w-8 h-8 rounded-full font-bold">
                            {rank === 1 ? <Trophy className="w-6 h-6 text-yellow-400" /> :
                             rank === 2 ? <Medal className="w-6 h-6 text-slate-300" /> :
                             rank === 3 ? <Medal className="w-6 h-6 text-amber-600" /> :
                             <span className="text-slate-400">{rank}</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold ${
                              rank === 1 ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                              rank === 2 ? 'bg-slate-300/20 border-slate-300/30 text-slate-300' :
                              rank === 3 ? 'bg-amber-600/20 border-amber-600/30 text-amber-500' :
                              'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                            }`}>
                              {leader.user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`font-medium ${rank <= 3 ? 'text-white' : 'text-slate-200'}`}>
                              {leader.user.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center text-slate-300 font-medium">
                          {leader.quizzesPassed}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <span className={`text-lg font-bold ${
                            leader.averageScore >= 80 ? 'text-green-400' :
                            leader.averageScore >= 60 ? 'text-yellow-400' : 'text-slate-200'
                          }`}>
                            {leader.averageScore.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
