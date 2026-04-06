import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const { data } = await api.post('/auth/refresh/', { refresh });
          localStorage.setItem('access', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export const auth = {
  me: () => api.get('/auth/me/').then((r) => r.data),
  login: (username, password) =>
    api.post('/auth/login/', { username, password }).then((r) => r.data),
  register: (username, password, email) =>
    api.post('/auth/register/', { username, password, email }).then((r) => r.data),
};

export const subscriptions = {
  list: (params = {}) => api.get('/subscriptions/', { params }).then((r) => r.data),
  create: (data) => api.post('/subscriptions/', data).then((r) => r.data),
  update: (id, data) => api.patch(`/subscriptions/${id}/`, data).then((r) => r.data),
  remove: (id) => api.delete(`/subscriptions/${id}/`).then((r) => r.data),
  useToday: (id) => api.post(`/subscriptions/${id}/use-today/`).then((r) => r.data),
};

export const reminders = {
  getPreferences: () => api.get('/reminders/preferences/').then((r) => r.data),
  updatePreferences: (data) => api.patch('/reminders/preferences/', data).then((r) => r.data),
};

export const dashboard = {
  summary: () => api.get('/dashboard/summary/').then((r) => r.data),
};

export default api;
