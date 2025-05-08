import React, { useState, useEffect } from 'react';
import { checkFollowStatus, followUser, unfollowUser } from '../services/api';
import { UserPlus, UserCheck, Loader, AlertCircle, UserX } from 'lucide-react';

const FollowButton = ({ 
  userId, 
  targetUserId,
  onFollowChange,
  size = 'medium', // small, medium, large
  variant = 'filled', // filled, outlined, minimal
  showCount = false,
  followerCount = 0
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [followers, setFollowers] = useState(followerCount);

  useEffect(() => {
    if (userId === targetUserId) return;
    
    const fetchFollowStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await checkFollowStatus(userId, targetUserId);
        setIsFollowing(response.data.following);
        
        // If we have follower count in the response
        if (response.data.followerCount !== undefined) {
          setFollowers(response.data.followerCount);
        }
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

  // Animation effect when status changes
  useEffect(() => {
    setAnimateIn(true);
    const timer = setTimeout(() => setAnimateIn(false), 500);
    return () => clearTimeout(timer);
  }, [isFollowing]);

  const handleFollowToggle = async () => {
    if (!userId) {
      // Instead of alert, we can use a more elegant approach
      setError('Please log in to follow users');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (isFollowing) {
        await unfollowUser(userId, targetUserId);
        setIsFollowing(false);
        setFollowers(prev => Math.max(0, prev - 1));
        if (onFollowChange) onFollowChange('unfollow');
      } else {
        await followUser(userId, targetUserId);
        setIsFollowing(true);
        setFollowers(prev => prev + 1);
        if (onFollowChange) onFollowChange('follow');
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
      setError('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if it's the same user
  if (userId === targetUserId) {
    return null;
  }

  // Size classes
  const sizeClasses = {
    small: 'text-xs py-1 px-3 h-7',
    medium: 'text-sm py-2 px-4 h-9',
    large: 'text-base py-2 px-5 h-10'
  };

  // Variant classes for normal state
  const variantClasses = {
    filled: isFollowing 
      ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300' 
      : 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700',
    outlined: isFollowing
      ? 'bg-white text-gray-700 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
      : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50',
    minimal: isFollowing
      ? 'bg-transparent text-gray-700 hover:bg-red-50 hover:text-red-600'
      : 'bg-transparent text-blue-600 hover:bg-blue-50'
  };

  // Icon sizing
  const iconSize = size === 'small' ? 14 : size === 'medium' ? 16 : 18;

  return (
    <div className="inline-flex flex-col items-center">
      {error && (
        <div className="flex items-center text-red-600 text-xs mb-2 p-1 bg-red-50 rounded-md">
          <AlertCircle size={12} className="mr-1" />
          {error}
        </div>
      )}
      
      <button
        className={`
          flex items-center justify-center font-medium rounded-full transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${animateIn ? 'scale-105' : 'scale-100'}
        `}
        onClick={handleFollowToggle}
        disabled={isLoading}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
      >
        {isLoading ? (
          <Loader size={iconSize} className="animate-spin mr-1" />
        ) : isFollowing ? (
          isHovering ? (
            <UserX size={iconSize} className="mr-1 text-red-500" />
          ) : (
            <UserCheck size={iconSize} className="mr-1" />
          )
        ) : (
          <UserPlus size={iconSize} className="mr-1" />
        )}
        
        <span>
          {isLoading 
            ? 'Loading...' 
            : isFollowing 
              ? (isHovering ? 'Unfollow' : 'Following') 
              : 'Follow'
          }
        </span>
      </button>
      
      {showCount && (
        <div className={`text-xs text-gray-500 mt-1 transition-all duration-300 ${animateIn ? 'scale-110 font-bold' : ''}`}>
          {followers} {followers === 1 ? 'follower' : 'followers'}
        </div>
      )}
    </div>
  );
};

export default FollowButton;