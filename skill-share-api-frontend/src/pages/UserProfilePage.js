import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfileFull } from '../services/api';
import './UserProfile.css';
import Navbar from '../components/Navbar';

const UserProfilePage = () => {
    const [user, setUser] = useState({
        id: '',
        username: '',
        email: '',
        bio: '',
        profileImageUrl: '',
        skillLevel: '',
        craftTokens: 0,
        password: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const userObj = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = userObj ? userObj.id : null;

    useEffect(() => {
        if (userId) {
            fetchUserData();
        } else {
            setError('User not authenticated');
            setLoading(false);
        }
    }, [userId]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await getUserProfile(userId);
            setUser(prev => ({ ...response.data, password: '' }));
            setLoading(false);
        } catch (err) {
            setError('Failed to load user profile');
            setLoading(false);
            console.error('Error fetching user data:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser({
            ...user,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('Image file size exceeds 5MB limit');
            return;
        }
        setSelectedFile(file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const saveProfile = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const profileData = {
                id: user.id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                skillLevel: user.skillLevel
            };

            if (user.password && user.password.trim() !== '') {
                profileData.password = user.password;
            }

            const response = await updateUserProfileFull(userId, profileData, selectedFile);

            setUser({ ...response.data, password: '' });
            setIsEditing(false);
            setSelectedFile(null);
            setImagePreview(null);
            setSuccess('Profile updated successfully!');
            setSaving(false);
            setTimeout(() => setSuccess(null), 3000); // Clear success after 3s
        } catch (err) {
            setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
            setSaving(false);
            console.error('Error updating profile:', err);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <span className="loading-spinner"></span>
                Loading profile...
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="alert alert-error">{error}</div>
                <button onClick={fetchUserData} className="retry-btn" aria-label="Retry loading profile">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="profile-container">
                {success && (
                    <div className="alert alert-success success-animation">
                        {success}
                    </div>
                )}
                <div className="profile-header">
                    <div className="profile-image-container">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="profile-image" />
                        ) : user.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="Profile" className="profile-image" />
                        ) : (
                            <div className="profile-image-placeholder">
                                {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}

                        {isEditing && (
                            <div className="image-upload-section">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="file-input"
                                    accept="image/*"
                                    id="profile-image-input"
                                    aria-label="Upload profile image"
                                />
                                <label htmlFor="profile-image-input" className="file-input-label">
                                    Choose Image
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="profile-info">
                        <h1>{user.username}</h1>
                        <div className="profile-details">
                            <span className="craft-tokens">
                                <i className="token-icon">🪙</i> {user.craftTokens} Craft Tokens
                            </span>
                            <span className="skill-level">
                                Level: {user.skillLevel || 'Not set'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="profile-body">
                    {isEditing ? (
                        <div className="edit-form">
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={user.username || ''}
                                    onChange={handleInputChange}
                                    required
                                    aria-required="true"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={user.email || ''}
                                    onChange={handleInputChange}
                                    required
                                    aria-required="true"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">New Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={user.password || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password (optional)"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="bio">Bio</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={user.bio || ''}
                                    onChange={handleInputChange}
                                    rows="4"
                                    aria-label="User bio"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="skillLevel">Skill Level</label>
                                <select
                                    id="skillLevel"
                                    name="skillLevel"
                                    value={user.skillLevel || ''}
                                    onChange={handleInputChange}
                                    aria-label="Select skill level"
                                >
                                    <option value="">Select Skill Level</option>
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                    <option value="EXPERT">Expert</option>
                                </select>
                            </div>

                            <div className="button-group">
                                <button
                                    onClick={saveProfile}
                                    className="save-btn"
                                    disabled={saving}
                                    aria-label="Save profile changes"
                                >
                                    {saving ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Profile'
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setSelectedFile(null);
                                        setImagePreview(null);
                                        setUser(prev => ({ ...prev, password: '' }));
                                        fetchUserData();
                                    }}
                                    className="cancel-btn"
                                    disabled={saving}
                                    aria-label="Cancel editing"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-content">
                            <div className="bio-section">
                                <h3>Bio</h3>
                                <p>{user.bio || 'No bio information provided yet.'}</p>
                            </div>

                            <div className="contact-info">
                                <h3>Contact Information</h3>
                                <p>Email: {user.email}</p>
                            </div>

                            <button
                                onClick={() => setIsEditing(true)}
                                className="edit-btn"
                                aria-label="Edit profile"
                            >
                                Edit Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;