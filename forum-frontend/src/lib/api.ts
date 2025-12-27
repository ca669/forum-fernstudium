import axios from 'axios';

// Dynamische API-URL:
// - In Docker: Nutzt Nginx-Proxy (/api)
// - Lokal: Nutzt localhost:8000
const apiBaseURL = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api';

const api = axios.create({
    baseURL: apiBaseURL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    },
    withCredentials: true // Cookies werden bei Anfragen mitgesendet
});

export default api;
