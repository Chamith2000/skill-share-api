import React, { useEffect, useState } from 'react';
import { getCommentsByPostId, createComment } from '../services/api';

const CommentList = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        getCommentsByPostId(postId)
            .then((response) => setComments(response.data.comments))
            .catch((error) => console.error('Error fetching comments:', error));
    }, [postId]);

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        createComment(postId, { text: newComment })
            .then(() => {
                setComments([...comments, { text: newComment }]);
                setNewComment('');
            })
            .catch((err) => console.error('Error adding comment:', err));
    };

    return (
        <div className="comment-list">
            <h4>Comments</h4>
            {comments.map((comment, index) => (
                <p key={index}>{comment.text}</p>
            ))}
            <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
            />
            <button onClick={handleAddComment}>Add Comment</button>
        </div>
    );
};

export default CommentList;
