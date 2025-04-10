import React, { useState } from 'react';
import { updateComment, deleteComment } from '../services/api';

const CommentItem = ({ comment, postId, currentUserId, refreshComments }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);

    const handleUpdate = async () => {
        try {
            await updateComment(postId, comment.id, { text: editedText });
            setIsEditing(false);
            refreshComments();  // Function to refresh comments after updating
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const handleDelete = async () => {
        if(window.confirm('Delete this comment permanently?')) {
            try {
                await deleteComment(postId, comment.id);
                refreshComments();  // Function to refresh comments after deleting
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }
    };

    return (
        <div className="comment-item">
            {isEditing ? (
                <>
                    <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                    />
                    <button onClick={handleUpdate}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </>
            ) : (
                <>
                    <div className="comment-header">
                        <strong>{comment.username}</strong>
                        {currentUserId === comment.user.id && (
                            <div className="comment-actions">
                                <button onClick={() => setIsEditing(true)}>✏️</button>
                                <button onClick={handleDelete}>🗑️</button>
                            </div>
                        )}
                    </div>
                    <p>{comment.text}</p>
                    <small>
                        {new Date(comment.createdAt).toLocaleString()}
                        {comment.updatedAt && ` (Edited)`}
                    </small>
                </>
            )}
        </div>
    );
};

export default CommentItem;
