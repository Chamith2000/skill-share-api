import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    getPostById,
    getCommentsByPostId,
    createComment,
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

    const user = JSON.parse(localStorage.getItem('user') || 'null'); // fallback null

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await getPostById(postId);
                setPost(response.data);
            } catch (err) {
                setError('Failed to load post.');
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await getCommentsByPostId(postId);
                setComments(response.data.comments || []);
            } catch (err) {
                console.error('Error fetching comments:', err);
            }
        };

        fetchPost();
        fetchComments();
    }, [postId]);

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;

        if (!user) {
            alert('Please log in to comment.');
            return;
        }

        const commentData = {
            uid: user.id,
            text: newComment,
        };

        try {
            setCommentSubmitting(true);
            await createComment(postId, commentData);
            setNewComment('');
            const response = await getCommentsByPostId(postId);
            setComments(response.data.comments || []);
        } catch (err) {
            console.error('Failed to submit comment:', err);
            alert('Comment submission failed');
        } finally {
            setCommentSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <p>Loading post...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <Link to="/">← Back to posts</Link>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="not-found-container">
                <h2>Post Not Found</h2>
                <Link to="/">← Back to posts</Link>
            </div>
        );
    }

    return (
        <div className="post-detail-container">
            <Link to="/home-page" className="back-link">← Back to all posts</Link>

            <article className="post-content">
                {/* Instagram-style header with user info */}
                <header className="post-header">
                    <div className="user-info">
                        <div className="user-avatar">
                            <span className="avatar-placeholder"></span>
                        </div>
                        <div className="user-details">
                            <h2>{post.username || `User #${post.userId}`}</h2>
                            <span className="user-tagline">{post.tagline || 'Business Company'}</span>
                        </div>
                        <div className="post-options">
                            <span className="options-icon">⋮</span>
                        </div>
                    </div>
                </header>

                {/* Post description above media (Facebook style) */}
                <div className="post-description">
                    <p>{post.description || 'No description available.'}</p>
                    <p className="hashtags">{post.hashtags || '#business #company #mockup'}</p>
                </div>

                {/* Media section with Facebook-style grid */}
                {post.media && post.media.length > 0 && (
                    <div className={`media-gallery media-count-${post.media.length}`}>
                        {post.media.map((mediaItem, idx) => (
                            <div key={idx} className="media-item">
                                <img
                                    src={mediaItem.url}
                                    alt={`Post media ${idx + 1}`}
                                    className="media-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                                        console.error(`Failed to load image: ${mediaItem.url}`);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Post actions (like, comment, share) */}
                <div className="post-actions">
                    <button className="action-button">
                        <span className="heart-icon">❤️</span>
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
            </article>

            {/* Comment Section */}
            <section className="comments-section">
                <div className="comment-list">
                    {comments.length === 0 ? (
                        <p>No comments yet.</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="comment-item">
                                <strong>{comment.user?.username || `User #${comment.user?.id}`}</strong>
                                <p>{comment.text}</p>
                                <small>{new Date(comment.createdAt).toLocaleString()}</small>
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
                    <button onClick={handleCommentSubmit} disabled={commentSubmitting || !user}>
                        {commentSubmitting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default PostDetail;