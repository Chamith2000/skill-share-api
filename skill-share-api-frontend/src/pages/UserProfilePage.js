import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  getUserProfile,
  updateUserProfile,
  updateUserProfileFull,
  uploadProfileImage,
} from '../services/api';
import Navbar from './../components/Navbar';
import { Camera, Save, X, Edit2, User } from 'lucide-react';
import './UserProfile.css';

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const DEFAULT_IMAGE = 'https://via.placeholder.com/150?text=Profile';

  const getUserFromLocalStorage = () => JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const fetchProfile = async () => {
      const loggedInUser = getUserFromLocalStorage();
      console.log('Logged-in user from localStorage:', loggedInUser);

      if (!loggedInUser || !loggedInUser.id) {
        setError('User not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      const userId = loggedInUser.id;
      console.log('Fetching profile for userId:', userId);

      try {
        const response = await getUserProfile(userId);
        console.log('Profile data received:', response.data);
        setUser(response.data);
        reset({
          username: response.data.username,
          email: response.data.email,
          bio: response.data.bio,
          skillLevel: response.data.skillLevel,
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message.includes('UserNotFound') ? 'User not found' : err.message);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  useEffect(() => {
    console.log('Current user state:', user);
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setSaveLoading(true);
    const loggedInUser = getUserFromLocalStorage();
    if (!loggedInUser || !loggedInUser.id) {
      setError('User not authenticated. Please log in.');
      setSaveLoading(false);
      return;
    }

    const userId = loggedInUser.id;
    try {
      if (imageFile) {
        const profileData = { ...data };
        const response = await updateUserProfileFull(userId, profileData, imageFile);
        console.log('Full update response:', response.data);
        setUser(response.data);
        setImageFile(null);
        setImagePreview(null);
      } else {
        const response = await updateUserProfile(userId, data);
        console.log('Partial update response:', response.data);
        setUser(response.data);
      }
      setIsEditing(false);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.textContent = 'Profile updated successfully!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 3000);
      }, 100);
      
      setSaveLoading(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || err.message);
      setSaveLoading(false);
    }
  };

  const handleImageUpload = async () => {
    setSaveLoading(true);
    const loggedInUser = getUserFromLocalStorage();
    if (!loggedInUser || !loggedInUser.id) {
      setError('User not authenticated. Please log in.');
      setSaveLoading(false);
      return;
    }

    const userId = loggedInUser.id;
    if (!imageFile) {
      setError('Please select an image to upload.');
      setSaveLoading(false);
      return;
    }
    try {
      const response = await uploadProfileImage(userId, imageFile);
      console.log('Uploaded image response:', response.data);
      setUser((prev) => ({ ...prev, profilePhotoUrl: response.data.imageUrl }));
      setImageFile(null);
      setImagePreview(null);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.textContent = 'Profile image uploaded successfully!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 3000);
      }, 100);
      
      setSaveLoading(false);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.response?.data?.message || 'Failed to upload image: Invalid server response');
      setSaveLoading(false);
    }
  };

  const handleImageError = (e) => {
    console.error('Error loading image:', user?.profilePhotoUrl);
    e.target.src = DEFAULT_IMAGE;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="reload-btn">
          Try Again
        </button>
      </div>
    );
  }
  
  if (!user) return (
    <div className="not-found-container">
      <User size={48} />
      <h2>User not found</h2>
      <p>We couldn't find the user profile you're looking for.</p>
    </div>
  );

  return (
    <div className="app-container">
      <Navbar />
      <div className="user-profile-page">
        <div className="profile-card">
          <div className="profile-header">
            <h1>My Profile</h1>
            {!isEditing ? (
              <button 
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setIsEditing(false);
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="profile-content">
            <div className="profile-image-container">
              <div className="profile-image-wrapper">
                <img
                  src={imagePreview || user.profilePhotoUrl || DEFAULT_IMAGE}
                  alt="Profile"
                  className="profile-img"
                  onError={handleImageError}
                />
                
                {isEditing && (
                  <label className="image-upload-label">
                    <Camera size={20} />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleImageChange}
                      className="hidden-file-input"
                    />
                  </label>
                )}
              </div>
              
              {isEditing && imagePreview && (
                <button 
                  className="upload-image-button"
                  onClick={handleImageUpload}
                  disabled={saveLoading}
                >
                  {saveLoading ? 'Uploading...' : 'Upload Image'}
                </button>
              )}
              
              <div className="token-badge">
                <span>{user.craftTokens || 0}</span>
                <span>Tokens</span>
              </div>
            </div>
            
            <div className="profile-details">
              {!isEditing ? (
                <div className="profile-info">
                  <div className="info-group">
                    <h3>Username</h3>
                    <p>{user.username}</p>
                  </div>
                  
                  <div className="info-group">
                    <h3>Email</h3>
                    <p>{user.email}</p>
                  </div>
                  
                  <div className="info-group">
                    <h3>Skill Level</h3>
                    <p className={`skill-badge ${user.skillLevel?.toLowerCase() || 'none'}`}>
                      {user.skillLevel || 'Not specified'}
                    </p>
                  </div>
                  
                  <div className="info-group bio-group">
                    <h3>Bio</h3>
                    <p className="bio-text">{user.bio || 'No bio available'}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="edit-form">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      {...register('username', { required: 'Username is required' })}
                      defaultValue={user.username}
                      className={errors.username ? 'error-input' : ''}
                    />
                    {errors.username && <span className="error-message">{errors.username.message}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: 'Invalid email address',
                        },
                      })}
                      defaultValue={user.email}
                      className={errors.email ? 'error-input' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email.message}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Skill Level</label>
                    <select 
                      {...register('skillLevel')} 
                      defaultValue={user.skillLevel || ''}
                      className="skill-select"
                    >
                      <option value="">Select Skill Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea 
                      {...register('bio')} 
                      defaultValue={user.bio || ''}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="save-button"
                    disabled={saveLoading}
                  >
                    {saveLoading ? (
                      <>
                        <div className="button-spinner"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;