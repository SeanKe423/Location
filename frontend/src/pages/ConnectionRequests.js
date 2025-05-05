import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const ConnectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnectionRequests();
  }, []);

  const fetchConnectionRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/matching/requests', {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
      setError('Error fetching connection requests. Please try again.');
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        return;
      }
      await axios.put(
        `http://localhost:5000/api/matching/requests/${requestId}`,
        { action },
        {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        }
      );
      // Refresh the requests list
      fetchConnectionRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      setError('Error updating request status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="connection-requests-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading connection requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="connection-requests-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="connection-requests-container">
      <div className="connection-requests-header">
        <h2>Your Connection Requests</h2>
        <p className="subtitle">Manage your requests to connect with counselors</p>
      </div>

      {requests.length === 0 ? (
        <div className="no-requests-message">
          <p>You haven't sent any connection requests yet.</p>
          <button 
            className="primary-button"
            onClick={() => navigate('/matchmaking')}
          >
            Find Counselors
          </button>
        </div>
      ) : (
        <div className="requests-grid">
          {requests.map(request => (
            <div key={request._id} className="request-card">
              <div className="request-header">
                <h3>{request.counselorId?.fullName}</h3>
                <span className={`status-badge ${request.status}`}>
                  {request.status}
                </span>
              </div>

              <div className="request-content">
                <div className="request-section">
                  <h4>Expertise</h4>
                  <div className="tags-container">
                    {request.counselorId?.specializations?.map((spec, index) => (
                      <span key={`${request._id}-spec-${index}`} className="specialty-tag">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="request-section">
                  <h4>Languages</h4>
                  <div className="tags-container">
                    {request.counselorId?.languages?.map((lang, index) => (
                      <span key={`${request._id}-lang-${index}`} className="language-tag">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="request-section">
                  <h4>Experience</h4>
                  <p>{request.counselorId?.yearsExperience} years</p>
                </div>
              </div>

              <div className="request-actions">
                {request.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleRequestAction(request._id, 'cancel')}
                      className="cancel-button"
                    >
                      Cancel Request
                    </button>
                  </>
                )}
                {request.status === 'accepted' && (
                  <button 
                    onClick={() => navigate(`/chat/${request.counselorId?._id}`)}
                    className="chat-button"
                  >
                    Start Chat
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionRequests; 