// src/components/OAuthSuccess.js
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Extract query parameters from the URL
        const queryParams = new URLSearchParams(location.search);
        const userID = queryParams.get('userID');
        const name = queryParams.get('name');
        const googleProfileImage = queryParams.get('googleProfileImage');

        if (userID && name) {
            // Create user object to match the structure used in manual login
            const user = {
                id: userID,
                username: name,
                googleProfileImage: googleProfileImage || null,
            };

            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(user));

            // Navigate to the home page
            navigate('/home-page');
        } else {
            // Handle error case (e.g., missing parameters)
            console.error('OAuth login failed: Missing query parameters');
            navigate('/login', { state: { error: 'OAuth login failed. Please try again.' } });
        }
    }, [navigate, location.search]);

    return <div>Loading...</div>; // Display a loading message while processing
};

export default OAuthSuccess;