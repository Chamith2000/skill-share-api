import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts, getPostById, getCommentsByPostId, createComment, updateComment, deleteComment, updatePost, deletePost, toggleLike, getLikeStatus, followUser, unfollowUser, checkFollowStatus } from '../services/api';
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
    const [editingPost, setEditingPost] = useState(null);
    const [editPostText, setEditPostText] = useState('');
    const [likeStatus, setLikeStatus] = useState({});
    const [likeSubmitting, setLikeSubmitting] = useState({});
    const [followStatus, setFollowStatus] = useState({});
    const [followSubmitting, setFollowSubmitting] = useState({});
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const dropdownRef = useRef(null); // Ref to track dropdown element

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    console.log('Current user:', user);

    // Handle clicks outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

        const fetchLikeStatus = async () => {
            if (!user || !user.id) return;

            const status = {};
            for (const post of posts) {
                try {
                    const response = await getLikeStatus(post.id, user.id);
                    status[post.id] = response.data.liked;
                } catch (err) {
                    console.error(`Error fetching like status for post ${post.id}:`, err);
                    status[post.id] = false;
                }
            }
            setLikeStatus(status);
        };

        if (posts.length > 0 && user && user.id) {
            fetchLikeStatus();
            fetchFollowStatus();
        }
    }, []);

    const fetchFollowStatus = async () => {
        if (!user || !user.id) return;

        const status = {};
        for (const post of posts) {
            if (post.userId !== user.id) {
                try {
                    const response = await checkFollowStatus(user.id, post.userId);
                    status[post.userId] = response.data.following;
                } catch (err) {
                    console.error(`Error fetching follow status for user ${post.userId}:`, err);
                    status[post.userId] = false;
                }
            }
        }
        setFollowStatus(status);
    };

    const handleFollowToggle = async (postUserId) => {
        if (!user || !user.id) {
            alert('Please log in to follow users.');
            return;
        }

        if (user.id === postUserId) {
            return;
        }

        setFollowSubmitting((prev) => ({ ...prev, [postUserId]: true }));

        try {
            const isCurrentlyFollowing = followStatus[postUserId] || false;

            if (isCurrentlyFollowing) {
                await unfollowUser(user.id, postUserId);
                setFollowStatus((prev) => ({ ...prev, [postUserId]: false }));
                console.log(`Unfollowed user ${postUserId}`);
            } else {
                await followUser(user.id, postUserId);
                setFollowStatus((prev) => ({ ...prev, [postUserId]: true }));
                console.log(`Followed user ${postUserId}`);
            }
        } catch (err) {
            console.error('Error toggling follow status:', err);
            alert('Failed to update follow status. Please try again.');
        } finally {
            setFollowSubmitting((prev) => ({ ...prev, [postUserId]: false }));
        }
    };

    const handleLikeToggle = async (postId) => {
        if (!user || !user.id) {
            alert('Please log in to like posts.');
            return;
        }

        setLikeSubmitting((prev) => ({ ...prev, [postId]: true }));

        try {
            const response = await toggleLike(postId, user.id);
            console.log(`Like toggled for post ${postId}:`, response.data);

            setLikeStatus((prev) => ({ ...prev, [postId]: response.data.liked }));

            setPosts((prev) => {
                return prev.map(p => {
                    if (p.id === postId) {
                        return { ...p, likeCount: response.data.likeCount };
                    }
                    return p;
                });
            });
        } catch (err) {
            console.error('Error toggling like:', err);
            alert('Failed to update like status. Please try again.');
        } finally {
            setLikeSubmitting((prev) => ({ ...prev, [postId]: false }));
        }
    };

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

    const handleEditComment = (comment) => {
        if (!user) {
            alert('Please log in to edit comments.');
            return;
        }

        console.log('Editing comment:', comment);
        console.log('Current user:', user);

        setEditingComment(comment.id);
        setEditCommentText(comment.text);
    };

    const handleCancelEdit = () => {
        setEditingComment(null);
        setEditCommentText('');
    };

    const handleSaveEdit = async (postId, commentId) => {
        if (!editCommentText.trim()) {
            alert('Comment cannot be empty.');
            return;
        }

        try {
            const commentData = {
                text: editCommentText
            };

            setCommentsByPost((prev) => {
                const updatedComments = (prev[postId] || []).map(c =>
                    c.id === commentId ? { ...c, text: editCommentText } : c
                );
                return { ...prev, [postId]: updatedComments };
            });

            await updateComment(postId, commentId, commentData);
            console.log(`Comment ${commentId} updated successfully`);

            setEditingComment(null);
            setEditCommentText('');
        } catch (err) {
            console.error('Error updating comment:', err);
            alert(`Failed to update comment: ${err.message}`);

            const commentsResponse = await getCommentsByPostId(postId);
            setCommentsByPost((prev) => ({
                ...prev,
                [postId]: commentsResponse.data.comments || []
            }));
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!user) {
            alert('Please log in to delete comments.');
            return;
        }

        console.log('Deleting comment ID:', commentId);
        console.log('From post ID:', postId);

        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            setCommentsByPost((prev) => {
                const filteredComments = (prev[postId] || []).filter(c => c.id !== commentId);
                return { ...prev, [postId]: filteredComments };
            });

            await deleteComment(postId, commentId);
            console.log(`Comment ${commentId} deleted successfully`);
        } catch (err) {
            console.error('Error deleting comment:', err);
            alert(`Failed to delete comment: ${err.message}`);

            const commentsResponse = await getCommentsByPostId(postId);
            setCommentsByPost((prev) => ({
                ...prev,
                [postId]: commentsResponse.data.comments || []
            }));
        }
    };

    const handleEditPost = (post) => {
        if (!user) {
            alert('Please log in to edit posts.');
            return;
        }

        if (user.id !== post.userId) {
            alert('You can only edit your own posts.');
            return;
        }

        console.log('Editing post:', post);
        setEditingPost(post.id);
        setEditPostText(post.description);
        setDropdownOpen(null); // Close dropdown after clicking Edit
    };

    const handleCancelPostEdit = () => {
        setEditingPost(null);
        setEditPostText('');
    };

    const handleSavePostEdit = async (postId) => {
        if (!editPostText.trim()) {
            alert('Post description cannot be empty.');
            return;
        }

        try {
            const postData = {
                description: editPostText
            };

            setPosts((prev) => {
                return prev.map(p =>
                    p.id === postId ? { ...p, description: editPostText } : p
                );
            });

            await updatePost(postId, postData);
            console.log(`Post ${postId} updated successfully`);

            setEditingPost(null);
            setEditPostText('');
        } catch (err) {
            console.error('Error updating post:', err);
            alert(`Failed to update post: ${err.message}`);

            try {
                const postResponse = await getPostById(postId);
                setPosts((prev) => {
                    return prev.map(p =>
                        p.id === postId ? postResponse.data : p
                    );
                });
            } catch (refreshErr) {
                console.error('Error refreshing post data:', refreshErr);
            }
        }
    };

    const handleDeletePost = async (postId) => {
        if (!user) {
            alert('Please log in to delete posts.');
            return;
        }

        const postToDelete = posts.find(p => p.id === postId);
        if (!postToDelete) {
            alert('Post not found.');
            return;
        }

        if (user.id !== postToDelete.userId) {
            alert('You can only delete your own posts.');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            setPosts((prev) => prev.filter(p => p.id !== postId));

            await deletePost(postId);
            console.log(`Post ${postId} deleted successfully`);
            setDropdownOpen(null); // Close dropdown after clicking Delete
        } catch (err) {
            console.error('Error deleting post:', err);
            alert(`Failed to delete post: ${err.message}`);

            try {
                const response = await getAllPosts();
                const postIds = response.data.posts.map((post) => post.id);

                const detailedPosts = [];
                for (const id of postIds) {
                    try {
                        const postResponse = await getPostById(id);
                        detailedPosts.push(postResponse.data);
                    } catch (fetchErr) {
                        console.error(`Error fetching post ${id}:`, fetchErr);
                    }
                }
                setPosts(detailedPosts);
            } catch (refreshErr) {
                console.error('Error refreshing posts:', refreshErr);
            }
        }
    };

    const handleToggleDropdown = (postId) => {
        setDropdownOpen((prev) => (prev === postId ? null : postId));
    };

    const canEditPost = (post) => {
        return user && user.id === post.userId;
    };

    const isOwnPost = (post) => {
        return user && user.id === post.userId;
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
                    No posts available! Be the first to create one!
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
                                        <div className="username-with-follow">
                                            <h3>{post.username || 'Unknown User'}</h3>
                                            {!isOwnPost(post) && user && (
                                                <button
                                                    className={`follow-button ${followStatus[post.userId] ? 'following' : ''}`}
                                                    onClick={() => handleFollowToggle(post.userId)}
                                                    disabled={followSubmitting[post.userId]}
                                                >
                                                    {followSubmitting[post.userId]
                                                        ? '...'
                                                        : followStatus[post.userId]
                                                            ? 'Unfollow'
                                                            : 'Follow'
                                                    }
                                                </button>
                                            )}
                                        </div>
                                        <span className="user-tagline">{post.tagline || 'Business Company'}</span>
                                    </div>
                                    {canEditPost(post) && (
                                        <div className="post-options">
                                            <div
                                                className={`dropdown ${dropdownOpen === post.id ? 'show-dropdown' : ''}`}
                                                ref={dropdownRef}
                                            >
                                                <span
                                                    className="options-icon"
                                                    onClick={() => handleToggleDropdown(post.id)}
                                                >
                                                    ⋮
                                                </span>
                                                <div className="dropdown-content">
                                                    <button onClick={() => handleEditPost(post)} className="edit-button">Edit Post</button>
                                                    <button onClick={() => handleDeletePost(post.id)} className="delete-button">Delete Post</button>
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
                                                onClick={() => handleSavePostEdit(post.id)}
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
                                        <p>
                                            {post.description.length > 100
                                                ? `${post.description.substring(0, 100)}...`
                                                : post.description}
                                        </p>
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
                                                        e.target.poster = 'https://via.placeholder.com/300?text=Video+Not+Found';
                                                        console.error(`Failed to load video for post ${post.id}: ${mediaItem.url}`);
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src={mediaItem.url}
                                                    alt={`Post media ${idx + 1}`}
                                                    className="media-image"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
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
                                    className={`action-button ${likeStatus[post.id] ? 'liked' : ''}`}
                                    onClick={() => handleLikeToggle(post.id)}
                                    disabled={likeSubmitting[post.id]}
                                >
                                    <span className="heart-icon">
                                        {likeStatus[post.id] ? '❤️' : '🤍'}
                                    </span>
                                    <span>{post.likeCount || 0}</span>
                                </button>
                                <button className="action-button">
                                    <span className="comment-icon">💬</span>
                                    <span>{(commentsByPost[post.id] || []).length}</span>
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