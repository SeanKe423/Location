import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="landing-overlay">
        <div className="landing-content">
          <h1>Welcome to CCon</h1>
          <p>Your trusted platform for counseling and mental health support</p>
          <div className="landing-buttons">
            <Link to="/signup" className="landing-button primary">
              Sign Up
            </Link>
            <Link to="/login" className="landing-button secondary">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;