import React, { useState } from 'react';
import { createPost } from '../services/api';
import './PostForm.css'; // Optional CSS file

const PostForm = () => {
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // 👇 Get logged in user's ID from localStorage
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
        } catch (err) {
            setError('Failed to create post. Please try again.');
            console.error('Error creating post:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (files.length + newFiles.length > 3) {
            setError('You can upload a maximum of 3 files');
            return;
        }
        setFiles([...files, ...newFiles]);
    };

    const removeFile = (index) => {
        const updatedFiles = [...files];
        updatedFiles.splice(index, 1);
        setFiles(updatedFiles);
    };

    return (
        <div className="post-form-container">
            <h2 className="form-title">Create New Post</h2>

            {success && (
                <div className="alert alert-success">
                    Post created successfully!
                </div>
            )}

            {error && (
                <div className="alert alert-error">
                    {error}
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
                    <div className="character-count">
                        {description.length}/1000 characters
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="files" className="form-label">
                        Add Media (max 3 files)
                    </label>
                    <div className="file-upload-container">
                        <label htmlFor="file-upload" className="file-upload-label">
                            <span className="upload-icon">+</span>
                            <span>Click to upload files</span>
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="file-input"
                                accept="image/*, video/*, .pdf, .doc, .docx"
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
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">
                                                {(file.size / 1024).toFixed(2)} KB
                                            </span>
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
                    className="submit-btn"
                    disabled={isSubmitting || !description.trim()}
                >
                    {isSubmitting ? 'Posting...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
};

export default PostForm;