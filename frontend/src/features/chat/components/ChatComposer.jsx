import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';

const ChatComposer = () => {
    const [text, setText] = useState('');
    const sendMessage = useChatStore(state => state.sendMessage);
    const isSending = useChatStore(state => state.isSending);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || isSending) return;

        setText('');
        try {
            await sendMessage({ text: trimmed, messageType: 'text' });
        } catch (error) {
            console.error('Failed to send message:', error);
            setText(trimmed); // Restore text on failure
        }
    };

    return (
        <div className="chat-composer">
            <form className="chat-composer__form" onSubmit={handleSubmit}>
                <div className="chat-composer__pill">
                    <input
                        type="text"
                        className="chat-composer__input"
                        placeholder="Message..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                        disabled={isSending}
                    />

                    <button
                        type="submit"
                        className={`chat-composer__send-btn ${text.trim() ? 'chat-composer__send-btn--active' : ''}`}
                        disabled={!text.trim() || isSending}
                        aria-label="Send message"
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
    );
};

export default ChatComposer;
