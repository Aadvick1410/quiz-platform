import { api } from './axios';

export const getPlatformAnalytics = () => api.get('/admin/analytics');
export const getAdminAttempts = () => api.get('/admin/attempts');
export const getAdminAttemptById = (id) => api.get(`/admin/attempts/${id}`);
