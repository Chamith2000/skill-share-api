import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import './RegisterPage.css';
import { FcGoogle } from 'react-icons/fc';
import { BsFacebook, BsGithub, BsApple } from 'react-icons/bs';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [oauthLoading, setOauthLoading] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Check if there's an OAuth error in URL params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const oauthError = params.get('oauth_error');
        if (oauthError) {
            setServerError(decodeURIComponent(oauthError));
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear field-specific error when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.username) {
            newErrors.username = 'Username cannot be blank';
        } else if (formData.username.length < 3 || formData.username.length > 50) {
            newErrors.username = 'Username must be between 3 and 50 characters';
        } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, dots, underscores, and hyphens';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password cannot be blank';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one digit, lowercase letter, uppercase letter, special character, and no whitespace';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email cannot be blank';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/api/register', formData);

            // Registration successful
            console.log('Registration successful:', response.data);
            navigate('/login?registered=true');
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response?.data?.fieldErrors) {
                // Handle field-specific validation errors from backend
                const fieldErrors = {};
                error.response.data.fieldErrors.forEach(fieldError => {
                    fieldErrors[fieldError.field] = fieldError.message;
                });
                setErrors(fieldErrors);
            } else {
                // Handle general error
                setServerError(
                    error.response?.data?.message ||
                    'Registration failed. Please try again later.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = (provider) => {
        setOauthLoading(provider);
        // Redirect to the OAuth provider's authorization URL
        window.location.href = `/api/oauth/${provider}`;
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="header">
                <img src="app_logo.svg" alt="ArtHive Logo" className="app-logo" />
                    <h1>ArtHive</h1>
                    <p>Create your account</p>
                </div>

                {serverError && (
                    <div className="error-message">
                        {serverError}
                    </div>
                )}

                <div className="oauth-options">
                    <button 
                        className="oauth-button google"
                        onClick={() => handleOAuthLogin('google')}
                        disabled={!!oauthLoading}
                    >
                        <FcGoogle className="oauth-icon" />
                        <span>{oauthLoading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
                    </button>
                    
                
                </div>

                <div className="separator">
                    <span>OR</span>
                </div>

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
                            className={errors.username ? 'error' : ''}
                        />
                        {errors.username && (
                            <p className="field-error">{errors.username}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && (
                            <p className="field-error">{errors.email}</p>
                        )}
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
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && (
                            <p className="field-error">{errors.password}</p>
                        )}
                        <div className="password-requirements">
                            Password must contain at least 8 characters with:
                            <ul>
                                <li>One uppercase letter</li>
                                <li>One lowercase letter</li>
                                <li>One number</li>
                                <li>One special character (@#$%^&+=)</li>
                            </ul>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`submit-button ${loading ? 'loading' : ''}`}
                    >
                        {loading ? '' : 'Register'}
                    </button>
                </form>

                <div className="login-link">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;