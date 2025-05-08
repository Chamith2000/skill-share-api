import React, { useEffect, useState } from 'react';
import { getCommentsByPostId, createComment } from '../services/api';
import CommentItem from './CommentItem';
import './CommentList.css';

const CommentList = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const userObj = JSON.parse(localStorage.getItem('user') || 'null');
    const currentUserId = userObj ? userObj.id : null;

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await getCommentsByPostId(postId);
            setComments(response.data.comments || []);
            setLoading(false);
        } catch (error) {
            setError('Error fetching comments');
            setLoading(false);
            console.error('Error fetching comments:', error);
        }
    };

    const handleAddComment = async () => {
        if (!currentUserId) {
            setError('Please log in to add a comment');
            return;
        }
        if (!newComment.trim()) {
            setError('Comment cannot be empty');
            return;
        }
        try {
            setError(null);
            setLoading(true);
            const response = await createComment(postId, { text: newComment, uid: currentUserId });
            setNewComment('');
            setSuccess('Comment added successfully!');
            setComments((prevComments) => [...prevComments, response.data.comment]);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Error adding comment');
            console.error('Error adding comment:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="comment-list">
            <h4>Comments</h4>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {loading && (
                <div className="loading">
                    <span className="loading-spinner"></span> Loading...
                </div>
            )}
            {comments.length > 0 ? (
                comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        postId={postId}
                        currentUserId={currentUserId}
                        refreshComments={fetchComments}
                    />
                ))
            ) : (
                !loading && <p className="no-comments">No comments yet.</p>
            )}
            <div className="comment-form">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={currentUserId ? 'Write a comment...' : 'Log in to comment'}
                    className="comment-input"
                    rows="3"
                    aria-label="Write a comment"
                    disabled={!currentUserId}
                />
                <button
                    onClick={handleAddComment}
                    className="add-comment-btn"
                    disabled={loading || !currentUserId}
                    aria-label="Add comment"
                >
                    Add Comment
                </button>
            </div>
        </div>
    );
};

export default CommentList;