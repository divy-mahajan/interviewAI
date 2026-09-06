import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth.js';
import "../auth.form.scss";

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { loading, handleRegister } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!username.trim() || !email.trim() || !password) {
            setError("Please fill in all fields");
            return;
        }

        setSubmitting(true);
        const result = await handleRegister({
            username: username.trim(),
            email: email.trim(),
            password
        });
        setSubmitting(false);

        if (result && result.success) {
            navigate("/");
        } else {
            setError(result?.error || "Registration failed. User may already exist.");
        }
    };

    if (loading && !submitting) {
        return (<main><h1>Loading...</h1></main>);
    }

    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(255, 77, 77, 0.15)',
                        border: '1px solid rgba(255, 77, 77, 0.4)',
                        color: '#ff6b6b',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        lineHeight: '1.4'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter email address"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button className="button primary-button" type="submit" disabled={submitting}>
                        {submitting ? "Registering..." : "Register"}
                    </button>
                </form>

                <p>Already have an account? <Link to={"/login"}>Login</Link></p>
            </div>
        </main>
    );
};

export default Register;