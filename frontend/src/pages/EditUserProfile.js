import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { COUNSELING_SERVICES } from '../constants/counselingServices';

const EditUserProfile = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ageGroup: '',
    gender: '',
    languages: [],
    otherLanguage: '',
    counselingServices: [],
    otherCounselingService: '',
    currentIssues: [],
    otherIssue: '',
    severityLevel: '',
    counselorGenderPreference: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current profile data
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/user-profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Error loading profile data');
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.put(
        'http://localhost:5000/api/auth/edit-user-profile',
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        alert('Profile updated successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.response?.data?.message || 'Profile update failed');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? (checked ? [...formData[name], value] : formData[name].filter((item) => item !== value)) : value;
    setFormData({ ...formData, [name]: newValue });
  };

  return (
    <div className="edit-user-profile">
      <h2>Edit User Profile</h2>
      <form onSubmit={handleSubmit} className="auth-form user-profile-form">
        <label>Age Group
          <input type="text" name="ageGroup" value={formData.ageGroup} onChange={handleChange} />
        </label>
        <label>Gender
          <input type="text" name="gender" value={formData.gender} onChange={handleChange} />
        </label>
        <label>Languages
          <input type="text" name="languages" value={formData.languages} onChange={handleChange} placeholder="Comma separated" />
        </label>
        <label>Other Language
          <input type="text" name="otherLanguage" value={formData.otherLanguage} onChange={handleChange} />
        </label>
        <label>Counseling Services
          <input type="text" name="counselingServices" value={formData.counselingServices} onChange={handleChange} placeholder="Comma separated" />
        </label>
        <label>Other Counseling Service
          <input type="text" name="otherCounselingService" value={formData.otherCounselingService} onChange={handleChange} />
        </label>
        <label>Current Issues
          <input type="text" name="currentIssues" value={formData.currentIssues} onChange={handleChange} placeholder="Comma separated" />
        </label>
        <label>Other Issue
          <input type="text" name="otherIssue" value={formData.otherIssue} onChange={handleChange} />
        </label>
        <label>Severity Level
          <input type="text" name="severityLevel" value={formData.severityLevel} onChange={handleChange} />
        </label>
        <label>Counselor Gender Preference
          <input type="text" name="counselorGenderPreference" value={formData.counselorGenderPreference} onChange={handleChange} />
        </label>
        <button type="submit" className="auth-button">Save Changes</button>
      </form>
    </div>
  );
};

export default EditUserProfile; 