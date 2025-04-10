import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

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

export const createPost = (userId, postData) =>
    api.post(`/users/${userId}/posts`, postData).catch(err => {
        console.error('Create post error:', err.response?.data || err.message);
        throw err;
    });

export const likePost = (postId) =>
    api.post(`/posts/${postId}/like`).catch(err => {
        console.error(`Like post ${postId} error:`, err.response?.data || err.message);
        throw err;
    });

// Comment APIs
export const getCommentsByPostId = (postId) =>
    api.get(`/comments/${postId}`).catch(err => {
        console.error(`Get comments for post ${postId} error:`, err.response?.data || err.message);
        throw err;
    });

export const createComment = (postId, commentData) =>
    api.post(`/comments/${postId}`, commentData).catch(err => {
        console.error(`Create comment for post ${postId} error:`, err.response?.data || err.message);
        throw err;
    });

export const updateComment = (postId, commentId, commentData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.put(`/comments/${commentId}`, commentData, {
        headers: {
            'userId': user.id
        }
    }).catch(err => {
        console.error(`Update comment ${commentId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export const deleteComment = (postId, commentId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
        return Promise.reject(new Error('User not authenticated'));
    }

    return api.delete(`/comments/${commentId}`, {
        headers: {
            'userId': user.id
        }
    }).catch(err => {
        console.error(`Delete comment ${commentId} error:`, err.response?.data || err.message);
        throw err;
    });
};

export default api;