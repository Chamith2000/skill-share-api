import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfileFull } from '../services/api';
import './UserProfile.css';
import Navbar from "../components/Navbar";

const UserProfilePage = () => {
    const [user, setUser] = useState({
        id: '',
        username: '',
        email: '',
        bio: '',
        profileImageUrl: '',
        skillLevel: '',
        craftTokens: 0,
        password: '' // 👉 Add password field
    });

    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

            const profileData = {
                id: user.id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                skillLevel: user.skillLevel
            };

            // Only include password if not empty
            if (user.password && user.password.trim() !== '') {
                profileData.password = user.password;
            }

            const response = await updateUserProfileFull(userId, profileData, selectedFile);

            // Clear password field after save
            setUser({ ...response.data, password: '' });
            setIsEditing(false);
            setSelectedFile(null);
            setImagePreview(null);
            setSaving(false);
        } catch (err) {
            setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
            setSaving(false);
            console.error('Error updating profile:', err);
        }
    };

    if (loading) {
        return <div className="loading">Loading profile...</div>;
    }

    if (error) {
        return (
            <div>
                <div className="error">{error}</div>
                <button onClick={fetchUserData} className="retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div>
            <Navbar/>
            <div className="profile-container">
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
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={user.username || ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email || ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={user.password || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    name="bio"
                                    value={user.bio || ''}
                                    onChange={handleInputChange}
                                    rows="4"
                                />
                            </div>

                            <div className="form-group">
                                <label>Skill Level</label>
                                <select
                                    name="skillLevel"
                                    value={user.skillLevel || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Skill Level</option>
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                    <option value="EXPERT">Expert</option>
                                </select>
                            </div>

                            <div className="button-group">
                                <button onClick={saveProfile} className="save-btn" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Profile'}
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

                            <button onClick={() => setIsEditing(true)} className="edit-btn">
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
