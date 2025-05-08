import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { likePost } from '../services/api';
import CommentList from './CommentList';
import './Post.css'; // Add this line

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
                <div key={index} className="media">
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
          ))}
        </div>
      )}

      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-b border-gray-100 text-sm text-gray-500 flex justify-between">
        <span>{likes} {likes === 1 ? 'like' : 'likes'}</span>
        <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
      </div>

      {/* Post Actions */}
      <div className="flex justify-between px-2 py-3 border-b border-gray-100">
        <button 
          className={`flex items-center justify-center flex-1 py-1 rounded-md ${isLiked ? 'text-red-500' : 'text-gray-500 hover:bg-gray-50'}`}
          onClick={handleLike}
        >
          <Heart size={20} className={isLiked ? 'fill-red-500' : ''} />
          <span className="ml-2 font-medium text-sm">Like</span>
        </button>
        
        <button 
          className="flex items-center justify-center flex-1 py-1 text-gray-500 hover:bg-gray-50 rounded-md"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={20} />
          <span className="ml-2 font-medium text-sm">Comment</span>
        </button>
        
        <button className="flex items-center justify-center flex-1 py-1 text-gray-500 hover:bg-gray-50 rounded-md">
          <Share2 size={20} />
          <span className="ml-2 font-medium text-sm">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-gray-50 p-4">
          <CommentList postId={post.id} comments={post.comments} />
        </div>
      )}
    </div>
  );
};

export default Post;