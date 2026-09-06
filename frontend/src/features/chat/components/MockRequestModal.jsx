import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';

const MockRequestModal = ({ isOpen, onClose, peerName }) => {
    const [topic, setTopic] = useState('DSA / Algorithms');
    const [duration, setDuration] = useState(45);
    const [level, setLevel] = useState('Intermediate');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sendMessage = useChatStore(state => state.sendMessage);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsSubmitting(true);
        try {
            await sendMessage({
                messageType: 'mockRequest',
                text: `Mock Interview Request: ${topic} (${duration} mins, ${level})`,
                mockInterview: {
                    topic: topic.trim(),
                    duration: Number(duration),
                    level,
                    status: 'pending'
                }
            });
            onClose();
        } catch (error) {
            console.error('Failed to send mock request:', error);
            alert('Failed to send mock interview request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-content__header">
                    <h2>🤝 Request Mock Interview</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="6" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#7d8590', margin: 0 }}>
                        Invite <strong>{peerName}</strong> to practice a real-time peer mock interview session.
                    </p>

                    <div className="form-group">
                        <label>Interview Topic / Focus</label>
                        <select value={topic} onChange={e => setTopic(e.target.value)}>
                            <option value="DSA / Algorithms">DSA / Algorithms</option>
                            <option value="System Design">System Design</option>
                            <option value="Frontend Engineering (React)">Frontend Engineering (React)</option>
                            <option value="Backend Engineering (Node.js)">Backend Engineering (Node.js)</option>
                            <option value="Fullstack Architecture">Fullstack Architecture</option>
                            <option value="Behavioral & Leadership">Behavioral & Leadership</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Duration</label>
                        <select value={duration} onChange={e => setDuration(Number(e.target.value))}>
                            <option value={30}>30 Minutes</option>
                            <option value={45}>45 Minutes (Recommended)</option>
                            <option value={60}>60 Minutes</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Target Level</label>
                        <select value={level} onChange={e => setLevel(e.target.value)}>
                            <option value="Beginner">Beginner (Entry Level / Internship)</option>
                            <option value="Intermediate">Intermediate (Mid Level 1-3 YOE)</option>
                            <option value="Advanced">Advanced (Senior / Staff)</option>
                        </select>
                    </div>

                    <div className="modal-content__actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MockRequestModal;
