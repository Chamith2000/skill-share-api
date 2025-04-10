import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './LoginPage.css'; // Import CSS file

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/login', formData);

            // Store user info in localStorage or context
            localStorage.setItem('user', JSON.stringify(response.data));

            // Redirect to dashboard or home page
            navigate('/postManagement');
        } catch (error) {
            console.error('Login error:', error);
            setError(
                error.response?.data?.message ||
                'Invalid username or password. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="header">
                    <h1>SkillShare</h1>
                    <p>Sign in to your account</p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`submit-button ${loading ? 'loading' : ''}`}
                    >
                        {loading ? '' : 'Sign In'}
                    </button>
                </form>

                <div className="register-link">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;