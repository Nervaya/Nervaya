import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    // Return only data (or the full response depending on preference, but usually consistent with ApiResponse)
    return response.data;
  },
  (error: unknown) => {
    // Handle global errors if needed, e.g. token expiration redirect
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { status?: number; data?: unknown };
      };
      if (axiosError.response?.status === 401) {
        // Optional: Redirect to login or clear auth state
        if (typeof window !== 'undefined') {
          localStorage.removeItem('isLoggedIn');
          window.dispatchEvent(new CustomEvent('auth-state-changed'));
          // Avoid infinite reload loops by checking current path
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
      }
      return Promise.reject(axiosError.response?.data || error);
    }
    return Promise.reject(error);
  },
);

export default api;
