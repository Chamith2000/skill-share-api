import React, { useState } from 'react';
import { likePost } from '../services/api';
import CommentList from './CommentList';

const Post = ({ post }) => {
    const [likes, setLikes] = useState(post.likeCount);
    const [showComments, setShowComments] = useState(false);

    const handleLike = () => {
        likePost(post.id)
            .then(() => setLikes(likes + 1))
            .catch((err) => console.error('Error liking post:', err));
    };

    return (
        <div className="post">
            <h3>{post.user.name}</h3>
            <p>{post.description}</p>
            {post.media.map((media, index) => (
                <div key={index}>
                    {media.mediaType === 'image' ? (
                        <img src={media.url} alt="Media" style={{ maxWidth: '100%' }} />
                    ) : (
                        <video controls style={{ maxWidth: '100%' }}>
                            <source src={media.url} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>
            ))}
            <div className="actions">
                <button onClick={handleLike}>Like ({likes})</button>
                <button onClick={() => setShowComments(!showComments)}>
                    Comments ({post.commentCount})
                </button>
                <button>Share</button>
            </div>
            {showComments && <CommentList postId={post.id} />}
        </div>
    );
};

export default Post;
