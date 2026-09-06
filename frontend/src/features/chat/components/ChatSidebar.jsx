import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAIChatStore } from '../store/useAIChatStore';

const ChatSidebar = () => {
    // Peer Chat Store
    const users = useChatStore(state => state.users);
    const conversations = useChatStore(state => state.conversations);
    const onlineUsers = useChatStore(state => state.onlineUsers);
    const activeConversationId = useChatStore(state => state.activeConversationId);
    const searchQuery = useChatStore(state => state.searchQuery);
    const sidebarTab = useChatStore(state => state.sidebarTab);
    const isUsersLoading = useChatStore(state => state.isUsersLoading);
    const isConversationsLoading = useChatStore(state => state.isConversationsLoading);

    const getUsers = useChatStore(state => state.getUsers);
    const getConversations = useChatStore(state => state.getConversations);
    const selectUser = useChatStore(state => state.selectUser);
    const setSearchQuery = useChatStore(state => state.setSearchQuery);
    const setSidebarTab = useChatStore(state => state.setSidebarTab);

    // AI Chat Store
    const aiConversations = useAIChatStore(state => state.aiConversations);
    const activeAIConversationId = useAIChatStore(state => state.activeAIConversationId);
    const isAIOpen = useAIChatStore(state => state.isAIOpen);
    const getAIConversations = useAIChatStore(state => state.getConversations);
    const selectAIConversation = useAIChatStore(state => state.selectConversation);
    const startNewAIChat = useAIChatStore(state => state.startNewChat);
    const deleteAIChat = useAIChatStore(state => state.deleteChat);
    const closeAIChat = useAIChatStore(state => state.closeAIChat);

    useEffect(() => {
        getUsers();
        getConversations();
        getAIConversations();
    }, [getUsers, getConversations, getAIConversations]);

    const normalizedQuery = searchQuery.trim().toLowerCase();

    // Filter AI conversations
    const filteredAIConversations = aiConversations.filter(conv => {
        return (conv.title || '').toLowerCase().includes(normalizedQuery);
    });

    // Filter peer conversations
    const filteredConversations = conversations.filter(conv => {
        const name = conv.username || (conv.user && conv.user.username) || '';
        return name.toLowerCase().includes(normalizedQuery);
    });

    // Filter peers
    const filteredPeers = users.filter(user => {
        const name = user.username || '';
        const email = user.email || '';
        return name.toLowerCase().includes(normalizedQuery) || email.toLowerCase().includes(normalizedQuery);
    });

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleSelectGeneralAI = () => {
        selectUser(null);
        if (!isAIOpen || activeAIConversationId) {
            startNewAIChat();
        }
    };

    const handleStartNewAIChat = (e) => {
        if (e) e.stopPropagation();
        selectUser(null);
        startNewAIChat();
    };

    const handleSelectAIConversation = (id) => {
        selectUser(null);
        selectAIConversation(id);
    };

    const handleSelectPeer = (user) => {
        closeAIChat();
        selectUser(user);
    };

    return (
        <aside className={`chat-sidebar ${(activeConversationId || isAIOpen) ? 'hidden-mobile' : ''}`}>
            <div className="chat-sidebar__header">
                <div className="chat-sidebar__title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>InterviewAI Chat</span>
                </div>

                <div className="chat-sidebar__search-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search peers, chats, topics..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="chat-sidebar__list">
                {/* ── SECTION 1: INTERVIEW AI ASSISTANT ── */}
                <div className="sidebar-group sidebar-group--ai">
                    <div className="sidebar-group__header">
                        <span className="sidebar-group__title">✨ InterviewAI</span>
                        <button
                            type="button"
                            className="sidebar-new-ai-btn"
                            onClick={handleStartNewAIChat}
                            title="Start fresh AI session"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            New Chat
                        </button>
                    </div>

                    <div
                        className={`peer-item peer-item--ai ${isAIOpen && !activeAIConversationId ? 'peer-item--active' : ''}`}
                        onClick={handleSelectGeneralAI}
                    >
                        <div className="peer-item__avatar-container">
                            <div className="avatar avatar--ai">✨</div>
                            <span className="online-badge online-badge--ai" title="AI Ready" />
                        </div>
                        <div className="peer-item__info">
                            <div className="peer-item__name-row">
                                <span className="name">AI Interview Assistant</span>
                                <span className="ai-badge-pill">Ready</span>
                            </div>
                            <p className="peer-item__preview">DSA, System Design, Concepts & Mock Prep</p>
                        </div>
                    </div>

                    {/* Saved AI conversation history */}
                    {filteredAIConversations.length > 0 && (
                        <div className="ai-session-list">
                            <div className="ai-session-subtitle">Recent Sessions</div>
                            {filteredAIConversations.map(conv => (
                                <div
                                    key={conv._id}
                                    className={`ai-session-item ${isAIOpen && activeAIConversationId === conv._id ? 'ai-session-item--active' : ''}`}
                                    onClick={() => handleSelectAIConversation(conv._id)}
                                >
                                    <svg className="ai-session-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <span className="ai-session-title" title={conv.title}>
                                        {conv.title}
                                    </span>
                                    <button
                                        type="button"
                                        className="ai-session-delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteAIChat(conv._id);
                                        }}
                                        title="Delete session"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── SECTION 2: PEOPLE ── */}
                <div className="sidebar-group sidebar-group--people">
                    <div className="sidebar-group__header">
                        <span className="sidebar-group__title">People</span>
                    </div>

                    <div className="chat-sidebar__tabs">
                        <button
                            className={`chat-sidebar__tab ${sidebarTab === 'chats' ? 'chat-sidebar__tab--active' : ''}`}
                            onClick={() => setSidebarTab('chats')}
                        >
                            Chats
                            <span className="tab-count">{conversations.length}</span>
                        </button>
                        <button
                            className={`chat-sidebar__tab ${sidebarTab === 'peers' ? 'chat-sidebar__tab--active' : ''}`}
                            onClick={() => setSidebarTab('peers')}
                        >
                            Peers
                            <span className="tab-count">{users.length}</span>
                        </button>
                    </div>

                    <div className="sidebar-people-list">
                        {sidebarTab === 'chats' ? (
                            isConversationsLoading ? (
                                <p style={{ textAlign: 'center', color: '#7d8590', padding: '1.5rem', fontSize: '0.85rem' }}>Loading conversations...</p>
                            ) : filteredConversations.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#7d8590', padding: '1.5rem 0.5rem', fontSize: '0.82rem' }}>
                                    <p style={{ marginBottom: '0.35rem' }}>No conversations yet.</p>
                                    <p style={{ fontSize: '0.75rem' }}>Switch to the <strong>Peers</strong> tab to start preparing with someone!</p>
                                </div>
                            ) : (
                                filteredConversations.map(conv => {
                                    const partner = conv.user || conv;
                                    const partnerId = String(conv._id || partner._id);
                                    const isOnline = onlineUsers.includes(partnerId);
                                    const initial = partner.username ? partner.username.charAt(0).toUpperCase() : '?';
                                    const lastMsg = conv.lastMessage;
                                    const previewText = lastMsg
                                        ? (lastMsg.messageType === 'mockRequest'
                                            ? `🤝 Mock Request: ${lastMsg.mockInterview?.topic || ''}`
                                            : lastMsg.text)
                                        : 'Started a conversation';

                                    return (
                                        <div
                                            key={partnerId}
                                            className={`peer-item ${activeConversationId === partnerId ? 'peer-item--active' : ''}`}
                                            onClick={() => handleSelectPeer(partner)}
                                        >
                                            <div className="peer-item__avatar-container">
                                                <div className="avatar">{initial}</div>
                                                {isOnline && <span className="online-badge" title="Online" />}
                                            </div>
                                            <div className="peer-item__info">
                                                <div className="peer-item__name-row">
                                                    <span className="name">{partner.username}</span>
                                                    {conv.lastMessageAt && (
                                                        <span className="time">{formatTime(conv.lastMessageAt)}</span>
                                                    )}
                                                </div>
                                                <p className="peer-item__preview">{previewText}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )
                        ) : (
                            isUsersLoading ? (
                                <p style={{ textAlign: 'center', color: '#7d8590', padding: '1.5rem', fontSize: '0.85rem' }}>Loading peers...</p>
                            ) : filteredPeers.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#7d8590', padding: '1.5rem', fontSize: '0.82rem' }}>No registered peers found.</p>
                            ) : (
                                filteredPeers.map(user => {
                                    const userId = String(user._id);
                                    const isOnline = onlineUsers.includes(userId);
                                    const initial = user.username ? user.username.charAt(0).toUpperCase() : '?';

                                    return (
                                        <div
                                            key={userId}
                                            className={`peer-item ${activeConversationId === userId ? 'peer-item--active' : ''}`}
                                            onClick={() => handleSelectPeer(user)}
                                        >
                                            <div className="peer-item__avatar-container">
                                                <div className="avatar">{initial}</div>
                                                {isOnline && <span className="online-badge" title="Online" />}
                                            </div>
                                            <div className="peer-item__info">
                                                <div className="peer-item__name-row">
                                                    <span className="name">{user.username}</span>
                                                    <span className="time" style={{ color: isOnline ? '#22c55e' : '#7d8590' }}>
                                                        {isOnline ? 'Online' : 'Offline'}
                                                    </span>
                                                </div>
                                                <p className="peer-item__preview">{user.email}</p>
                                                {user.skills && user.skills.length > 0 && (
                                                    <div className="peer-item__skills">
                                                        {user.skills.map((skill, idx) => (
                                                            <span key={idx} className="skill-pill">{skill}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default ChatSidebar;
