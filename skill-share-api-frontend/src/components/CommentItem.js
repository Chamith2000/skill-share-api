import React, { useState } from 'react';
import { updateComment, deleteComment } from '../services/api';
import './CommentItem.css';

const CommentItem = ({ comment, postId, currentUserId, refreshComments }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleUpdate = async () => {
        if (!editedText.trim()) {
            setError('Comment cannot be empty');
            return;
        }
        try {
            setError(null);
            await updateComment(postId, comment.id, { text: editedText });
            setIsEditing(false);
            setSuccess('Comment updated successfully!');
            refreshComments();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to update comment');
            console.error('Update failed:', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Delete this comment permanently?')) {
            try {
                setError(null);
                await deleteComment(postId, comment.id);
                setSuccess('Comment deleted successfully!');
                refreshComments();
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                setError('Failed to delete comment');
                console.error('Delete failed:', err);
            }
        }
    };

    return (
        <div className="comment-item">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {isEditing ? (
                <div className="edit-comment">
                    <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="comment-textarea"
                        rows="3"
                        aria-label="Edit comment"
                    />
                    <div className="comment-actions">
                        <button onClick={handleUpdate} className="save-btn" aria-label="Save comment">
                            Save
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="cancel-btn"
                            aria-label="Cancel editing"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="comment-header">
                        <strong className="comment-username">{comment.user.username || comment.user.name || 'User'}</strong>
                        {currentUserId === comment.user.id && (
                            <div className="comment-actions">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="edit-btn"
                                    aria-label="Edit comment"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="delete-btn"
                                    aria-label="Delete comment"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="comment-text">{comment.text}</p>
                    <small className="comment-meta">
                        {new Date(comment.createdAt).toLocaleString()}
                        {comment.updatedAt && ` (Edited)`}
                    </small>
                </>
            )}
        </div>
    );
};

export default CommentItem;