import React, { useEffect, useState } from 'react';
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

    const user = JSON.parse(localStorage.getItem('user') || 'null');

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

        fetchPost();
        fetchComments();

        const fetchLikeStatus = async () => {
            if (!user || !user.id || !post) return;

            try {
                const response = await getLikeStatus(postId, user.id);
                setLikeStatus(response.data.liked);
            } catch (err) {
                console.error('Error fetching like status:', err);
                setLikeStatus(false);
            }
        };

        if (post && user && user.id) {
            fetchLikeStatus();
        }
    }, [postId]);

    const handleLikeToggle = async () => {
        if (!user || !user.id) {
            alert('Please log in to like posts.');
            return;
        }

        setLikeSubmitting(true);

        try {
            // Call API to toggle like
            const response = await toggleLike(postId, user.id);
            console.log(`Like toggled for post ${postId}:`, response.data);

            // Update like status based on server response
            setLikeStatus(response.data.liked);

            // Update post with new like count
            setPost((prev) => {
                if (prev) {
                    return { ...prev, likes: response.data.likeCount };
                }
                return prev;
            });
        } catch (err) {
            console.error('Error toggling like:', err);
            alert('Failed to update like status. Please try again.');
        } finally {
            setLikeSubmitting(false);
        }
    };

    // Get username from post or user object based on userId
    const getPostUsername = () => {
        if (post) {
            // First check if post has username directly
            if (post.username) return post.username;

            // Otherwise check if post has user object with username
            if (post.user && post.user.username) return post.user.username;

            // If the post is by the current logged-in user
            if (user && user.id === post.userId && user.username) return user.username;

            // Last resort: show user ID
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

        // Optimistic update
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

            // Rollback optimistic update
            setComments((prev) => prev.filter(c => c.id !== optimisticComment.id));
        } finally {
            setCommentSubmitting(false);
        }
    };

    // Start editing a comment
    const handleEditComment = (comment) => {
        if (!user) {
            alert('Please log in to edit comments.');
            return;
        }

        // Check if the current user is the owner of the comment
        if (user.id !== comment.userId && user.id !== comment.uid) {
            alert('You can only edit your own comments.');
            return;
        }

        setEditingComment(comment.id);
        setEditCommentText(comment.text);
    };

    // Cancel editing comment
    const handleCancelEdit = () => {
        setEditingComment(null);
        setEditCommentText('');
    };

    // Save edited comment
    const handleSaveEdit = async (commentId) => {
        if (!editCommentText.trim()) {
            alert('Comment cannot be empty.');
            return;
        }

        try {
            const commentData = {
                text: editCommentText
            };

            // Optimistic update
            setComments((prev) => {
                const updatedComments = prev.map(c =>
                    c.id === commentId ? { ...c, text: editCommentText } : c
                );
                return updatedComments;
            });

            // Call API to update comment
            await updateComment(postId, commentId, commentData);
            console.log(`Comment ${commentId} updated successfully`);

            // Reset edit state
            setEditingComment(null);
            setEditCommentText('');
        } catch (err) {
            console.error('Error updating comment:', err);
            alert(`Failed to update comment: ${err.message}`);

            // Refresh comments to get the original state
            const commentsResponse = await getCommentsByPostId(postId);
            setComments(commentsResponse.data.comments || []);
        }
    };

    // Delete a comment
    const handleDeleteComment = async (commentId) => {
        if (!user) {
            alert('Please log in to delete comments.');
            return;
        }

        // Find the comment to check ownership
        const commentToDelete = comments.find(c => c.id === commentId);
        if (!commentToDelete) {
            alert('Comment not found.');
            return;
        }

        // Check if the current user is the owner of the comment
        if (user.id !== commentToDelete.userId && user.id !== commentToDelete.uid) {
            alert('You can only delete your own comments.');
            return;
        }

        // Confirm deletion
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            // Optimistic update - remove the comment from the UI
            setComments((prev) => prev.filter(c => c.id !== commentId));

            // Call API to delete the comment
            await deleteComment(postId, commentId);
            console.log(`Comment ${commentId} deleted successfully`);
        } catch (err) {
            console.error('Error deleting comment:', err);
            alert(`Failed to delete comment: ${err.message}`);

            // Refresh comments to restore the original state
            const commentsResponse = await getCommentsByPostId(postId);
            setComments(commentsResponse.data.comments || []);
        }
    };

    // Start editing a post
    const handleEditPost = () => {
        if (!user) {
            alert('Please log in to edit posts.');
            return;
        }

        // Check if the current user is the owner of the post
        if (user.id !== post.userId) {
            alert('You can only edit your own posts.');
            return;
        }

        setEditingPost(post.id);
        setEditPostText(post.description);
    };

    // Cancel editing post
    const handleCancelPostEdit = () => {
        setEditingPost(null);
        setEditPostText(post.description);
    };

    // Save edited post
    const handleSavePostEdit = async () => {
        if (!editPostText.trim()) {
            alert('Post description cannot be empty.');
            return;
        }

        try {
            const postData = {
                description: editPostText
            };

            // Optimistic update
            setPost((prev) => ({ ...prev, description: editPostText }));

            // Call API to update post
            await updatePost(postId, postData);
            console.log(`Post ${postId} updated successfully`);

            // Reset edit state
            setEditingPost(null);
        } catch (err) {
            console.error('Error updating post:', err);
            alert(`Failed to update post: ${err.message}`);

            // Refresh post to get the original state
            try {
                const postResponse = await getPostById(postId);
                setPost(postResponse.data);
                setEditPostText(postResponse.data.description);
            } catch (refreshErr) {
                console.error('Error refreshing post data:', refreshErr);
            }
        }
    };

    // Delete a post
    const handleDeletePost = async () => {
        if (!user) {
            alert('Please log in to delete posts.');
            return;
        }

        // Check if the current user is the owner of the post
        if (user.id !== post.userId) {
            alert('You can only delete your own posts.');
            return;
        }

        // Confirm deletion
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            // Call API to delete the post
            await deletePost(postId);
            console.log(`Post ${postId} deleted successfully`);
            // Redirect to home page after deletion
            window.location.href = '/home-page';
        } catch (err) {
            console.error('Error deleting post:', err);
            alert(`Failed to delete post: ${err.message}`);
        }
    };

    // Check if user can edit/delete a post
    const canEditPost = () => {
        return user && post && user.id === post.userId;
    };

    // Check if user can edit/delete a comment
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
                                <div className="dropdown">
                                    <span className="options-icon">⋮</span>
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
                                <img
                                    src={mediaItem.url}
                                    alt={`Post media ${idx + 1}`}
                                    className="media-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                                        console.error(`Failed to load image for post ${post.id}: ${mediaItem.url}`);
                                    }}
                                />
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
                    <button className="action-button">
                        <span className="share-icon">↗️</span>
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