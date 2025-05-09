import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Helper function to get user from localStorage
const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

// User APIs
export const getUserProfile = async (userId) =>
    api.get(`/profile/${userId}`).catch(err => {
        console.error(`Get user profile for user ${userId} error:`, err.response?.data || err.message);
        throw err;
    });

// Profile Image Upload API
export const uploadProfileImage = async (userId, imageFile) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    return api.post(`/profile/${userId}/upload-image`, formData, {
        headers: {
            userId: user.id,
            'Content-Type': 'multipart/form-data'
        },
    }).catch(err => {
        console.error(`Upload profile image error:`, err.response?.data || err.message);
        throw err;
    });
};

// Update Profile API
export const updateUserProfile = async (userId, profileData) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.put(`/profile/${userId}`, profileData, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Update profile error:`, err.response?.data || err.message);
        throw err;
    });
};

// Post APIs
export const getAllPosts = () =>
    api.get('/posts').catch(err => {
        console.error('Get all posts error:', err.response?.data || err.message);
        throw err;
    });

export const getPostById = (postId) =>
    api.get(`/posts/${postId}`).catch(err => {
        console.error(`Get post ${postId} error:`, err.response?.data || err.message);
        throw err;
    });

export const createPost = (userId, postData) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.post(`/users/${userId}/posts`, postData, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error('Create post error:', err.response?.data || err.message);
        throw err;
    });
};

export const updatePost = (postId, postData) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.put(`/posts/${postId}`, postData, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Update post ${postId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export const deletePost = (postId) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.delete(`/posts/${postId}`, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Delete post ${postId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export const likePost = (postId) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.post(`/posts/${postId}/like`, null, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Like post ${postId} error:`, err.response?.data || err.message);
        throw err;
    });
};

// Comment APIs
export const getCommentsByPostId = (postId) =>
    api.get(`/comments/${postId}`).catch(err => {
        console.error(`Get comments for post ${postId} error:`, err.response?.data || err.message);
        throw err;
    });

export const createComment = (postId, commentData) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.post(`/comments/${postId}`, commentData, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Create comment for post ${postId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export const updateComment = (postId, commentId, commentData) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.put(`/comments/${commentId}`, commentData, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Update comment ${commentId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export const deleteComment = (postId, commentId) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.delete(`/comments/${commentId}`, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Delete comment ${commentId} error:`, err.response?.data || err.message);
        throw err;
    });
};

// Like APIs
export const toggleLike = async (postId, userId) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.post(`/posts/${postId}/likes/${userId}`, null, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Toggle like for post ${postId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export const getLikeStatus = async (postId, userId) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.get(`/posts/${postId}/likes/${userId}/status`, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Get like status for post ${postId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export const getLikeCount = async (postId) =>
    api.get(`/posts/${postId}/likes/count`).catch(err => {
        console.error(`Get like count for post ${postId} error:`, err.response?.data || err.message);
        throw err;
    });

// Follow a user
export const followUser = async (followerId, followeeId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/follows`, {
            followerId,
            followeeId
        });
        return response;
    } catch (error) {
        console.error('Error following user:', error);
        throw error;
    }
};

// Unfollow a user
export const unfollowUser = async (followerId, followeeId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/follows/${followerId}/${followeeId}`);
        return response;
    } catch (error) {
        console.error('Error unfollowing user:', error);
        throw error;
    }
};

// Check if a user is following another user
export const checkFollowStatus = async (followerId, followeeId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/follows/status/${followerId}/${followeeId}`);
        return response;
    } catch (error) {
        console.error('Error checking follow status:', error);
        throw error;
    }
};

// Get followers of a user
export const getFollowers = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/follows/followers/${userId}`);
        return response;
    } catch (error) {
        console.error('Error getting followers:', error);
        throw error;
    }
};

// Get users that a user is following
export const getFollowing = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/follows/following/${userId}`);
        return response;
    } catch (error) {
        console.error('Error getting following users:', error);
        throw error;
    }
};

// Get follow counts (followers and following)
export const getFollowCounts = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/follows/counts/${userId}`);
        return response;
    } catch (error) {
        console.error('Error getting follow counts:', error);
        throw error;
    }
};

// Notification APIs
export const getNotificationsByUserId = async (userId) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.get(`/notifications/user/${userId}`, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Get notifications for user ${userId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export const markNotificationAsRead = async (notificationId) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.put(`/notifications/${notificationId}/read`, null, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Mark notification ${notificationId} as read error:`, err.response?.data || err.message);
        throw err;
    });
};

export const updateUserProfileFull = async (userId, profileData, imageFile) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    const formData = new FormData();

    // Add the user data as JSON
    formData.append('user', new Blob(
        [JSON.stringify(profileData)],
        { type: 'application/json' }
    ));

    // Add the image if provided
    if (imageFile) {
        formData.append('image', imageFile);
    }

    return api.put(`/profile/${userId}/full-update`, formData, {
        headers: {
            userId: user.id,
            'Content-Type': 'multipart/form-data'
        },
    }).catch(err => {
        console.error(`Update profile with image error:`, err.response?.data || err.message);
        throw err;
    });
};

export default api;
