import React, { useState, useEffect, useRef } from 'react';
import { useAIChatStore } from '../store/useAIChatStore';
import { FormattedAIMessage } from './CodeBlock';

const QUICK_TOPICS = [
    {
        label: '💻 DSA Problem',
        prompt: 'Give me a medium-level binary tree interview question. Give me the problem statement and ask me for my approach first before providing the solution.'
    },
    {
        label: '🏛️ System Design',
        prompt: 'Let\'s practice a System Design interview. Ask me to design a URL shortening service (like Bitly) step by step.'
    },
    {
        label: '🧠 Core CS (OS & DBMS)',
        prompt: 'Ask me 3 high-frequency technical interview questions on Operating Systems concurrency and DBMS indexing.'
    },
    {
        label: '🤝 Behavioral (STAR)',
        prompt: 'Help me craft an answer to: "Tell me about a challenging project and how you handled obstacles" using the STAR framework.'
    },
    {
        label: '💡 Hint Request',
        prompt: 'I\'m preparing for a frontend engineer interview. What are the top 5 React 19 and JavaScript concepts I must master?'
    }
];

const AIChatPane = ({ onBackToSidebar }) => {
    const messages = useAIChatStore(state => state.messages);
    const isThinking = useAIChatStore(state => state.isThinking);
    const isMessagesLoading = useAIChatStore(state => state.isMessagesLoading);
    const error = useAIChatStore(state => state.error);
    const activeAIConversation = useAIChatStore(state => state.activeAIConversation);

    const sendMessage = useAIChatStore(state => state.sendMessage);
    const startNewChat = useAIChatStore(state => state.startNewChat);

    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    const handleSend = async (textToSend) => {
        const query = (textToSend || input).trim();
        if (!query || isThinking) return;

        setInput('');
        await sendMessage(query);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <section className="chat-pane ai-chat-pane">
            {/* Header */}
            <header className="chat-pane__header ai-chat-header">
                <div className="chat-pane__peer-details">
                    {onBackToSidebar && (
                        <button
                            className="back-btn"
                            onClick={onBackToSidebar}
                            aria-label="Back to sidebar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    )}

                    <div className="ai-header-badge">✨</div>
                    <div>
                        <div className="peer-name ai-title">
                            Interview<span className="highlight">AI</span> Assistant
                        </div>
                        <div className="peer-status ai-status">
                            {activeAIConversation?.title || 'Interactive Practice & Preparation'}
                        </div>
                    </div>
                </div>

                <div className="chat-pane__actions">
                    <button
                        className="new-ai-chat-btn"
                        onClick={startNewChat}
                        title="Start fresh AI conversation"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Chat
                    </button>
                </div>
            </header>

            {/* Message Thread */}
            <div className="chat-messages ai-chat-messages">
                {isMessagesLoading ? (
                    <div className="ai-chat-loading">
                        <p>Loading AI conversation...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="ai-welcome-container">
                        <div className="ai-welcome-badge">✨</div>
                        <h2>How can I help you prepare today?</h2>
                        <p>
                            I can guide you through live coding problems, explain complex CS concepts, simulate mock interview questions, or offer hints to strengthen your answers.
                        </p>

                        <div className="quick-topics-grid">
                            {QUICK_TOPICS.map((topic, i) => (
                                <button
                                    key={i}
                                    className="quick-topic-card"
                                    onClick={() => handleSend(topic.prompt)}
                                    type="button"
                                >
                                    <span className="topic-title">{topic.label}</span>
                                    <span className="topic-preview">{topic.prompt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        return (
                            <div
                                key={msg._id || idx}
                                className={`message-row ${isUser ? 'message-row--sent' : 'message-row--received ai-row'}`}
                            >
                                {!isUser && (
                                    <div className="ai-avatar-tag">
                                        ✨ InterviewAI
                                    </div>
                                )}

                                <div className={`message-bubble ${isUser ? 'message-bubble--sent' : 'message-bubble--received ai-bubble'}`}>
                                    {isUser ? (
                                        <div className="user-message-text">{msg.content}</div>
                                    ) : (
                                        <FormattedAIMessage content={msg.content} />
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Thinking Indicator */}
                {isThinking && (
                    <div className="message-row message-row--received ai-row">
                        <div className="ai-avatar-tag">✨ InterviewAI</div>
                        <div className="message-bubble message-bubble--received ai-thinking-bubble">
                            <span className="thinking-text">InterviewAI is thinking</span>
                            <span className="dot dot-1" />
                            <span className="dot dot-2" />
                            <span className="dot dot-3" />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="ai-error-banner">
                        <span>⚠️ {error}</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="chat-composer ai-composer">
                <form
                    className="chat-composer__form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                >
                    <div className="chat-composer__pill">
                        <textarea
                            className="chat-composer__input ai-input"
                            placeholder="Message InterviewAI (e.g., 'Explain binary search', 'Ask me an HR question')..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            disabled={isThinking}
                        />

                        <button
                            type="submit"
                            className={`chat-composer__send-btn ai-send-btn ${input.trim() ? 'chat-composer__send-btn--active' : ''}`}
                            disabled={!input.trim() || isThinking}
                            aria-label="Send message to AI"
                            title="Send message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default AIChatPane;
