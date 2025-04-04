import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Posts.css';

const Posts = () => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState({ description: "", files: [] });
    const [filePreview, setFilePreview] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
            fetchPosts();
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api');
            setPosts(response.data.posts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('Failed to load posts');
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleInputChange = (e) => {
        setNewPost({
            ...newPost,
            description: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 3) {
            setError('You can only upload up to 3 files');
            return;
        }

        setNewPost({
            ...newPost,
            files: selectedFiles
        });

        const previews = selectedFiles.map(file => ({
            url: URL.createObjectURL(file),
            type: file.type.startsWith('image/') ? 'image' : 'video'
        }));
        setFilePreview(previews);
        setError(null);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        setError(null);

        if (!newPost.description.trim()) {
            setError('Description cannot be empty');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('description', newPost.description);
            newPost.files.forEach(file => {
                formData.append('files', file);
            });

            const response = await axios.post(
                `http://localhost:8080/api/users/${user.id}/posts`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.error) {
                setError(response.data.error);
                return;
            }

            setNewPost({ description: "", files: [] });
            setFilePreview([]);
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            setError(error.response?.data?.error || 'Failed to create post');
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await axios.delete(`http://localhost:8080/api/${postId}`);
                fetchPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
                setError('Failed to delete post');
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading posts...</div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <header className="header">
                <div className="header-container">
                    <h1 className="logo">
                        <span className="logo-skill">Skill</span>Share
                    </h1>
                    <div className="user-section">
                        <span className="welcome-text">Welcome, <span className="username">{user?.username}</span></span>
                        <button onClick={handleLogout} className="logout-button">
                            <svg xmlns="http://www.w3.org/2000/svg" className="logout-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <div className="post-form-container">
                    <h2 className="form-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="form-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Create New Post
                    </h2>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleCreatePost} className="post-form">
                        <div className="form-group">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                className="form-textarea"
                                placeholder="Share your skills or knowledge..."
                                value={newPost.description}
                                onChange={handleInputChange}
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="files" className="form-label">Upload Media (Max 3 files)</label>
                            <input
                                type="file"
                                id="files"
                                className="form-file-input"
                                onChange={handleFileChange}
                                multiple
                                accept="image/*,video/*"
                            />
                            {filePreview.length > 0 && (
                                <div className="file-preview-container">
                                    {filePreview.map((file, index) => (
                                        <div key={index} className="file-preview">
                                            {file.type === 'image' ? (
                                                <img src={file.url} alt="Preview" className="preview-image" />
                                            ) : (
                                                <video src={file.url} className="preview-video" controls />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" className="create-post-button">
                            <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Post
                        </button>
                    </form>
                </div>

                <div className="posts-container">
                    <h2 className="posts-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="posts-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Recent Posts
                    </h2>

                    {posts.length === 0 ? (
                        <div className="no-posts-message">No posts available</div>
                    ) : (
                        <div className="posts-list">
                            {posts.map(post => (
                                <div key={post.id} className="post-card">
                                    <div className="post-header">
                                        <div className="post-user-info">
                                            <div className="post-user-avatar">
                                                {post.user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="post-user-details">
                                                <span className="post-username">{post.user.username}</span>
                                                <span className="post-date">{new Date(post.date).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {post.user.id === user.id && (
                                            <div className="post-actions">
                                                <button className="delete-post-button" onClick={() => handleDeletePost(post.id)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="post-content">
                                        <p className="post-description">{post.description}</p>
                                        {post.mediaFiles && post.mediaFiles.length > 0 && (
                                            <div className="post-media-container">
                                                {post.mediaFiles.map((media, index) => (
                                                    <div key={index} className="post-media">
                                                        {media.mediaType === 'image' ? (
                                                            <img src={media.url} alt="Post content" className="post-image" />
                                                        ) : (
                                                            <video src={media.url} className="post-video" controls />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Posts;