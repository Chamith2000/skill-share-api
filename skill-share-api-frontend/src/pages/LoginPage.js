import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc'; // Changed from FaGoogle to FcGoogle
import { FaGithub, FaLinkedin, FaExclamationCircle } from 'react-icons/fa';
import api from '../api/axios';
import './LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/api/login', formData);
            localStorage.setItem('user', JSON.stringify(response.data));
            navigate('/home-page');
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || 'Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = (provider) => {
        // In a real implementation, redirect to OAuth provider
        window.location.href = `/api/oauth/${provider}`;
        // For demonstration purposes:
        console.log(`Initiating ${provider} OAuth login flow`);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="header">
                    <img src="app_logo.svg" alt="ArtHive Logo" className="app-logo" />
                    <h1>ArtHive</h1>
                    <p>Sign in to your account</p>
                </div>

                {error && (
                    <div className="error-message">
                        <FaExclamationCircle className="error-icon" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />
                        <div className="forgot-password">
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`submit-button ${loading ? 'loading' : ''}`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <div className="auth-options">
                    <button
                        className="oauth-button google"
                        onClick={() => handleOAuthLogin('google')}
                    >
                        <FcGoogle className="oauth-icon" /> {/* Using FcGoogle instead of FaGoogle */}
                        <span>Sign in with Google</span>
                    </button>
                </div>

                <div className="register-link">
                    <p>
                        Don't have an account? <Link to="/register">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;