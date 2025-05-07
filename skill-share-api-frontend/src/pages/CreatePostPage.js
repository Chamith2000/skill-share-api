import React from 'react';
import PostForm from '../components/PostForm';
import Navbar from "../components/Navbar";

const CreatePostPage = () => {
    const userId = 1; // Replace with dynamic user ID if needed

    return (
        <div>
            <Navbar/>
            <PostForm userId={userId} />
        </div>
    );
};

export default CreatePostPage;
