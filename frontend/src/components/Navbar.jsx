import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../features/auth/hooks/useAuth';
import '../styles/navbar.scss';

const Navbar = () => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();

    const onLogout = async () => {
        await handleLogout();
        navigate('/login');
    };

    if (!user) return null;

    const initial = user.username ? user.username.charAt(0).toUpperCase() : 'U';

    return (
        <header className="app-navbar">
            <div className="app-navbar__inner">
                <div className="app-navbar__brand">
                    <div className="brand-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <span>Interview<span className="highlight">AI</span></span>
                </div>

                <nav className="app-navbar__links">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `app-navbar__link ${isActive ? 'app-navbar__link--active' : ''}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        Interview Prep
                    </NavLink>

                    <NavLink
                        to="/chat"
                        className={({ isActive }) => `app-navbar__link ${isActive ? 'app-navbar__link--active' : ''}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Chat & Peers
                    </NavLink>
                </nav>

                <div className="app-navbar__actions">
                    <div className="app-navbar__user-badge" title={user.email}>
                        <div className="user-avatar">{initial}</div>
                        <span className="user-name">{user.username}</span>
                    </div>

                    <button className="app-navbar__logout-btn" onClick={onLogout} title="Logout">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
