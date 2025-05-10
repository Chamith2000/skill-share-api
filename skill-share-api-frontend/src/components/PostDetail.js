import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    getPostById,
    getCommentsByPostId,
    createComment,
    updateComment,
    deleteComment,
    updatePost,
    deletePost,
    toggleLike,
    getLikeStatus
} from '../services/api';
import './PostDetail.css';

const PostDetail = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [editingPost, setEditingPost] = useState(null);
    const [editPostText, setEditPostText] = useState('');
    const [likeStatus, setLikeStatus] = useState(false);
    const [likeSubmitting, setLikeSubmitting] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await getPostById(postId);
                console.log('Post data received:', response.data);
                setPost(response.data);
                setEditPostText(response.data.description);
            } catch (err) {
                setError('Failed to load post.');
                console.error('Error fetching post:', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await getCommentsByPostId(postId);
                console.log('Comments data received:', response.data);
                setComments(response.data.comments || []);
            } catch (err) {
                console.error('Error fetching comments:', err);
            }
        };

        const fetchLikeStatus = async () => {
            // Check localStorage for recent like as a fallback
            const recentLike = JSON.parse(localStorage.getItem(`like_${postId}`) || 'null');
            if (recentLike && Date.now() - recentLike.timestamp < 60000) { // Valid for 1 minute
                setLikeStatus(recentLike.liked);
            } else {
                setLikeStatus(false);
            }

            if (!user || !user.id) {
                return;
            }

            try {
                const response = await getLikeStatus(postId, user.id);
                console.log('Like status received:', response.data);
                setLikeStatus(response.data.liked);
                // Update localStorage to reflect backend state
                localStorage.setItem(`like_${postId}`, JSON.stringify({
                    liked: response.data.liked,
                    timestamp: Date.now(),
                }));
            } catch (err) {
                console.error('Error fetching like status:', err);
                // Fallback to localStorage if API fails
                if (recentLike && Date.now() - recentLike.timestamp < 60000) {
                    setLikeStatus(recentLike.liked);
                }
            }
        };

        fetchPost();
        fetchComments();
        fetchLikeStatus();
    }, [postId]);

    const handleLikeToggle = async () => {
        if (!user || !user.id) {
            alert('Please log in to like posts.');
            return;
        }

        setLikeSubmitting(true);

        try {
            const response = await toggleLike(postId, user.id);
            console.log(`Like toggled for post ${postId}:`, response.data);
            setLikeStatus(response.data.liked);
            setPost((prev) => {
                if (prev) {
                    return { ...prev, likes: response.data.likeCount };
                }
                return prev;
            });
            // Update localStorage
            localStorage.setItem(`like_${postId}`, JSON.stringify({
                liked: response.data.liked,
                timestamp: Date.now(),
            }));
        } catch (err) {
            console.error('Error toggling like:', err);
            alert('Failed to update like status. Please try again.');
        } finally {
            setLikeSubmitting(false);
        }
    };

    const getPostUsername = () => {
        if (post) {
            if (post.username) return post.username;
            if (post.user && post.user.username) return post.user.username;
            if (user && user.id === post.userId && user.username) return user.username;
            return `User #${post.userId}`;
        }
        return 'Unknown User';
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;

        if (!user) {
            alert('Please log in to comment.');
            return;
        }

        const commentData = {
            uid: Number(user.id),
            text: newComment,
        };

        const optimisticComment = {
            id: Date.now(),
            text: newComment,
            user: { username: user.username || 'You' },
            createdAt: new Date().toISOString(),
        };

        setComments((prev) => [...prev, optimisticComment]);
        setNewComment('');
        setCommentSubmitting(true);

        try {
            await createComment(postId, commentData);
            const response = await getCommentsByPostId(postId);
            setComments(response.data.comments || []);
        } catch (err) {
            const errorMsg = err.response?.data?.details || err.response?.data?.error || err.message;
            console.error('Comment submission error:', err.response?.data || err);
            alert(`Failed to submit comment: ${errorMsg}`);
            setComments((prev) => prev.filter(c => c.id !== optimisticComment.id));
        } finally {
            setCommentSubmitting(false);
        }
    };

    const handleEditComment = (comment) => {
        if (!user) {
            alert('Please log in to edit comments.');
            return;
        }

        if (user.id !== comment.userId && user.id !== comment.uid) {
            alert('You can only edit your own comments.');
            return;
        }

        setEditingComment(comment.id);
        setEditCommentText(comment.text);
    };

    const handleCancelEdit = () => {
        setEditingComment(null);
        setEditCommentText('');
    };

    const handleSaveEdit = async (commentId) => {
        if (!editCommentText.trim()) {
            alert('Comment cannot be empty.');
            return;
        }

        try {
            const commentData = {
                text: editCommentText
            };

            setComments((prev) => {
                const updatedComments = prev.map(c =>
                    c.id === commentId ? { ...c, text: editCommentText } : c
                );
                return updatedComments;
            });

            await updateComment(postId, commentId, commentData);
            console.log(`Comment ${commentId} updated successfully`);
            setEditingComment(null);
            setEditCommentText('');
        } catch (err) {
            console.error('Error updating comment:', err);
            alert(`Failed to update comment: ${err.message}`);
            const commentsResponse = await getCommentsByPostId(postId);
            setComments(commentsResponse.data.comments || []);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!user) {
            alert('Please log in to delete comments.');
            return;
        }

        const commentToDelete = comments.find(c => c.id === commentId);
        if (!commentToDelete) {
            alert('Comment not found.');
            return;
        }

        if (user.id !== commentToDelete.userId && user.id !== commentToDelete.uid) {
            alert('You can only delete your own comments.');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            setComments((prev) => prev.filter(c => c.id !== commentId));
            await deleteComment(postId, commentId);
            console.log(`Comment ${commentId} deleted successfully`);
        } catch (err) {
            console.error('Error deleting comment:', err);
            alert(`Failed to delete comment: ${err.message}`);
            const commentsResponse = await getCommentsByPostId(postId);
            setComments(commentsResponse.data.comments || []);
        }
    };

    const handleEditPost = () => {
        if (!user) {
            alert('Please log in to edit posts.');
            return;
        }

        if (user.id !== post.userId) {
            alert('You can only edit your own posts.');
            return;
        }

        setEditingPost(post.id);
        setEditPostText(post.description);
        setDropdownOpen(false);
    };

    const handleCancelPostEdit = () => {
        setEditingPost(null);
        setEditPostText(post.description);
    };

    const handleSavePostEdit = async () => {
        if (!editPostText.trim()) {
            alert('Post description cannot be empty.');
            return;
        }

        try {
            const postData = {
                description: editPostText
            };

            setPost((prev) => ({ ...prev, description: editPostText }));
            await updatePost(postId, postData);
            console.log(`Post ${postId} updated successfully`);
            setEditingPost(null);
        } catch (err) {
            console.error('Error updating post:', err);
            alert(`Failed to update post: ${err.message}`);
            try {
                const postResponse = await getPostById(postId);
                setPost(postResponse.data);
                setEditPostText(postResponse.data.description);
            } catch (refreshErr) {
                console.error('Error refreshing post data:', refreshErr);
            }
        }
    };

    const handleDeletePost = async () => {
        if (!user) {
            alert('Please log in to delete posts.');
            return;
        }

        if (user.id !== post.userId) {
            alert('You can only delete your own posts.');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            await deletePost(postId);
            console.log(`Post ${postId} deleted successfully`);
            window.location.href = '/home-page';
        } catch (err) {
            console.error('Error deleting post:', err);
            alert(`Failed to delete post: ${err.message}`);
        }
    };

    const handleToggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const canEditPost = () => {
        return user && post && user.id === post.userId;
    };

    const canEditComment = (comment) => {
        return user && (user.id === comment.userId || user.id === comment.uid);
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <Link to="/home-page">← Back to posts</Link>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="not-found-container">
                <h2>Post Not Found</h2>
                <Link to="/home-page">← Back to posts</Link>
            </div>
        );
    }

    return (
        <div className="post-detail-container">
            <Link to="/home-page" className="back-link">← Back to all posts</Link>

            <div className="post-card">
                <header className="post-header">
                    <div className="user-info">
                        <div className="user-avatar">
                            <span className="avatar-placeholder"></span>
                        </div>
                        <div className="user-details">
                            <h3>{getPostUsername()}</h3>
                            <span className="user-tagline">{post.tagline || 'Business Company'}</span>
                        </div>
                        {canEditPost() && (
                            <div className="post-options">
                                <div
                                    className={`dropdown ${dropdownOpen ? 'show-dropdown' : ''}`}
                                    ref={dropdownRef}
                                >
                                    <span
                                        className="options-icon"
                                        onClick={handleToggleDropdown}
                                    >
                                        ⋮
                                    </span>
                                    <div className="dropdown-content">
                                        <button onClick={handleEditPost} className="edit-button">Edit Post</button>
                                        <button onClick={handleDeletePost} className="delete-button">Delete Post</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <div className="post-description">
                    {editingPost === post.id ? (
                        <div className="post-edit-form">
                            <textarea
                                value={editPostText}
                                onChange={(e) => setEditPostText(e.target.value)}
                                rows={3}
                                className="post-edit-textarea"
                            />
                            <div className="post-edit-actions">
                                <button
                                    onClick={handleSavePostEdit}
                                    className="edit-save-btn"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancelPostEdit}
                                    className="edit-cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p>{post.description}</p>
                            <p className="hashtags">{post.hashtags || '#business #company #mockup'}</p>
                        </>
                    )}
                </div>

                {post.media && post.media.length > 0 ? (
                    <div className={`media-gallery media-count-${post.media.length}`}>
                        {post.media.map((mediaItem, idx) => (
                            <div key={idx} className="media-item">
                                {mediaItem.mediaType === 'video' ? (
                                    <video
                                        src={mediaItem.url}
                                        className="media-video"
                                        controls
                                        muted={false}
                                        playsInline
                                        preload="metadata"
                                        onError={(e) => {
                                            e.target.poster = 'https://placehold.co/300x300?text=Video+Not+Found';
                                            console.error(`Failed to load video for post ${post.id}: ${mediaItem.url}`);
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={mediaItem.url}
                                        alt={`Post media ${idx + 1}`}
                                        className="media-image"
                                        onError={(e) => {
                                            e.target.src = 'https://placehold.co/300x300?text=Image+Not+Found';
                                            console.error(`Failed to load image for post ${post.id}: ${mediaItem.url}`);
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="media-placeholder">
                        <p>No media available</p>
                    </div>
                )}

                <div className="post-actions">
                    <button
                        className={`action-button ${likeStatus ? 'liked' : ''}`}
                        onClick={handleLikeToggle}
                        disabled={likeSubmitting}
                    >
                        <span className="heart-icon">
                            {likeStatus ? '❤️' : '🤍'}
                        </span>
                        <span>{post.likes || 0}</span>
                    </button>
                    <button className="action-button">
                        <span className="comment-icon">💬</span>
                        <span>{comments.length}</span>
                    </button>
                </div>

                <section className="comments-section">
                    <div className="comment-list">
                        {comments.length === 0 ? (
                            <p>No comments yet.</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="comment-item">
                                    {editingComment === comment.id ? (
                                        <div className="comment-edit-form">
                                            <textarea
                                                value={editCommentText}
                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                rows={2}
                                                className="comment-edit-textarea"
                                            />
                                            <div className="comment-edit-actions">
                                                <button
                                                    onClick={() => handleSaveEdit(comment.id)}
                                                    className="edit-save-btn"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="edit-cancel-btn"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="comment-header">
                                                <strong>
                                                    {comment.user?.username ||
                                                        (user && (user.id === comment.userId || user.id === comment.uid) ?
                                                            user.username : 'Unknown User')}
                                                </strong>
                                                {canEditComment(comment) && (
                                                    <div className="comment-actions">
                                                        <button
                                                            onClick={() => handleEditComment(comment)}
                                                            className="comment-edit-btn"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="comment-delete-btn"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p>{comment.text}</p>
                                            <small>{new Date(comment.createdAt).toLocaleString()}</small>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="comment-form">
                        <textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={1}
                        />
                        <button
                            onClick={handleCommentSubmit}
                            disabled={commentSubmitting || !user}
                        >
                            {commentSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PostDetail;