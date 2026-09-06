import { create } from 'zustand';
import {
    fetchAIConversations,
    createAIConversation,
    fetchAIConversationById,
    sendAIMessage,
    deleteAIConversation
} from '../services/aiChat.api';

export const useAIChatStore = create((set, get) => ({
    aiConversations: [],
    activeAIConversationId: null,
    activeAIConversation: null,
    messages: [],
    isConversationsLoading: false,
    isMessagesLoading: false,
    isThinking: false,
    isAIOpen: false,
    error: null,

    openAIChat: () => set({ isAIOpen: true }),
    closeAIChat: () => set({ isAIOpen: false }),

    getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
            const list = await fetchAIConversations();
            set({ aiConversations: list });
        } catch (error) {
            console.error('Error fetching AI conversations:', error);
        } finally {
            set({ isConversationsLoading: false });
        }
    },

    selectConversation: async (id) => {
        if (!id) return;
        set({ isAIOpen: true, activeAIConversationId: id, isMessagesLoading: true, error: null });
        try {
            const conversation = await fetchAIConversationById(id);
            set({
                activeAIConversation: conversation,
                messages: conversation.messages || []
            });
        } catch (error) {
            console.error('Error loading AI conversation:', error);
            set({ error: 'Failed to load conversation' });
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    startNewChat: () => {
        set({
            isAIOpen: true,
            activeAIConversationId: null,
            activeAIConversation: null,
            messages: [],
            error: null
        });
    },

    sendMessage: async (content, context = null) => {
        const trimmed = (content || '').trim();
        if (!trimmed) return;

        let conversationId = get().activeAIConversationId;

        set({ isThinking: true, error: null });

        try {
            // If no active conversation exists, create one first
            if (!conversationId) {
                const newConv = await createAIConversation({
                    title: 'New AI Chat',
                    context: context || {}
                });
                conversationId = newConv._id;
                set({
                    activeAIConversationId: conversationId,
                    activeAIConversation: newConv
                });
            }

            // Optimistically append user message
            const tempUserMsg = {
                role: 'user',
                content: trimmed,
                timestamp: new Date()
            };
            set(state => ({ messages: [...state.messages, tempUserMsg] }));

            // Dispatch message to AI backend
            const response = await sendAIMessage(conversationId, trimmed);

            // Update messages with official assistant response
            set(state => {
                // Keep all messages up to optimistic one and ensure assistant message is added
                const existing = state.messages.slice(0, -1);
                return {
                    messages: [...existing, response.userMessage, response.assistantMessage],
                    activeAIConversation: {
                        ...(state.activeAIConversation || {}),
                        title: response.title
                    }
                };
            });

            // Refresh sidebar AI conversation titles
            get().getConversations();
        } catch (error) {
            console.error('Error in AI message dispatch:', error);
            const errorMsg = error.response?.data?.message || 'Failed to get response from InterviewAI. Please try again.';
            set({ error: errorMsg });
        } finally {
            set({ isThinking: false });
        }
    },

    deleteChat: async (id) => {
        try {
            await deleteAIConversation(id);
            if (get().activeAIConversationId === id) {
                get().startNewChat();
            }
            get().getConversations();
        } catch (error) {
            console.error('Error deleting AI conversation:', error);
        }
    }
}));
