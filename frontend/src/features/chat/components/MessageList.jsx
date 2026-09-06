import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuth } from '../../auth/hooks/useAuth';

const MessageList = () => {
    const messages = useChatStore(state => state.messages);
    const isMessagesLoading = useChatStore(state => state.isMessagesLoading);
    const respondToMockRequest = useChatStore(state => state.respondToMockRequest);
    const { user } = useAuth();
    const bottomRef = useRef(null);

    const currentUserId = String(user?.id || user?._id || '');

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isMessagesLoading) {
        return (
            <div className="chat-messages" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#7d8590', fontSize: '0.9rem' }}>Loading conversation history...</p>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="chat-messages" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#7d8590' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👋</div>
                    <p style={{ fontWeight: 600, color: '#e6edf3', marginBottom: '0.25rem' }}>No messages yet</p>
                    <p style={{ fontSize: '0.85rem' }}>Say hello, discuss interview strategies, or send a mock interview invitation!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-messages">
            {messages.map((message) => {
                const isSentByMe = String(message.senderId) === currentUserId;
                const isMockRequest = message.messageType === 'mockRequest' && message.mockInterview;

                return (
                    <div
                        key={message._id}
                        className={`message-row ${isSentByMe ? 'message-row--sent' : 'message-row--received'}`}
                    >
                        {isMockRequest ? (
                            <div className="mock-request-card">
                                <div className="mock-request-card__header">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Mock Interview Request
                                </div>

                                <div className="mock-request-card__title">
                                    {message.mockInterview.topic}
                                </div>

                                <div className="mock-request-card__details">
                                    <span>Duration: <strong>{message.mockInterview.duration} minutes</strong></span>
                                    <span>Level: <strong>{message.mockInterview.level}</strong></span>
                                </div>

                                <div className={`mock-request-card__status mock-request-card__status--${message.mockInterview.status}`}>
                                    {message.mockInterview.status === 'pending' && '⏳ Awaiting Response'}
                                    {message.mockInterview.status === 'accepted' && '✅ Accepted — Ready to practice!'}
                                    {message.mockInterview.status === 'declined' && '❌ Declined'}
                                </div>

                                {!isSentByMe && message.mockInterview.status === 'pending' && (
                                    <div className="mock-request-card__actions">
                                        <button
                                            className="btn-accept"
                                            onClick={() => respondToMockRequest(message._id, 'accepted')}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="btn-decline"
                                            onClick={() => respondToMockRequest(message._id, 'declined')}
                                        >
                                            Decline
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={`message-bubble ${isSentByMe ? 'message-bubble--sent' : 'message-bubble--received'}`}>
                                {message.text}
                            </div>
                        )}

                        <span className="message-time">
                            {formatTime(message.createdAt)}
                        </span>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
};

export default MessageList;
