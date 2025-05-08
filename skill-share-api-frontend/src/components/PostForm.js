import React, { useState, useRef } from 'react';
import { createPost } from '../services/api';
import './PostForm.css';

const PostForm = () => {
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [videoError, setVideoError] = useState(null);
    const [isDragging, setIsDragging] = useState(false); // New state for drag feedback
    const videoRef = useRef(null);
    const fileInputRef = useRef(null); // Ref for file input

    // Get logged-in user's ID from localStorage
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    const userId = loggedUser?.id;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        if (!userId) {
            setError('User is not logged in.');
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('description', description);
            files.forEach((file) => formData.append('files', file));

            await createPost(userId, formData);
            setSuccess(true);
            setDescription('');
            setFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset file input
            }
            setTimeout(() => setSuccess(false), 3000); // Clear success message after 3s
        } catch (err) {
            setError('Failed to create post. Please try again.');
            console.error('Error creating post:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const checkVideoDuration = (file) => {
        return new Promise((resolve, reject) => {
            // Only check duration for video files
            if (!file.type.startsWith('video/')) {
                resolve(file);
                return;
            }

            // Create temporary video element to check duration
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > 30) {
                    reject(new Error(`Video duration exceeds 30 seconds limit (${Math.round(video.duration)}s)`));
                } else {
                    resolve(file);
                }
            };

            video.onerror = () => {
                reject(new Error('Error verifying video file'));
            };

            video.src = URL.createObjectURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const newFiles = Array.from(e.target.files);
        handleFiles(newFiles);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            (file) => file.type.startsWith('image/') || file.type.startsWith('video/')
        ); // Only accept images and videos
        handleFiles(droppedFiles);
    };

    const handleFiles = async (newFiles) => {
        if (files.length + newFiles.length > 3) {
            setError('You can upload a maximum of 3 files');
            return;
        }

        setVideoError(null);

        try {
            // Check all video files for duration limit
            const validatedFiles = await Promise.all(
                newFiles.map(async (file) => {
                    if (file.type.startsWith('video/')) {
                        await checkVideoDuration(file);
                    }
                    return file;
                })
            );

            setFiles([...files, ...validatedFiles]);
        } catch (err) {
            setVideoError(err.message);
            console.error('Video validation error:', err);
        }
    };

    const removeFile = (index) => {
        const updatedFiles = [...files];
        updatedFiles.splice(index, 1);
        setFiles(updatedFiles);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input
        }
    };

    const getFileTypeIcon = (file) => {
        if (file.type.startsWith('image/')) return '🖼️';
        if (file.type.startsWith('video/')) return '🎬';
        return '📎'; // Fallback for other types (though only images/videos are allowed)
    };

    return (
        <div className="post-form-container">
            <h2 className="form-title">Create New Post</h2>

            {success && (
                <div className="alert alert-success success-animation">
                    Post created successfully!
                </div>
            )}

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {videoError && (
                <div className="alert alert-error">
                    {videoError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="post-form">
                <div className="form-group">
                    <label htmlFor="description" className="form-label">
                        What's on your mind?
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form-textarea"
                        placeholder="Share your thoughts..."
                        rows="5"
                        required
                    />
                    <div className={`character-count ${description.length > 900 ? 'danger' : description.length > 750 ? 'warning' : ''}`}>
                        {description.length}/1000 characters
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="file-upload" className="form-label">
                        Add Media (max 3 files)
                    </label>
                    <div className="file-upload-container">
                        <label
                            htmlFor="file-upload"
                            className={`file-upload-label ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <span className="upload-icon">+</span>
                            <span>Click or drag & drop images/videos</span>
                            <small className="upload-help-text">
                                Supports images and videos (max 30 seconds, 3 files)
                            </small>
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="file-input"
                                accept="image/*, video/*"
                                ref={fileInputRef}
                            />
                        </label>
                    </div>

                    {files.length > 0 && (
                        <div className="file-preview-container">
                            <h4 className="preview-title">Selected Files:</h4>
                            <div className="file-previews">
                                {files.map((file, index) => (
                                    <div key={index} className="file-preview">
                                        <div className="file-info">
                                            <span className="file-type-icon">{getFileTypeIcon(file)}</span>
                                            <span className="file-name tooltip" title={file.name}>
                                            {file.name}
                                            </span>
                                            <span className="file-size">
                                                {(file.size / 1024).toFixed(2)} KB
                                            </span>
                                            {file.type.startsWith('video/') && (
                                                <span className="file-tag">Video</span>
                                            )}
                                            {file.type.startsWith('image/') && (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    className="image-preview"
                                                />
                                            )}
                                            {file.type.startsWith('video/') && (
                                                <video
                                                    src={URL.createObjectURL(file)}
                                                    className="video-preview"
                                                    controls
                                                    height="150"
                                                    preload="metadata"
                                                />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="remove-file-btn"
                                            aria-label={`Remove ${file.name}`}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                    disabled={isSubmitting || !description.trim() || videoError}
                >
                    {isSubmitting ? (
                        <>
                            <span className="loading-spinner"></span> Posting...
                        </>
                    ) : (
                        'Create Post'
                    )}
                </button>
            </form>
        </div>
    );
};

export default PostForm;