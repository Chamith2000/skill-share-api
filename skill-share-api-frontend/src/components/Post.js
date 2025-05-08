import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { likePost } from '../services/api';
import CommentList from './CommentList';

const Post = ({ post }) => {
  const [likes, setLikes] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    likePost(post.id)
      .then(() => {
        setLikes(isLiked ? likes - 1 : likes + 1);
        setIsLiked(!isLiked);
      })
      .catch((err) => console.error('Error liking post:', err));
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            {post.user.avatar ? (
              <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-lg font-semibold">
                {post.user.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
            <p className="text-xs text-gray-500">{post.timestamp || '2 hours ago'}</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-gray-800 mb-3">{post.description}</p>
      </div>

      {/* Post Media */}
      {post.media && post.media.length > 0 && (
        <div className={`${post.media.length > 1 ? 'grid grid-cols-2 gap-1' : ''} mb-2`}>
          {post.media.map((media, index) => (
            <div key={index} className="relative">
              {media.mediaType === 'image' ? (
                <img 
                  src={media.url || "/api/placeholder/600/400"} 
                  alt="Post content" 
                  className="w-full object-cover"
                />
              ) : (
                <video 
                  controls 
                  className="w-full h-full"
                >
                  <source src={media.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
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