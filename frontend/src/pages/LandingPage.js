import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import axios from 'axios';

const LandingPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Verify token validity with backend
        const response = await axios.get('http://localhost:5000/api/auth/verify-token', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.valid) {
          navigate('/dashboard');
        } else {
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      }
    };

    verifyToken();
  }, [navigate]);

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