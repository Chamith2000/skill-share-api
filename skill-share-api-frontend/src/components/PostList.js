import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts, getPostById, getCommentsByPostId, createComment, updateComment, deleteComment } from '../services/api';
import './PostList.css';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentsByPost, setCommentsByPost] = useState({});
    const [newComments, setNewComments] = useState({});
    const [commentSubmitting, setCommentSubmitting] = useState({});
    const [editingComment, setEditingComment] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    console.log('Current user:', user);

    useEffect(() => {
        const fetchPostsAndComments = async () => {
            try {
                const response = await getAllPosts();
                const postIds = response.data.posts.map((post) => post.id);
                console.log('Post IDs from getAllPosts:', postIds);

                const detailedPosts = [];
                for (const postId of postIds) {
                    try {
                        const postResponse = await getPostById(postId);
                        const postData = postResponse.data;
                        console.log(`Post ${postId} details:`, postData);
                        detailedPosts.push(postData);
                    } catch (err) {
                        console.error(`Error fetching post ${postId}:`, err);
                    }
                }

                setPosts(detailedPosts);

                const commentsData = {};
                for (const post of detailedPosts) {
                    try {
                        const commentsResponse = await getCommentsByPostId(post.id);
                        commentsData[post.id] = commentsResponse.data.comments || [];
                        console.log(`Initial comments for post ${post.id}:`, commentsData[post.id]);
                    } catch (err) {
                        console.error(`Error fetching comments for post ${post.id}:`, err);
                        commentsData[post.id] = [];
                    }
                }
                setCommentsByPost(commentsData);
            } catch (err) {
                setError('Failed to fetch posts. Please try again later.');
                console.error('Error fetching posts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPostsAndComments();
    }, []);

    const handleCommentSubmit = async (postId) => {
        const commentText = newComments[postId] || '';
        if (!commentText.trim()) return;

        if (!user) {
            alert('Please log in to comment.');
            return;
        }

        const commentData = {
            uid: Number(user.id),
            text: commentText,
        };
        console.log('Submitting comment:', { postId, commentData });

        const optimisticComment = {
            id: Date.now(),
            text: commentText,
            user: { username: user.username || 'You' },
            createdAt: new Date().toISOString(),
        };

        setCommentsByPost((prev) => {
            const newComments = [...(prev[postId] || []), optimisticComment];
            console.log('Optimistic update for post', postId, newComments);
            return { ...prev, [postId]: newComments };
        });
        setNewComments((prev) => ({ ...prev, [postId]: '' }));
        setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));

        try {
            const response = await createComment(postId, commentData);
            console.log('Create comment response:', response.data);

            const commentsResponse = await getCommentsByPostId(postId);
            console.log('Get comments response:', commentsResponse.data);

            setCommentsByPost((prev) => {
                const updated = {
                    ...prev,
                    [postId]: commentsResponse.data.comments || [],
                };
                console.log('Updated commentsByPost for post', postId, updated[postId]);
                return updated;
            });
        } catch (err) {
            const errorMsg = err.response?.data?.details || err.response?.data?.error || err.message;
            console.error('Comment submission error:', err.response?.data || err);
            alert(`Failed to submit comment: ${errorMsg}`);

            setCommentsByPost((prev) => {
                const rolledBack = (prev[postId] || []).filter(c => c.id !== optimisticComment.id);
                console.log('Rollback for post', postId, rolledBack);
                return { ...prev, [postId]: rolledBack };
            });
        } finally {
            setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
        }
    };

    // Start editing a comment
    const handleEditComment = (comment) => {
        if (!user) {
            alert('Please log in to edit comments.');
            return;
        }

        // Log comment details for debugging
        console.log('Editing comment:', comment);
        console.log('Current user:', user);

        setEditingComment(comment.id);
        setEditCommentText(comment.text);
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingComment(null);
        setEditCommentText('');
    };

    // Save edited comment
    const handleSaveEdit = async (postId, commentId) => {
        if (!editCommentText.trim()) {
            alert('Comment cannot be empty.');
            return;
        }

        try {
            const commentData = {
                text: editCommentText
            };

            // Optimistic update
            setCommentsByPost((prev) => {
                const updatedComments = (prev[postId] || []).map(c =>
                    c.id === commentId ? { ...c, text: editCommentText } : c
                );
                return { ...prev, [postId]: updatedComments };
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
            setCommentsByPost((prev) => ({
                ...prev,
                [postId]: commentsResponse.data.comments || []
            }));
        }
    };

    // Delete a comment
    const handleDeleteComment = async (postId, commentId) => {
        if (!user) {
            alert('Please log in to delete comments.');
            return;
        }

        // Log comment details for debugging
        console.log('Deleting comment ID:', commentId);
        console.log('From post ID:', postId);

        // Confirm deletion
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            // Optimistic update - remove the comment from the UI
            setCommentsByPost((prev) => {
                const filteredComments = (prev[postId] || []).filter(c => c.id !== commentId);
                return { ...prev, [postId]: filteredComments };
            });

            // Call API to delete the comment
            await deleteComment(postId, commentId);
            console.log(`Comment ${commentId} deleted successfully`);
        } catch (err) {
            console.error('Error deleting comment:', err);
            alert(`Failed to delete comment: ${err.message}`);

            // Refresh comments to restore the original state
            const commentsResponse = await getCommentsByPostId(postId);
            setCommentsByPost((prev) => ({
                ...prev,
                [postId]: commentsResponse.data.comments || []
            }));
        }
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="post-list-container">
            <h2 className="post-list-header">All Posts</h2>

            {posts.length === 0 ? (
                <div className="no-posts-message">
                    No posts available!. Be the first to create one!
                </div>
            ) : (
                <div className="posts-list">
                    {posts.map((post) => (
                        <div key={post.id} className="post-card">
                            <header className="post-header">
                                <div className="user-info">
                                    <div className="user-avatar">
                                        <span className="avatar-placeholder"></span>
                                    </div>
                                    <div className="user-details">
                                        <h3>{post.username || 'Unknown User'}</h3>
                                        <span className="user-tagline">{post.tagline || 'Business Company'}</span>
                                    </div>
                                    <div className="post-options">
                                        <span className="options-icon">⋮</span>
                                    </div>
                                </div>
                            </header>

                            <div className="post-description">
                                <p>
                                    {post.description.length > 100
                                        ? `${post.description.substring(0, 100)}...`
                                        : post.description}
                                </p>
                                <p className="hashtags">{post.hashtags || '#business #company #mockup'}</p>
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
                                <button className="action-button">
                                    <span className="heart-icon">❤️</span>
                                    <span>{post.likes || 0}</span>
                                </button>
                                <button className="action-button">
                                    <span className="comment-icon">💬</span>
                                    <span>{(commentsByPost[post.id] || []).length}</span>
                                </button>
                                <button className="action-button">
                                    <span className="share-icon">↗️</span>
                                </button>
                            </div>

                            <section className="comments-section">
                                <div className="comment-list">
                                    {(commentsByPost[post.id] || []).length === 0 ? (
                                        <p>No comments yet.</p>
                                    ) : (
                                        (commentsByPost[post.id] || []).slice(0, 3).map((comment) => (
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
                                                                onClick={() => handleSaveEdit(post.id, comment.id)}
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
                                                            <strong>{comment.user?.username || 'Unknown User'}</strong>
                                                            <div className="comment-actions">
                                                                <button
                                                                    onClick={() => handleEditComment(comment)}
                                                                    className="comment-edit-btn"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                                                    className="comment-delete-btn"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
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
                                        value={newComments[post.id] || ''}
                                        onChange={(e) =>
                                            setNewComments((prev) => ({
                                                ...prev,
                                                [post.id]: e.target.value,
                                            }))
                                        }
                                        rows={1}
                                    />
                                    <button
                                        onClick={() => handleCommentSubmit(post.id)}
                                        disabled={commentSubmitting[post.id] || !user}
                                    >
                                        {commentSubmitting[post.id] ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </section>

                            <Link to={`/posts/${post.id}`} className="view-post-link">
                                View Full Post
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostList;