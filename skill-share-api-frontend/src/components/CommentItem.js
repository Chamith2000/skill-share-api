import React, { useState } from 'react';
import { updateComment, deleteComment } from '../services/api';
import { User, Edit2, Trash2, Save, X, Clock, CheckCircle } from 'lucide-react';

const CommentItem = ({ comment, postId, currentUserId, refreshComments }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    if (!editedText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await updateComment(postId, comment.id, { text: editedText });
      setIsEditing(false);
      refreshComments(); // Function to refresh comments after updating
    } catch (err) {
      console.error('Update failed:', err);
      setError('Failed to update comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    
    try {
      setIsLoading(true);
      await deleteComment(postId, comment.id);
      refreshComments(); // Function to refresh comments after deleting
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete comment. Please try again.');
      setIsLoading(false);
    }
  };

  const confirmDelete = () => {
    // Using a more modern confirmation dialog
    if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      handleDelete();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedText(comment.text); // Reset to original text
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEdited = comment.updatedAt && comment.createdAt !== comment.updatedAt;
  const isCommentOwner = currentUserId === (comment.user?.id || comment.userId);

  return (
    <div className={`p-3 rounded-lg transition-all ${isEditing ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <User size={16} />
        </div>
        <span className="font-medium text-sm">{comment.username || comment.user?.username || 'Anonymous'}</span>
        <span className="text-xs text-gray-500 flex items-center">
          <Clock size={12} className="mr-1" />
          {formatDate(comment.createdAt)}
          {isEdited && (
            <span className="ml-1 flex items-center text-xs text-blue-500">
              <CheckCircle size={10} className="mr-1" /> edited
            </span>
          )}
        </span>
      </div>

      {isEditing ? (
        <div className="mt-2">
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={3}
            disabled={isLoading}
            autoFocus
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedText(comment.text);
                setError(null);
              }}
              disabled={isLoading}
              className="px-3 py-1 rounded-md flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm transition-colors"
            >
              <X size={14} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleUpdate}
              disabled={!editedText.trim() || isLoading}
              className={`px-3 py-1 rounded-md flex items-center gap-1 text-sm transition-colors ${
                !editedText.trim() || isLoading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Save size={14} />
              <span>{isLoading ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Press Enter to save. Escape to cancel.
          </p>
        </div>
      ) : (
        <>
          <div className="text-gray-700 whitespace-pre-wrap break-words mt-1 mb-2">
            {comment.text}
          </div>
          
          {isCommentOwner && (
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
                className="p-1 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                aria-label="Edit comment"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="p-1 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Delete comment"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentItem;