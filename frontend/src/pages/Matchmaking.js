import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Matchmaking = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
          navigate('/login');
        return;
        }

        const response = await axios.get('http://localhost:5000/api/matching/matches', {
          headers: { Authorization: `Bearer ${token}` }
      });

        setMatches(response.data.matches);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
        setError(error.response?.data?.message || 'Error fetching matches');
      setLoading(false);
    }
  };

    fetchMatches();
  }, [navigate]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'; // Strong match - green
    if (score >= 60) return '#8BC34A'; // Good match - light green
    if (score >= 40) return '#FFC107'; // Moderate match - yellow
    return '#F44336'; // Weak match - red
  };

  const renderMatchCard = (match) => {
    const { institution, matchQuality, scores } = match;

    return (
      <div className="match-card" key={institution.id}>
        <div className="match-header">
          <h3>{institution.name}</h3>
          <span className="match-quality" style={{ color: getScoreColor(scores.total) }}>
            {matchQuality}
          </span>
        </div>

        <div className="match-details">
          <div className="match-scores">
            <h4>Match Breakdown</h4>
            <div className="score-item">
              <span>Counseling Services</span>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${scores.counseling}%`,
                    backgroundColor: getScoreColor(scores.counseling)
                  }}
                />
                <span>{Math.round(scores.counseling)}%</span>
              </div>
            </div>
            <div className="score-item">
              <span>Language Compatibility</span>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${scores.language}%`,
                    backgroundColor: getScoreColor(scores.language)
                  }}
                />
                <span>{Math.round(scores.language)}%</span>
              </div>
            </div>
            <div className="score-item">
              <span>Location & Accessibility</span>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${scores.location}%`,
                    backgroundColor: getScoreColor(scores.location)
                  }}
                />
                <span>{Math.round(scores.location)}%</span>
              </div>
            </div>
            <div className="score-item">
              <span>Age Group Compatibility</span>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${scores.ageGroup}%`,
                    backgroundColor: getScoreColor(scores.ageGroup)
                  }}
                />
                <span>{Math.round(scores.ageGroup)}%</span>
              </div>
            </div>
          </div>

          <div className="institution-info">
            <h4>Institution Details</h4>
            <div className="info-grid">
              <div className="info-item">
                <strong>Services:</strong>
                <ul>
                  {institution.services.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              </div>
              <div className="info-item">
                <strong>Languages:</strong>
                <ul>
                  {institution.languages.map((language, index) => (
                    <li key={index}>{language}</li>
                  ))}
                </ul>
              </div>
              <div className="info-item">
                <strong>Location:</strong>
                <p>{institution.location.address}</p>
              </div>
              <div className="info-item">
                <strong>Wait Time:</strong>
                <p>{institution.waitTime}</p>
              </div>
              <div className="info-item">
                <strong>Virtual Counseling:</strong>
                <p>{institution.virtualCounseling === 'yes' ? 'Available' : 'Not Available'}</p>
              </div>
              <div className="info-item">
                <strong>Staff:</strong>
                <p>{institution.numberOfCounselors} counselors</p>
              </div>
            </div>
          </div>
        </div>

        <div className="match-actions">
          <button className="action-button primary">Contact Institution</button>
          <button className="action-button secondary">View Full Profile</button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Finding your best matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="no-matches-container">
        <h2>No Matches Found</h2>
        <p>We couldn't find any institutions that match your preferences.</p>
        <p>Try updating your profile or check back later.</p>
      </div>
    );
  }

  return (
    <div className="matchmaking-container">
      <h1>Your Matches</h1>
      <p className="matchmaking-intro">
        We've found {matches.length} institutions that match your preferences.
        Each match is scored based on multiple factors to help you find the best fit.
      </p>
      <div className="matches-grid">
        {matches.map(renderMatchCard)}
      </div>
    </div>
  );
};

export default Matchmaking; 