import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PostManagement.css';

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ description: '' });
    const [files, setFiles] = useState([]);
    const [comments, setComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(1); // Mock user ID - in a real app, this would come from authentication
    const [likedPosts, setLikedPosts] = useState({});

    // Fetch all posts when component mounts
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/posts');

            // Fix: Check both response.data.posts and response.data.data for compatibility
            const postsData = response.data.posts || response.data.data || [];
            setPosts(postsData);

            // Initialize comments state
            const commentsState = {};
            for (const post of postsData) {
                await fetchComments(post.id, commentsState);
            }

            setLoading(false);
        } catch (err) {
            setError('Failed to fetch posts. Please try again later.');
            setLoading(false);
            console.error('Error fetching posts:', err);
        }
    };

    const fetchComments = async (postId, commentsState = {}) => {
        try {
            const response = await axios.get(`/api/comments/${postId}`);
            // Fix: Check for comments in the response structure
            const commentsData = response.data.comments || response.data;

            if (commentsState) {
                commentsState[postId] = commentsData;
            } else {
                setComments(prevComments => ({
                    ...prevComments,
                    [postId]: commentsData
                }));
            }
            // Initialize new comment field for this post
            setNewComments(prev => ({
                ...prev,
                [postId]: ''
            }));
        } catch (err) {
            console.error(`Error fetching comments for post ${postId}:`, err);
        }
    };

    const handlePostChange = (e) => {
        setNewPost({ ...newPost, description: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleCommentChange = (postId, value) => {
        setNewComments({
            ...newComments,
            [postId]: value
        });
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('description', newPost.description);

            files.forEach(file => {
                formData.append('files', file);
            });

            await axios.post(`/api/users/${userId}/posts`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Reset form and refresh posts
            setNewPost({ description: '' });
            setFiles([]);
            fetchPosts();
        } catch (err) {
            setError('Failed to create post. Please try again.');
            console.error('Error creating post:', err);
        }
    };

    const handleCreateComment = async (postId) => {
        try {
            const comment = {
                uid: userId,
                uname: "User", // You might want to get this from user profile
                text: newComments[postId]
            };

            await axios.post(`/api/comments/${postId}`, comment);

            // Reset comment input and refresh comments
            setNewComments({
                ...newComments,
                [postId]: ''
            });
            fetchComments(postId);
        } catch (err) {
            console.error('Error creating comment:', err);
        }
    };

    const handleEditComment = async (commentId, postId, content) => {
        try {
            await axios.put(`/api/comments/${commentId}/${userId}`, {
                uid: userId,
                uname: "User", // You might want to get this from user profile
                text: content
            });
            fetchComments(postId);
        } catch (err) {
            console.error('Error updating comment:', err);
        }
    };

    const handleDeleteComment = async (commentId, postId) => {
        try {
            await axios.delete(`/api/comments/${commentId}/${userId}`);
            fetchComments(postId);
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`/api/${postId}`);
            fetchPosts();
        } catch (err) {
            console.error('Error deleting post:', err);
        }
    };

    const handleLikePost = (postId) => {
        // Toggle like status for the post
        setLikedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));

        // In a real app, you would make an API call to update like status on the backend
    };

    const handleSharePost = (post) => {
        // This is a mock implementation for share functionality
        navigator.clipboard.writeText(`Check out this post: ${window.location.origin}/post/${post.id}`);
        alert('Post link copied to clipboard!');
    };

    if (loading) return <div className="loading">Loading posts...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="post-management">
            <h1>Social Feed</h1>

            {/* Create Post Form */}
            <div className="create-post">
                <h2>Create a New Post</h2>
                <form onSubmit={handleCreatePost}>
                    <textarea
                        placeholder="What's on your mind?"
                        value={newPost.description}
                        onChange={handlePostChange}
                        required
                    />
                    <div className="file-input">
                        <label htmlFor="file-upload" className="custom-file-upload">
                            <i className="fa fa-image"></i> Add Photos
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                        />
                        {files.length > 0 && (
                            <span className="file-count">{files.length} file(s) selected</span>
                        )}
                    </div>
                    <button type="submit" className="post-button">Post</button>
                </form>
            </div>

            {/* Posts List */}
            <div className="posts-container">
                {posts.length === 0 ? (
                    <div className="no-posts">No posts yet. Be the first to share!</div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="post-card">
                            <div className="post-header">
                                <div className="post-user-info">
                                    <div className="avatar"></div>
                                    <div>
                                        <div className="username">{post.user ? post.user.name : 'User'}</div>
                                        <div className="post-date">{new Date(post.date || post.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                                {(post.userId === userId || (post.user && post.user.id === userId)) && (
                                    <div className="post-actions">
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="delete-button"
                                        >
                                            <i className="fa fa-trash"></i>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="post-content">
                                <p>{post.description}</p>
                                {/* Handle different media property names */}
                                {(post.mediaFiles || post.mediaUrls) && (post.mediaFiles || post.mediaUrls).length > 0 && (
                                    <div className="post-media">
                                        {(post.mediaFiles || []).map((media, index) => (
                                            <img key={index} src={media.url} alt={`Post media ${index}`} />
                                        ))}
                                        {(post.mediaUrls || []).map((url, index) => (
                                            <img key={index} src={url} alt={`Post media ${index}`} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="post-stats">
                                <span>{post.likesCount || Object.keys(likedPosts).filter(id => likedPosts[id]).length || 0} likes</span>
                                <span>{comments[post.id]?.length || 0} comments</span>
                            </div>

                            <div className="post-actions-bar">
                                <button
                                    className={`action-button ${likedPosts[post.id] ? 'liked' : ''}`}
                                    onClick={() => handleLikePost(post.id)}
                                >
                                    <i className={`fa ${likedPosts[post.id] ? 'fa-thumbs-up' : 'fa-thumbs-o-up'}`}></i> Like
                                </button>
                                <button className="action-button">
                                    <i className="fa fa-comment-o"></i> Comment
                                </button>
                                <button
                                    className="action-button"
                                    onClick={() => handleSharePost(post)}
                                >
                                    <i className="fa fa-share"></i> Share
                                </button>
                            </div>

                            {/* Comments Section */}
                            <div className="comments-section">
                                {comments[post.id] && comments[post.id].length > 0 && (
                                    <div className="comments-list">
                                        {comments[post.id].map(comment => (
                                            <div key={comment.id} className="comment">
                                                <div className="comment-avatar"></div>
                                                <div className="comment-content">
                                                    <div className="comment-user">{comment.userName || comment.uname || 'User'}</div>
                                                    <div className="comment-text">{comment.content || comment.text}</div>
                                                    <div className="comment-actions">
                                                        <span className="comment-date">
                                                            {new Date(comment.createdAt || comment.date).toLocaleString()}
                                                        </span>
                                                        {(comment.userId === userId || comment.uid === userId) && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        const newContent = prompt('Edit your comment:', comment.content || comment.text);
                                                                        if (newContent) handleEditComment(comment.id, post.id, newContent);
                                                                    }}
                                                                    className="comment-action"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id, post.id)}
                                                                    className="comment-action"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Comment Form */}
                                <div className="add-comment">
                                    <div className="comment-avatar"></div>
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        value={newComments[post.id] || ''}
                                        onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && newComments[post.id]?.trim()) {
                                                handleCreateComment(post.id);
                                            }
                                        }}
                                    />
                                    <button
                                        className="send-comment"
                                        onClick={() => handleCreateComment(post.id)}
                                        disabled={!newComments[post.id]?.trim()}
                                    >
                                        <i className="fa fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PostManagement;
