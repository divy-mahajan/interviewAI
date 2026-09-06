import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3000' : '');

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

export async function register(username, email, password) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        });
        return response.data;
    } catch(err) {
        const message = err.response?.data?.message ||
            (err.message === "Network Error" ? "Unable to connect to server" : "Registration failed");
        const error = new Error(message);
        error.status = err.response?.status;
        throw error;
    }
}

export async function login(email, password) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        });
        return response.data;
    } catch(err) {
        const message = err.response?.data?.message ||
            (err.message === "Network Error" ? "Unable to connect to server" : "Invalid email or password");
        const error = new Error(message);
        error.status = err.response?.status;
        throw error;
    }
}

export async function logout() {
    try {
        const response = await api.post("/api/auth/logout");
        return response.data;
    } catch(err) {
        // Fallback to GET if server only exposes GET /logout
        try {
            const getResponse = await api.get("/api/auth/logout");
            return getResponse.data;
        } catch (fallbackErr) {
            console.error("Logout error:", fallbackErr);
            return null;
        }
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me");
        return response.data;
    } catch(err) {
        return null;
    }
}