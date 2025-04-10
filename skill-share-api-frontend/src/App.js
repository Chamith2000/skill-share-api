import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Post from "./pages/Post";
import PostManagement from "./pages/PostManagement";

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
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
          <Route path="/postManagement" element={<PrivateRoute><PostManagement /></PrivateRoute>}/>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
