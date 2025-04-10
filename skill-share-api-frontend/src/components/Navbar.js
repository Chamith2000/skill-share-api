import React from 'react';
import { Link, useNavigate } from 'react-router-dom';  // Add useNavigate
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();  // Hook for navigation

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('user');
        // Redirect to login page
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/home-page" className="navbar-logo">
                    MyBlog
                </Link>
                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/home-page" className="nav-links">
                            Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/create-post" className="nav-links">
                            Create Post
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/profile" className="nav-links">
                            Profile
                        </Link>
                    </li>
                    <li className="nav-item">
                        <button
                            className="logout-button"
                            onClick={handleLogout}  // Add click handler
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;