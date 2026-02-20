import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const auth = localStorage.getItem('auth');
  if (auth) {
    try {
      const { authenticated } = JSON.parse(auth);
      if (authenticated) {
        config.headers['X-Authenticated'] = 'true';
      }
    } catch (e) {
      // ignore
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export { apiClient };
