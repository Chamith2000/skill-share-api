import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from "../components/Navbar";
import "./CreativeBarter.css";

const CreativeBarter = () => {
    // States
    const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'create', 'detail'
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

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
            // Get the request details with bids that now include complete user information
            const bidsResponse = await axios.get(`http://localhost:8080/api/creative-barter/requests/${requestId}/bids`);
            setBids(bidsResponse.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching request details:', err);
            setError('Failed to load request details. Please try again later.');

            // Fallback to mock data if API fails
            setBids([
                {
                    id: 1,
                    solution: "I can help with this! Here's my detailed solution...",
                    createdAt: new Date().toISOString(),
                    user: { id: 123, username: "creativeHelper" },
                    isAccepted: false
                },
                {
                    id: 2,
                    solution: "Another approach would be to...",
                    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                    user: { id: 456, username: "designPro" },
                    isAccepted: false
                }
            ]);
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

            // Add new request to list and reset form
            setRequests([...requests, response.data]);
            setNewRequest({ title: '', description: '' });
            setSuccessMessage('Request created successfully!');

            // Switch to browse tab
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

            // Add new bid to list - no need to manually add user info as it now comes from the server
            setBids([...bids, response.data]);
            setNewBid('');
            setSuccessMessage('Your solution has been submitted successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (err) {
            console.error('Error submitting bid:', err);
            setError(err.response?.data?.message || 'Failed to submit your solution. Please try again.');
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
                params: {
                    requestOwnerId: user.id
                }
            });

            // Update request and bid status
            setSelectedRequest({ ...selectedRequest, isResolved: true });
            setBids(bids.map(bid =>
                bid.id === bidId
                    ? { ...bid, isAccepted: true }
                    : bid
            ));

            setSuccessMessage('You have accepted this solution! A Craft Token has been awarded to the creator.');

            // Clear success message after 3 seconds
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

    // Helper function to get username safely
    const getUsername = (user) => {
        if (!user) return "Anonymous";
        return user.username || "Anonymous";
    };

    return (
        <div>
            <Navbar/>
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

                {/* Success Message */}
                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div className="loading-indicator">
                        Loading...
                    </div>
                )}

                {/* Browse Requests Tab */}
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
                                              Posted: {new Date(request.createdAt).toLocaleDateString()}
                                            </span>
                                            <button
                                                className="view-button"
                                                onClick={() => viewRequestDetails(request)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Create Request Tab */}
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
                                    onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                                    placeholder="What do you need help with?"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={newRequest.description}
                                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
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

                {/* Request Detail Tab */}
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
                                {new Date(selectedRequest.createdAt).toLocaleDateString()}
                            </p>

                            <div className="detail-description">
                                <p>{selectedRequest.description}</p>
                            </div>

                            {/* Solutions section */}
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
                                                            {new Date(bid.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {bid.isAccepted && (
                                                        <span className="accepted-badge">Accepted Solution</span>
                                                    )}
                                                </div>

                                                <div className="solution-content">
                                                    {bid.solution}
                                                </div>

                                                {/* Accept button - only visible to request owner if request is not resolved */}
                                                {user &&
                                                    user.id === selectedRequest.user?.id &&
                                                    !selectedRequest.isResolved && (
                                                        <div className="solution-actions">
                                                            <button
                                                                className="accept-button"
                                                                onClick={() => handleAcceptBid(bid.id)}
                                                            >
                                                                Accept Solution
                                                            </button>
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit new solution form - only if request is not resolved */}
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