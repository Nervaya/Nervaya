import axios from 'axios';
import { AUTH_API } from '@/lib/constants/api.constants';
import { AUTH_STORAGE_KEYS } from '@/utils/cookieConstants';
import { isProtectedPath, ROUTES } from '@/utils/routesConstants';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

function clearAuthStorageOnClient() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_USER);
  localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_EXPIRES_AT);
  localStorage.removeItem(AUTH_STORAGE_KEYS.IS_LOGGED_IN);
  window.dispatchEvent(new CustomEvent('auth-state-changed'));
}

api.interceptors.response.use(
  (response) => response.data,
  (error: unknown) => {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { status?: number; data?: unknown };
      };
      if (axiosError.response?.status === 401) {
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          const isAuthPage = pathname.startsWith(ROUTES.LOGIN) || pathname.startsWith(ROUTES.SIGNUP);
          clearAuthStorageOnClient();
          if (!isAuthPage && isProtectedPath(pathname)) {
            fetch(`/api${AUTH_API.LOGOUT}`, { method: 'POST', credentials: 'include' }).catch(() => {});
            window.location.href = ROUTES.LOGIN;
          }
        }
      }
      return Promise.reject(axiosError.response?.data || error);
    }
    return Promise.reject(error);
  },
);

export default api;
