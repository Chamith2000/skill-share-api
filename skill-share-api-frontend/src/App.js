// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from "./pages/HomePage";
import CreatePostPage from "./pages/CreatePostPage";
import PostDetailPage from "./pages/PostDetailPage";
import Profile from "./pages/Profile";

// Simple auth check
const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('user') !== null;
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/home-page" element={<HomePage />} />
                <Route path="/create-post" element={<CreatePostPage />} />
                <Route path="/posts/:postId" element={<PostDetailPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;