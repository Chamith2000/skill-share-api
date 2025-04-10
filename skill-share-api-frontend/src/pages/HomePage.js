import React from 'react';
import PostList from '../components/PostList';
import Navbar from "../components/Navbar";

const HomePage = () => (
    <div className="home-page">
        <h1>Feed</h1>
        <Navbar />
        <PostList />
    </div>
);

export default HomePage;
