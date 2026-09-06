import { useContext, useEffect } from 'react';
import { AuthContext } from '../auth.context.jsx';
import { login, register, logout, getMe } from '../services/auth.api.js';

export const useAuth = () => {
    const context = useContext(AuthContext);
    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login(email, password);
            if (data && data.user) {
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            console.error("Login error:", err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);
        try {
            const data = await register(username, email, password);
            if (data && data.user) {
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            console.error("Register error:", err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);
            return { success: true };
        } catch (err) {
            console.error("Logout error:", err.message);
            setUser(null);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe();
                if (data && data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getAndSetUser();
    }, []);

    return { user, loading, handleLogin, handleRegister, handleLogout };
};