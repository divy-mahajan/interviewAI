import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3000' : '');

const chatApi = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

export async function fetchSidebarUsers() {
    const response = await chatApi.get('/api/messages/users');
    return response.data;
}

export async function fetchConversations() {
    const response = await chatApi.get('/api/messages/conversations');
    return response.data;
}

export async function fetchMessages(userId) {
    const response = await chatApi.get(`/api/messages/${userId}`);
    return response.data;
}

export async function sendChatMessage(userId, data) {
    const response = await chatApi.post(`/api/messages/send/${userId}`, data);
    return response.data;
}

export async function updateMockRequestStatus(messageId, status) {
    const response = await chatApi.patch(`/api/messages/${messageId}/mock-status`, { status });
    return response.data;
}
