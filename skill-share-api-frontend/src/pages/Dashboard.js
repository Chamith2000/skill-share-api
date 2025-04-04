import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css'; // Make sure to create this CSS file

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Get user from localStorage
        const userData = localStorage.getItem('user');

        if (userData) {
            setUser(JSON.parse(userData));
        }

        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading your dashboard...</div>
            </div>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="header">
                <div className="header-container">
                    <h1 className="logo">
                        <span className="logo-skill">Skill</span>Share
                    </h1>
                    <div className="user-section">
                        <span className="welcome-text">Welcome, <span className="username">{user.username}</span></span>
                        <button onClick={handleLogout} className="logout-button">
                            <svg xmlns="http://www.w3.org/2000/svg" className="logout-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <div className="dashboard-container">
                    <h2 className="dashboard-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="dashboard-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </h2>

                    <div className="card-grid">
                        {/* Profile Card */}
                        <div className="card profile-card">
                            <h3 className="card-title">
                                <svg xmlns="http://www.w3.org/2000/svg" className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Your Profile
                            </h3>
                            <div className="profile-info">
                                <p className="profile-detail">
                                    <span className="label">Username:</span>
                                    <span className="value">{user.username}</span>
                                </p>
                                <p className="profile-detail">
                                    <span className="label">Email:</span>
                                    <span className="value">{user.email}</span>
                                </p>
                            </div>
                            <button className="edit-profile-button">
                                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit Profile
                            </button>
                        </div>

                        {/* Skills Card */}
                        <div className="card skills-card">
                            <h3 className="card-title">
                                <svg xmlns="http://www.w3.org/2000/svg" className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Your Skills
                            </h3>
                            <p className="card-description">You haven't added any skills yet. Share what you know!</p>
                            <button className="add-skills-button">
                                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Skills
                            </button>
                        </div>

                        {/* Learning Card */}
                        <div className="card learning-card">
                            <h3 className="card-title">
                                <svg xmlns="http://www.w3.org/2000/svg" className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Learning
                            </h3>
                            <p className="card-description">Discover and learn new skills from other community members.</p>
                            <button className="explore-skills-button">
                                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                                </svg>
                                Explore Skills
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;