import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Helper function to get user from localStorage
const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

// Interceptor to add userId header and handle errors
api.interceptors.request.use(config => {
    const user = getUser();
    if (user && user.id) {
        config.headers['userId'] = user.id;
    } else {
        console.warn('No valid user found in localStorage for request:', config.url);
    }
    return config;
}, error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

api.interceptors.response.use(response => {
    // Attempt to parse string response.data if it's not an object
    if (response.data && typeof response.data === 'string') {
        try {
            response.data = JSON.parse(response.data);
            console.log('Parsed string response.data:', response.data);
        } catch (parseError) {
            console.error('Failed to parse response.data string:', parseError, 'Raw data:', response.data);
            throw new Error('Invalid JSON response from server');
        }
    }
    return response;
}, error => {
    if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error('Request timed out. Please check if the server is running.'));
    }
    if (!error.response) {
        return Promise.reject(new Error('Network Error: Unable to reach the server. Please check your connection or server status.'));
    }
    const message = error.response.data?.message || error.response.data?.error || error.message;
    return Promise.reject(new Error(`Server Error: ${message} (Status: ${error.response.status})`));
});

// User APIs
export const getUserProfile = async (userId) => {
    try {
      const response = await api.get(`/profile/${userId}`);
      return response;
    } catch (error) {
      console.error('Error in getUserProfile:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  };
  
  export const updateUserProfile = async (userId, data) => {
    try {
      const response = await api.patch(`/profile/${userId}`, data, {
        headers: {
          userId: userId.toString(),
        },
      });
      return response;
    } catch (error) {
      console.error('Error in updateUserProfile:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  };
  
  export const uploadProfileImage = async (userId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const response = await api.post(`/profile/${userId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          userId: userId.toString(),
        },
      });
      return response;
    } catch (error) {
      console.error('Error in uploadProfileImage:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
  };
  
  export const updateUserProfileFull = async (userId, profileData, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('user', JSON.stringify(profileData));
      if (imageFile) {
        formData.append('image', imageFile);
      }
      const response = await api.put(`/profile/${userId}/full-update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          userId: userId.toString(),
        },
      });
      return response;
    } catch (error) {
      console.error('Error in updateUserProfileFull:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update profile with image');
    }}
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

// Comment APIs
export const getCommentsByPostId = (postId) =>
    api.get(`/posts/${postId}/comments`).catch(err => {
        console.error(`Get comments for post ${postId} error:`, err.response?.data || err.message);
        throw err;
    });

export const createComment = (postId, commentData) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.post(`/posts/${postId}/comments`, commentData, {
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

    return api.put(`/posts/${postId}/comments/${commentId}`, commentData, {
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

    return api.delete(`/posts/${postId}/comments/${commentId}`, {
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

    return api.post(`/posts/${postId}/likes`, { userId }, {
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

    return api.get(`/posts/${postId}/likes/status`, {
        params: { userId },
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

// Follow APIs
export const followUser = async (followerId, followeeId) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.post(`/users/${followerId}/follow`, { followeeId }, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Follow user ${followeeId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export const unfollowUser = async (followerId, followeeId) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.delete(`/users/${followerId}/follow/${followeeId}`, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Unfollow user ${followeeId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export const checkFollowStatus = async (followerId, followeeId) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.get(`/users/${followerId}/follow/${followeeId}`, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Check follow status for ${followerId}/${followeeId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export const getFollowers = async (userId) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.get(`/users/${userId}/followers`, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Get followers for user ${userId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export const getFollowing = async (userId) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.get(`/users/${userId}/following`, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Get following for user ${userId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export const getFollowCounts = async (userId) => {
    const user = getUser();
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.get(`/users/${userId}/follow/counts`, {
        headers: { userId: user.id },
    }).catch(err => {
        console.error(`Get follow counts for user ${userId} error:`, err.response?.data || err.message);
        throw err;
    });
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

export default api;