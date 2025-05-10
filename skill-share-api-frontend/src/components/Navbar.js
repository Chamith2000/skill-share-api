import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Navbar.css';
import { FaBell } from 'react-icons/fa';
import Logo from '../assets/app_logo.svg';

const Navbar = () => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const notificationRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 30000);
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            if (!currentUser || !currentUser.id) {
                console.log('No user found in localStorage or missing ID');
                return;
            }
            const response = await api.get(`/api/notifications/user/${currentUser.id}`);
            if (Array.isArray(response.data)) {
                setNotifications(response.data);
                const unreadNotifications = response.data.filter(notification => !notification.read);
                setUnreadCount(unreadNotifications.length);
            } else {
                console.error('Expected an array of notifications but got:', response.data);
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/api/notifications/${notificationId}/read`);
            setNotifications(notifications.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/home-page" className="navbar-logo">
                    <img src={Logo} alt="ArtHive Logo" />
                    ArtHive
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
                        <Link to="/request-board" className="nav-links">
                            Request Board
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/learning-plans" className="nav-links">
                            Learning Progress
                        </Link>
                    </li>
                    <li className="nav-item notification-item" ref={notificationRef}>
                        <button className="notification-button" onClick={toggleNotifications}>
                            <FaBell />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    <h3>Notifications</h3>
                                </div>
                                <div className="notification-list">
                                    {notifications.length > 0 ? (
                                        notifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <div className="notification-content">
                                                    <p>{notification.message}</p>
                                                    <span className="notification-time">
                                                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Unknown time'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-notifications">No notifications</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </li>
                    <li className="nav-item">
                        <button
                            className="logout-button"
                            onClick={handleLogout}
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