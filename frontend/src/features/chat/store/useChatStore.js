import { create } from 'zustand';
import { io } from 'socket.io-client';
import {
    fetchSidebarUsers,
    fetchConversations,
    fetchMessages,
    sendChatMessage,
    updateMockRequestStatus
} from '../services/chat.api';

const SOCKET_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3000' : '/');

export const useChatStore = create((set, get) => ({
    users: [],
    conversations: [],
    messages: [],
    activeConversationId: null,
    selectedUser: null,
    onlineUsers: [],
    isUsersLoading: false,
    isConversationsLoading: false,
    isMessagesLoading: false,
    isSending: false,
    searchQuery: '',
    sidebarTab: 'chats', // 'chats' | 'peers'
    socket: null,

    connectSocket: (currentUser) => {
        if (!currentUser || get().socket?.connected) return;

        const userId = currentUser.id || currentUser._id;
        const socket = io(SOCKET_URL, {
            query: { userId }
        });

        set({ socket });

        socket.on('connect', () => {
            console.log('[Socket] Connected to server with ID:', socket.id);
        });

        socket.on('getOnlineUsers', (userIds) => {
            set({ onlineUsers: userIds });
        });

        socket.on('newMessage', (newMessage) => {
            const { activeConversationId, messages } = get();
            const partnerId = activeConversationId ? String(activeConversationId) : null;
            const senderId = String(newMessage.senderId);
            const receiverId = String(newMessage.receiverId);

            if (partnerId && (partnerId === senderId || partnerId === receiverId)) {
                set({ messages: [...messages, newMessage] });
            }

            get().getConversations();
        });

        socket.on('mockStatusUpdated', (updatedMessage) => {
            const { messages } = get();
            const nextMessages = messages.map(msg =>
                msg._id === updatedMessage._id ? updatedMessage : msg
            );
            set({ messages: nextMessages });
            get().getConversations();
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected from server');
        });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    },

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const users = await fetchSidebarUsers();
            set({ users });
        } catch (error) {
            console.error('Error fetching peers:', error);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
            const conversations = await fetchConversations();
            set({ conversations });
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            set({ isConversationsLoading: false });
        }
    },

    getMessages: async (userId) => {
        if (!userId) return;
        set({ isMessagesLoading: true });
        try {
            const messages = await fetchMessages(userId);
            set({ messages });
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    selectUser: (user) => {
        if (!user) {
            set({ activeConversationId: null, selectedUser: null, messages: [] });
            return;
        }

        const partnerId = user._id || user.id;
        set({
            activeConversationId: partnerId,
            selectedUser: user
        });

        get().getMessages(partnerId);
    },

    sendMessage: async (messageData) => {
        const { activeConversationId, messages } = get();
        if (!activeConversationId) return null;

        set({ isSending: true });
        try {
            const sentMessage = await sendChatMessage(activeConversationId, messageData);
            set({ messages: [...messages, sentMessage] });
            get().getConversations();
            return sentMessage;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        } finally {
            set({ isSending: false });
        }
    },

    respondToMockRequest: async (messageId, status) => {
        try {
            const updated = await updateMockRequestStatus(messageId, status);
            const { messages } = get();
            const nextMessages = messages.map(msg =>
                msg._id === updated._id ? updated : msg
            );
            set({ messages: nextMessages });
            get().getConversations();
            return updated;
        } catch (error) {
            console.error('Error responding to mock interview request:', error);
            throw error;
        }
    },

    setSearchQuery: (query) => set({ searchQuery: query }),
    setSidebarTab: (tab) => set({ sidebarTab: tab })
}));
