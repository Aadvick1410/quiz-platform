import { api } from './axios';

export const getQuizzes = (params) => api.get('/quizzes', { params });
export const getQuizById = (id) => api.get(`/quizzes/${id}`);
export const createQuiz = (data) => api.post('/quizzes', data);
export const updateQuiz = (id, data) => api.put(`/quizzes/${id}`, data);
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`);
export const togglePublishQuiz = (id, status) => api.patch(`/quizzes/${id}/publish`, { status });
