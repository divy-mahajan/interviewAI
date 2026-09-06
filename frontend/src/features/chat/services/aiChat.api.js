import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3000' : '');

const aiApi = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

export async function fetchAIConversations() {
    const response = await aiApi.get('/api/ai-chat/conversations');
    return response.data;
}

export async function createAIConversation(data = {}) {
    const response = await aiApi.post('/api/ai-chat/conversations', data);
    return response.data;
}

export async function fetchAIConversationById(id) {
    const response = await aiApi.get(`/api/ai-chat/conversations/${id}`);
    return response.data;
}

export async function sendAIMessage(id, content) {
    const response = await aiApi.post(`/api/ai-chat/conversations/${id}/messages`, { content });
    return response.data;
}

export async function deleteAIConversation(id) {
    const response = await aiApi.delete(`/api/ai-chat/conversations/${id}`);
    return response.data;
}
