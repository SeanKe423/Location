import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("Using token:", token); // Debug log

        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/auth/user-profile', {
          headers: {
            'Authorization': `${token}`, // Note: token already includes 'Bearer'
            'Content-Type': 'application/json'
          }
        });

        console.log("Profile response:", response.data); // Debug log
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error.response?.data?.message || 'Failed to load user profile');
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleEditProfile = () => {
    navigate(role === 'counselor' ? '/edit-counselor-profile' : '/edit-user-profile');
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profile) {
    return <div className="loading">Loading...</div>;
  }

  const renderUserProfile = () => (
    <div className="profile-info">
      <h3>User Profile</h3>
      <div className="info-section">
        <h4>Basic Information</h4>
        <p><strong>Age Group:</strong> {profile.ageGroup || 'Not specified'}</p>
        <p><strong>Gender:</strong> {profile.gender || 'Not specified'}</p>
        <p><strong>Languages:</strong> {profile.languages?.join(', ') || 'Not specified'}</p>
        {profile.otherLanguage && <p><strong>Other Language:</strong> {profile.otherLanguage}</p>}
      </div>

      <div className="info-section">
        <h4>Counseling Preferences</h4>
        <p><strong>Counseling Types:</strong> {profile.counselingTypes?.join(', ') || 'Not specified'}</p>
        {profile.otherCounselingType && (
          <p><strong>Other Counseling Type:</strong> {profile.otherCounselingType}</p>
        )}
        <p><strong>Current Issues:</strong> {profile.currentIssues?.join(', ') || 'Not specified'}</p>
        {profile.otherIssue && <p><strong>Other Issue:</strong> {profile.otherIssue}</p>}
        <p><strong>Severity Level:</strong> {profile.severityLevel || 'Not specified'}</p>
        <p><strong>Counselor Gender Preference:</strong> {profile.counselorGenderPreference || 'Not specified'}</p>
      </div>
    </div>
  );

  const renderCounselorProfile = () => (
    <div className="profile-info">
      <h3>Counselor Profile</h3>
      <div className="info-section">
        <h4>Basic Information</h4>
        <p><strong>Full Name:</strong> {profile.fullName || 'Not specified'}</p>
        <p><strong>Email:</strong> {profile.email || 'Not specified'}</p>
        <p><strong>Phone:</strong> {profile.phoneNumber || 'Not specified'}</p>
        <p><strong>Gender:</strong> {profile.gender || 'Not specified'}</p>
        <p><strong>Languages:</strong> {profile.languages?.join(', ') || 'Not specified'}</p>
        {profile.otherLanguage && <p><strong>Other Language:</strong> {profile.otherLanguage}</p>}
      </div>

      <div className="info-section">
        <h4>Qualifications</h4>
        <p><strong>Education:</strong> {profile.education || 'Not specified'}</p>
        {profile.otherEducation && <p><strong>Other Education:</strong> {profile.otherEducation}</p>}
        <p><strong>CPB Number:</strong> {profile.cpbNumber || 'Not specified'}</p>
        <p><strong>Years of Experience:</strong> {profile.yearsExperience || 'Not specified'}</p>
        {profile.otherCertifications && (
          <p><strong>Other Certifications:</strong> {profile.otherCertifications}</p>
        )}
      </div>

      <div className="info-section">
        <h4>Specializations</h4>
        <p>{profile.specializations?.join(', ') || 'Not specified'}</p>
        {profile.otherSpecialization && (
          <p><strong>Other Specialization:</strong> {profile.otherSpecialization}</p>
        )}
      </div>

      {profile.documents && (
        <div className="info-section">
          <h4>Documents</h4>
          <a href={`http://localhost:5000${profile.documents}`} target="_blank" rel="noopener noreferrer">
            View Uploaded Documents
          </a>
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome to Your Dashboard</h2>
        <div className="dashboard-actions">
          <button onClick={handleEditProfile} className="edit-button">
            Edit Profile
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        {role === 'counselor' ? renderCounselorProfile() : renderUserProfile()}
      </div>
    </div>
  );
};

export default Dashboard; 