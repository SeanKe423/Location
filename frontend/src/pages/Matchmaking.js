import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const Matchmaking = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/matching/find-matches', {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Error fetching matches. Please try again.');
      setLoading(false);
    }
  };

  const handleMatchAction = async (counselorId, status) => {
    if (!counselorId) {
      setError('Invalid counselor ID');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to perform this action');
        return;
      }
      
      // First create a new match
      const response = await axios.post(
        'http://localhost:5000/api/matching/create-match',
        { counselorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Then update its status
      await axios.put(
        `http://localhost:5000/api/matching/match/${response.data._id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Show success message
      alert(status === 'accepted' ? 
        'Connection request sent to counselor!' : 
        'Match removed from your list');
      fetchMatches();
    } catch (error) {
      console.error('Error updating match status:', error);
      setError('Error updating match status. Please try again.');
    }
  };

  const getExperienceLabel = (exp) => {
    const labels = {
      'less1': 'Less than 1 year',
      '1-3': '1 - 3 years',
      '4-6': '4 - 6 years',
      '7+': '7+ years'
    };
    return labels[exp] || exp;
  };

  if (loading) {
    return (
      <div className="matchmaking-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Finding your best matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matchmaking-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="matchmaking-container">
        <h2>Your Matched Counselors</h2>
        <div className="no-matches-message">
          <p>No matching counselors found at the moment.</p>
          <p>This could be because:</p>
          <ul>
            <li>There are no registered counselors yet</li>
            <li>Available counselors don't match your preferences</li>
            <li>Counselors haven't completed their profiles</li>
          </ul>
          <p>Please check back later or adjust your preferences.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="matchmaking-container">
      <div className="matchmaking-header">
        <h2>Your Matched Counselors</h2>
        <p className="subtitle">We've found counselors that match your preferences and needs</p>
      </div>

      <div className="matches-grid">
        {matches.map(match => (
          <div key={match._id} className="match-card">
            <div className="match-header">
              <div className="match-score">
                <span className="score-label">Match Score</span>
                <span className="score-value">{Math.round(match.matchScore)}%</span>
              </div>
              <h3 className="counselor-name">{match.counselorId?.fullName}</h3>
            </div>

            <div className="match-content">
              <div className="match-section">
                <h4>Expertise</h4>
                <div className="tags-container">
                  {match.counselorId?.specializations?.map((spec, index) => (
                    <span key={`${match._id}-spec-${index}`} className="specialty-tag">{spec}</span>
                  ))}
                </div>
              </div>

              <div className="match-section">
                <h4>Languages</h4>
                <div className="tags-container">
                  {match.counselorId?.languages?.map((lang, index) => (
                    <span key={`${match._id}-lang-${index}`} className="language-tag">{lang}</span>
                  ))}
                </div>
              </div>

              <div className="match-section">
                <h4>Experience</h4>
                <p>{getExperienceLabel(match.counselorId?.yearsExperience)}</p>
              </div>

              <div className="match-criteria">
                <div className="criteria-item">
                  <span>Language Match</span>
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ width: `${Math.round(match.matchCriteria?.languageMatch || 0)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="criteria-item">
                  <span>Specialization Match</span>
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ width: `${Math.round(match.matchCriteria?.specializationMatch || 0)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="match-actions">
              <button 
                onClick={() => handleMatchAction(match.counselorId._id, 'accepted')}
                className="accept-button"
              >
                Connect with Counselor
              </button>
              <button 
                onClick={() => handleMatchAction(match.counselorId._id, 'rejected')}
                className="reject-button"
              >
                Not Interested
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matchmaking; 