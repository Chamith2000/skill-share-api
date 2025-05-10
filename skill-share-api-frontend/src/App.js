import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from "./pages/HomePage";
import CreatePostPage from "./pages/CreatePostPage";
import PostDetailPage from "./pages/PostDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import CreativeBarter from "./pages/CreativeBarter";
import LearningPlanList from './components/LearningPlanList';
import CreateLearningPostPage from "./pages/CreateLearningPathPage"
import OAuthSuccess from "./components/OAuthSuccess";

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
                <Route path="/home-page" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                <Route path="/create-post" element={<PrivateRoute><CreatePostPage /></PrivateRoute>} />
                <Route path="/posts/:postId" element={<PrivateRoute><PostDetailPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
                <Route path="/request-board" element={<PrivateRoute><CreativeBarter /></PrivateRoute>} />
                <Route path="/learning-plans" element={<LearningPlanList />} />
                <Route path="/create-learn-path" element={<CreateLearningPostPage />} />
                <Route path="/oauth2/success" element={<OAuthSuccess />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;