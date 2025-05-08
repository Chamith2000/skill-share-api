import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, Clock, AlertCircle } from 'lucide-react';
import { getCommentsByPostId, createComment } from '../services/api';
import CommentItem from './CommentItem'; // Import the CommentItem component

const CommentList = ({ postId, currentUserId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = () => {
    setIsLoading(true);
    getCommentsByPostId(postId)
      .then((response) => {
        setComments(response.data.comments || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching comments:', error);
        setError('Failed to load comments. Please try again later.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    // Create a temporary comment with pending status
    const tempComment = { 
      id: `temp-${Date.now()}`,
      text: newComment, 
      isPending: true,
      createdAt: new Date().toISOString(),
      userId: currentUserId,
      username: 'You' // This would be replaced when the server responds
    };
    
    // Optimistically update UI
    setComments([...comments, tempComment]);
    setNewComment('');
    
    createComment(postId, { text: newComment })
      .then((response) => {
        // Replace temp comment with real one or refresh the list
        fetchComments();
        setIsSubmitting(false);
      })
      .catch((err) => {
        console.error('Error adding comment:', err);
        // Remove the temp comment if failed
        setComments(comments.filter(c => c.id !== tempComment.id));
        setError('Failed to post comment. Please try again.');
        setIsSubmitting(false);
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-blue-500" size={18} />
          <h3 className="font-medium text-gray-900">Comments ({comments.length})</h3>
        </div>
      </div>

      <div className="p-4">
        {isLoading && comments.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : error && comments.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-red-500 gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              comment.isPending ? (
                <div 
                  key={comment.id} 
                  className="p-3 rounded-lg bg-blue-50 animate-pulse"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100"></div>
                    <span className="font-medium text-sm opacity-70">You</span>
                    <span className="text-xs text-blue-500 flex items-center">
                      <Clock size={12} className="mr-1" />
                      Posting...
                    </span>
                  </div>
                  <p className="text-gray-700 italic opacity-70">
                    {comment.text}
                  </p>
                </div>
              ) : (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={postId}
                  currentUserId={currentUserId}
                  refreshComments={fetchComments}
                />
              )
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <div className="flex-1">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write a comment..."
              rows={2}
              disabled={isSubmitting}
            />
          </div>
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              !newComment.trim() || isSubmitting
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            } transition-colors`}
          >
            <Send size={16} />
            <span>{isSubmitting ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Press Enter to submit. Use Shift+Enter for a new line.
        </p>
      </div>
    </div>
  );
};

export default CommentList;