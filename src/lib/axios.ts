import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => {
        return response.data; // Return only data (or the full response depending on preference, but usually consistent with ApiResponse)
    },
    (error) => {
        // Handle global errors if needed, e.g. token expiration redirect
        if (error.response && error.response.status === 401) {
            // Optional: Redirect to login or clear auth state
            // window.location.href = '/login'; 
        }
        return Promise.reject(error.response ? error.response.data : error);
    }
);

export default api;
