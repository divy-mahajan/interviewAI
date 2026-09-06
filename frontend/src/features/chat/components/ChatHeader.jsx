import React from 'react';
import { useChatStore } from '../store/useChatStore';

const ChatHeader = ({ onOpenMockModal }) => {
    const selectedUser = useChatStore(state => state.selectedUser);
    const onlineUsers = useChatStore(state => state.onlineUsers);
    const selectUser = useChatStore(state => state.selectUser);

    if (!selectedUser) return null;

    const partnerId = String(selectedUser._id || selectedUser.id);
    const isOnline = onlineUsers.includes(partnerId);
    const initial = selectedUser.username ? selectedUser.username.charAt(0).toUpperCase() : '?';

    return (
        <header className="chat-pane__header">
            <div className="chat-pane__peer-details">
                <button
                    className="back-btn"
                    onClick={() => selectUser(null)}
                    aria-label="Back to conversations"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                <div className="peer-item__avatar-container">
                    <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                        {initial}
                    </div>
                </div>

                <div>
                    <div className="peer-name">{selectedUser.username}</div>
                    <div className={`peer-status ${isOnline ? 'peer-status--online' : 'peer-status--offline'}`}>
                        <span className="status-dot" />
                        {isOnline ? 'Online' : 'Offline'}
                    </div>
                </div>
            </div>

            <div className="chat-pane__actions">
                <button
                    className="mock-btn"
                    onClick={onOpenMockModal}
                    title="Request a peer mock interview session"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    Request Mock
                </button>
            </div>
        </header>
    );
};

export default ChatHeader;
