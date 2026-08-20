import { api } from './axios';

export const getLeaderboard = (categoryId) => {
  const params = categoryId ? { category: categoryId } : {};
  return api.get('/leaderboard', { params });
};
