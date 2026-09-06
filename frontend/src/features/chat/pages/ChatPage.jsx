import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import ChatSidebar from '../components/ChatSidebar';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import ChatComposer from '../components/ChatComposer';
import MockRequestModal from '../components/MockRequestModal';
import AIChatPane from '../components/AIChatPane';
import { useChatStore } from '../store/useChatStore';
import { useAIChatStore } from '../store/useAIChatStore';
import { useAuth } from '../../auth/hooks/useAuth';
import '../style/chat.scss';

const ChatPage = () => {
    const { user } = useAuth();
    const activeConversationId = useChatStore(state => state.activeConversationId);
    const selectedUser = useChatStore(state => state.selectedUser);
    const connectSocket = useChatStore(state => state.connectSocket);
    const setSidebarTab = useChatStore(state => state.setSidebarTab);

    const isAIOpen = useAIChatStore(state => state.isAIOpen);
    const closeAIChat = useAIChatStore(state => state.closeAIChat);
    const startNewAIChat = useAIChatStore(state => state.startNewChat);

    const [isMockModalOpen, setIsMockModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            connectSocket(user);
        }
    }, [user, connectSocket]);

    const handleOpenAIFromEmpty = () => {
        useChatStore.getState().selectUser(null);
        startNewAIChat();
    };

    return (
        <div className="chat-page">
            <Navbar />

            <main className="chat-layout">
                <ChatSidebar />

                {activeConversationId && selectedUser ? (
                    <section className="chat-pane">
                        <ChatHeader onOpenMockModal={() => setIsMockModalOpen(true)} />
                        <MessageList />
                        <ChatComposer />

                        <MockRequestModal
                            isOpen={isMockModalOpen}
                            onClose={() => setIsMockModalOpen(false)}
                            peerName={selectedUser.username}
                        />
                    </section>
                ) : isAIOpen ? (
                    <AIChatPane onBackToSidebar={() => closeAIChat()} />
                ) : (
                    <section className={`chat-pane chat-empty ${(activeConversationId || isAIOpen) ? '' : 'hidden-mobile'}`}>
                        <div className="chat-empty__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <h3>Welcome to InterviewAI Chat</h3>
                        <p>
                            Prepare with your personal <strong>AI Interview Assistant</strong> for real-time practice, or connect with peers for 1-on-1 mock interviews and study discussions.
                        </p>
                        <div className="chat-empty__actions">
                            <button
                                type="button"
                                className="empty-ai-btn"
                                onClick={handleOpenAIFromEmpty}
                            >
                                ✨ Start InterviewAI Practice
                            </button>
                            <button
                                type="button"
                                className="empty-peers-btn"
                                onClick={() => setSidebarTab('peers')}
                            >
                                👥 Browse Peers
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default ChatPage;
