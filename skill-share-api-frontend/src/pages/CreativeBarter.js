import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from "../components/Navbar";
import "./CreativeBarter.css";

const CreativeBarter = () => {
    // States
    const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'create', 'detail', 'edit'
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [editRequest, setEditRequest] = useState({ id: null, title: '', description: '' });
    const [editBid, setEditBid] = useState({ id: null, solution: '' });

    // Form states
    const [newRequest, setNewRequest] = useState({ title: '', description: '' });
    const [newBid, setNewBid] = useState('');

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // Fetch all requests
    useEffect(() => {
        if (activeTab === 'browse') {
            fetchRequests();
        }
    }, [activeTab]);

    // Fetch request details and bids when a request is selected
    useEffect(() => {
        if (selectedRequest && activeTab === 'detail') {
            fetchRequestDetails(selectedRequest.id);
        }
    }, [selectedRequest, activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/creative-barter/requests');
            setRequests(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to load requests. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRequestDetails = async (requestId) => {
        setLoading(true);
        try {
            const bidsResponse = await axios.get(`http://localhost:8080/api/creative-barter/requests/${requestId}/bids`);
            setBids(bidsResponse.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching request details:', err);
            setError('Failed to load request details. Please try again later.');
            setBids([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        if (!newRequest.title.trim() || !newRequest.description.trim()) {
            setError('Please fill in all required fields');
            return;
        }
        if (!user || !user.id) {
            setError('You must be logged in to create a request');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/creative-barter/requests', {
                userId: user.id,
                title: newRequest.title,
                description: newRequest.description
            });
            setRequests([...requests, response.data]);
            setNewRequest({ title: '', description: '' });
            setSuccessMessage('Request created successfully!');
            setTimeout(() => {
                setActiveTab('browse');
                setSuccessMessage('');
            }, 2000);
        } catch (err) {
            console.error('Error creating request:', err);
            setError(err.response?.data?.message || 'Failed to create request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRequest = async (e) => {
        e.preventDefault();
        if (!editRequest.title.trim() || !editRequest.description.trim()) {
            setError('Please fill in all required fields');
            return;
        }
        if (!user || !user.id) {
            setError('You must be logged in to update a request');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.put(`http://localhost:8080/api/creative-barter/requests/${editRequest.id}`, {
                title: editRequest.title,
                description: editRequest.description
            }, {
                params: { userId: user.id }
            });
            setRequests(requests.map(req => req.id === editRequest.id ? response.data : req));
            setEditRequest({ id: null, title: '', description: '' });
            setSuccessMessage('Request updated successfully!');
            setTimeout(() => {
                setActiveTab('browse');
                setSuccessMessage('');
            }, 2000);
        } catch (err) {
            console.error('Error updating request:', err);
            setError(err.response?.data?.message || 'Failed to update request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRequest = async (requestId) => {
        if (!user || !user.id) {
            setError('You must be logged in to delete a request');
            return;
        }
        setLoading(true);
        try {
            await axios.delete(`http://localhost:8080/api/creative-barter/requests/${requestId}`, {
                params: { userId: user.id }
            });
            setRequests(requests.filter(req => req.id !== requestId));
            setSuccessMessage('Request deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error deleting request:', err);
            setError(err.response?.data?.message || 'Failed to delete request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitBid = async (e) => {
        e.preventDefault();
        if (!newBid.trim()) {
            setError('Please provide your solution before submitting');
            return;
        }
        if (!user || !user.id) {
            setError('You must be logged in to submit a solution');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(
                `http://localhost:8080/api/creative-barter/requests/${selectedRequest.id}/bids`,
                null,
                {
                    params: {
                        userId: user.id,
                        solution: newBid
                    }
                }
            );
            setBids([...bids, response.data]);
            setNewBid('');
            setSuccessMessage('Your solution has been submitted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error submitting bid:', err);
            setError(err.response?.data?.message || 'Failed to submit your solution. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBid = async (e) => {
        e.preventDefault();
        if (!editBid.solution.trim()) {
            setError('Please provide a solution');
            return;
        }
        if (!user || !user.id) {
            setError('You must be logged in to update a solution');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.put(`http://localhost:8080/api/creative-barter/bids/${editBid.id}`, {
                solution: editBid.solution
            }, {
                params: { userId: user.id }
            });
            setBids(bids.map(bid => bid.id === editBid.id ? response.data : bid));
            setEditBid({ id: null, solution: '' });
            setSuccessMessage('Solution updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating bid:', err);
            setError(err.response?.data?.message || 'Failed to update solution. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBid = async (bidId) => {
        if (!user || !user.id) {
            setError('You must be logged in to delete a solution');
            return;
        }
        setLoading(true);
        try {
            await axios.delete(`http://localhost:8080/api/creative-barter/bids/${bidId}`, {
                params: { userId: user.id }
            });
            setBids(bids.filter(bid => bid.id !== bidId));
            setSuccessMessage('Solution deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error deleting bid:', err);
            setError(err.response?.data?.message || 'Failed to delete solution. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptBid = async (bidId) => {
        if (!user || !user.id) {
            setError('You must be logged in to accept a solution');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`http://localhost:8080/api/creative-barter/bids/${bidId}/accept`, null, {
                params: { requestOwnerId: user.id }
            });
            setSelectedRequest({ ...selectedRequest, isResolved: true });
            setBids(bids.map(bid =>
                bid.id === bidId ? { ...bid, isAccepted: true } : bid
            ));
            setSuccessMessage('You have accepted this solution! A Craft Token has been awarded to the creator.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error accepting bid:', err);
            setError(err.response?.data?.message || 'Failed to accept this solution. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const viewRequestDetails = (request) => {
        setSelectedRequest(request);
        setActiveTab('detail');
    };

    const startEditRequest = (request) => {
        setEditRequest({
            id: request.id,
            title: request.title,
            description: request.description
        });
        setActiveTab('edit');
    };

    const startEditBid = (bid) => {
        setEditBid({
            id: bid.id,
            solution: bid.solution
        });
    };

    const cancelEditBid = () => {
        setEditBid({ id: null, solution: '' });
    };

    // Helper function to get username safely
    const getUsername = (user) => {
        if (!user) return "Anonymous";
        return user.username || "Anonymous";
    };

    // Format date and time
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "Unknown Date";

        const date = new Date(dateTimeString);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `${formattedDate} at ${formattedTime}`;
    };

    return (
        <div>
            <Navbar />
            <div className="creative-barter">
                <div className="tab-navigation">
                    <button
                        className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
                        onClick={() => setActiveTab('browse')}
                    >
                        Browse Requests
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        Create Request
                    </button>
                </div>

                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="loading-indicator">
                        Loading...
                    </div>
                )}

                {activeTab === 'browse' && (
                    <div className="request-list">
                        <h2>Creative Barter Requests</h2>
                        {requests.length === 0 ? (
                            <div className="empty-state">
                                <p>No requests available yet.</p>
                                <p>Be the first to create a request for creative help!</p>
                            </div>
                        ) : (
                            <div className="request-grid">
                                {requests.map((request) => (
                                    <div key={request.id} className="request-card">
                                        <div className="request-header">
                                            <h3>{request.title}</h3>
                                            {request.isResolved && (
                                                <span className="resolved-badge">Resolved</span>
                                            )}
                                        </div>
                                        <p className="request-description">{request.description}</p>
                                        <div className="request-footer">
                                            <span className="request-date">
                                                Posted: {formatDateTime(request.createdAt)}
                                            </span>
                                            <div>
                                                <button
                                                    className="view-button"
                                                    onClick={() => viewRequestDetails(request)}
                                                >
                                                    View Details
                                                </button>
                                                {user && user.id === request.userId && (
                                                    <>
                                                        <button
                                                            className="edit-button"
                                                            onClick={() => startEditRequest(request)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="delete-button"
                                                            onClick={() => handleDeleteRequest(request.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'create' && (
                    <div className="create-request">
                        <h2>Create New Request</h2>
                        <form onSubmit={handleCreateRequest}>
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={newRequest.title}
                                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                                    placeholder="What do you need help with?"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={newRequest.description}
                                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                                    rows="6"
                                    placeholder="Describe your request in detail..."
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setActiveTab('browse')}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Create Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'edit' && editRequest.id && (
                    <div className="edit-request">
                        <h2>Edit Request</h2>
                        <form onSubmit={handleUpdateRequest}>
                            <div className="form-group">
                                <label htmlFor="edit-title">Title</label>
                                <input
                                    type="text"
                                    id="edit-title"
                                    value={editRequest.title}
                                    onChange={(e) => setEditRequest({ ...editRequest, title: e.target.value })}
                                    placeholder="What do you need help with?"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-description">Description</label>
                                <textarea
                                    id="edit-description"
                                    value={editRequest.description}
                                    onChange={(e) => setEditRequest({ ...editRequest, description: e.target.value })}
                                    rows="6"
                                    placeholder="Describe your request in detail..."
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setActiveTab('browse')}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'detail' && selectedRequest && (
                    <div className="request-detail">
                        <div className="detail-header">
                            <button
                                className="back-button"
                                onClick={() => setActiveTab('browse')}
                            >
                                ← Back to Requests
                            </button>
                        </div>
                        <div className="detail-content">
                            <div className="detail-title-container">
                                <h2>{selectedRequest.title}</h2>
                                {selectedRequest.isResolved ? (
                                    <span className="resolved-badge">Resolved</span>
                                ) : (
                                    <span className="open-badge">Open</span>
                                )}
                            </div>
                            <p className="detail-meta">
                                Posted by: {getUsername(selectedRequest.user)} •
                                {formatDateTime(selectedRequest.createdAt)}
                            </p>
                            <div className="detail-description">
                                <p>{selectedRequest.description}</p>
                            </div>
                            <div className="solutions-section">
                                <h3>Solutions ({bids.length})</h3>
                                {bids.length === 0 ? (
                                    <div className="empty-solutions">
                                        <p>No solutions submitted yet. Be the first to help!</p>
                                    </div>
                                ) : (
                                    <div className="solutions-list">
                                        {bids.map((bid) => (
                                            <div
                                                key={bid.id}
                                                className={`solution-card ${bid.isAccepted ? 'accepted' : ''}`}
                                            >
                                                <div className="solution-header">
                                                    <div>
                                                        <p className="solution-author">{getUsername(bid.user)}</p>
                                                        <p className="solution-date">
                                                            {formatDateTime(bid.createdAt)}
                                                        </p>
                                                    </div>
                                                    {bid.isAccepted && (
                                                        <span className="accepted-badge">Accepted Solution</span>
                                                    )}
                                                </div>
                                                {editBid.id === bid.id ? (
                                                    <form onSubmit={handleUpdateBid}>
                                                        <textarea
                                                            value={editBid.solution}
                                                            onChange={(e) => setEditBid({ ...editBid, solution: e.target.value })}
                                                            rows="5"
                                                            placeholder="Edit your solution..."
                                                            required
                                                        />
                                                        <div className="form-actions">
                                                            <button
                                                                type="button"
                                                                className="cancel-button"
                                                                onClick={cancelEditBid}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className="submit-button"
                                                                disabled={loading}
                                                            >
                                                                {loading ? 'Updating...' : 'Update Solution'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <>
                                                        <div className="solution-content">
                                                            {bid.solution}
                                                        </div>
                                                        <div className="solution-actions">
                                                            {user && user.id === selectedRequest.user?.id && !selectedRequest.isResolved && (
                                                                <button
                                                                    className="accept-button"
                                                                    onClick={() => handleAcceptBid(bid.id)}
                                                                >
                                                                    Accept Solution
                                                                </button>
                                                            )}
                                                            {user && user.id === bid.user?.id && !bid.isAccepted && (
                                                                <>
                                                                    <button
                                                                        className="edit-button"
                                                                        onClick={() => startEditBid(bid)}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        className="delete-button"
                                                                        onClick={() => handleDeleteBid(bid.id)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {!selectedRequest.isResolved && (
                                <div className="submit-solution">
                                    <h3>Submit Your Solution</h3>
                                    <form onSubmit={handleSubmitBid}>
                                        <textarea
                                            value={newBid}
                                            onChange={(e) => setNewBid(e.target.value)}
                                            rows="5"
                                            placeholder="Share your creative solution here..."
                                            disabled={!user || loading}
                                        />
                                        <div className="form-actions">
                                            <button
                                                type="submit"
                                                className="submit-button"
                                                disabled={!user || loading}
                                            >
                                                {loading ? 'Submitting...' : 'Submit Solution'}
                                            </button>
                                        </div>
                                        {!user && (
                                            <p className="auth-warning">
                                                You must be logged in to submit a solution
                                            </p>
                                        )}
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreativeBarter;