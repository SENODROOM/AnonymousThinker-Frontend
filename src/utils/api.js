import axios from 'axios';

const getBaseURL = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'https://anonymous-thinker-api.vercel.app';
    }
    return 'http://localhost:5000';
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true
});

// Debug log for production
if (process.env.NODE_ENV === 'production') {
    console.log('API Base URL:', api.defaults.baseURL);
}

// Helper to set the Auth token
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
