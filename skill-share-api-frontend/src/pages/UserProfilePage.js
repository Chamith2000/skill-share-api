import React, { useState, useEffect } from 'react';
import { getUserProfile, getFollowCounts, getNotificationsByUserId, markNotificationAsRead } from '../services/api';
import FollowButton from '../components/FollowButton';
import './UserProfile.css';

const UserProfile = ({ match }) => {
    const [profile, setProfile] = useState(null);
    const [followCounts, setFollowCounts] = useState({ followersCount: 0, followingCount: 0 });
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const targetUserId = parseInt(match.params.userId);
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    const currentUserId = currentUser ? currentUser.id : null;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const userResponse = await getUserProfile(targetUserId);
                setProfile(userResponse.data);

                const countsResponse = await getFollowCounts(targetUserId);
                setFollowCounts(countsResponse.data);

                if (currentUserId && currentUserId === targetUserId) {
                    const notificationsResponse = await getNotificationsByUserId(currentUserId);
                    setNotifications(notificationsResponse.data);
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    setError('User not found');
                } else {
                    setError('Failed to load user profile');
                }
                console.error('Error fetching user data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (targetUserId) {
            fetchUserData();
        }
    }, [targetUserId, currentUserId]);

    const handleFollowChange = async (action) => {
        const prevCounts = { ...followCounts };
        if (action === 'follow') {
            setFollowCounts(prev => ({
                ...prev,
                followersCount: prev.followersCount + 1,
            }));
        } else if (action === 'unfollow') {
            setFollowCounts(prev => ({
                ...prev,
                followersCount: Math.max(0, prev.followersCount - 1),
            }));
        }

        try {
            const countsResponse = await getFollowCounts(targetUserId);
            setFollowCounts(countsResponse.data);
        } catch (err) {
            console.error('Error refreshing follow counts:', err);
            setFollowCounts(prevCounts);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId ? { ...notification, isRead: true } : notification
                )
            );
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (error || !profile) {
        return <div className="error-message">{error || 'User not found'}</div>;
    }

    return (
        <div className="user-profile-container">
            <div className="profile-header">
                <div className="profile-image">
                    {profile.profileImageUrl ? (
                        <img src={profile.profileImageUrl} alt={`${profile.username}'s profile`} />
                    ) : (
                        <div className="profile-image-placeholder">{profile.username.charAt(0).toUpperCase()}</div>
                    )}
                </div>

                <div className="profile-info">
                    <h2>{profile.username}</h2>
                    <p className="bio">{profile.bio || 'No bio available'}</p>

                    <div className="follow-stats">
                        <span className="stat-item">
                            <strong>{followCounts.followersCount}</strong> Followers
                        </span>
                        <span className="stat-item">
                            <strong>{followCounts.followingCount}</strong> Following
                        </span>
                    </div>

                    {currentUserId && currentUserId !== targetUserId && (
                        <FollowButton
                            userId={currentUserId}
                            targetUserId={targetUserId}
                            onFollowChange={handleFollowChange}
                        />
                    )}
                </div>
            </div>

            {currentUserId === targetUserId && notifications.length > 0 && (
                <div className="notifications-section">
                    <h3>Notifications</h3>
                    <ul className="notification-list">
                        {notifications.map(notification => (
                            <li
                                key={notification.id}
                                className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                            >
                                <span>{notification.message}</span>
                                {!notification.isRead && (
                                    <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="mark-read-button"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserProfile;