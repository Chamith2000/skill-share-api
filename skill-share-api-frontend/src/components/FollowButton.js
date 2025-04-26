import React, { useState, useEffect } from 'react';
import { checkFollowStatus, followUser, unfollowUser } from '../services/api';
import './FollowButton.css';

const FollowButton = ({ userId, targetUserId, onFollowChange }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId === targetUserId) return;

        const fetchFollowStatus = async () => {
            try {
                setIsLoading(true);
                const response = await checkFollowStatus(userId, targetUserId);
                setIsFollowing(response.data.following);
            } catch (err) {
                console.error('Error checking follow status:', err);
                setError('Failed to check follow status');
            } finally {
                setIsLoading(false);
            }
        };

        if (userId && targetUserId) {
            fetchFollowStatus();
        }
    }, [userId, targetUserId]);

    const handleFollowToggle = async () => {
        if (!userId) {
            alert('Please log in to follow users');
            return;
        }

        try {
            setIsLoading(true);
            if (isFollowing) {
                await unfollowUser(userId, targetUserId);
                setIsFollowing(false);
                if (onFollowChange) onFollowChange('unfollow');
            } else {
                await followUser(userId, targetUserId);
                setIsFollowing(true);
                if (onFollowChange) onFollowChange('follow');
            }
        } catch (err) {
            console.error('Error toggling follow status:', err);
            setError('Failed to update follow status');
        } finally {
            setIsLoading(false);
        }
    };

    if (userId === targetUserId) {
        return null;
    }

    return (
        <div className="follow-button-container">
            {error && <div className="follow-error">{error}</div>}
            <button
                className={`follow-button ${isFollowing ? 'following' : ''}`}
                onClick={handleFollowToggle}
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="follow-loading">Loading...</span>
                ) : isFollowing ? (
                    <span>Following</span>
                ) : (
                    <span>Follow</span>
                )}
            </button>
        </div>
    );
};

export default FollowButton;