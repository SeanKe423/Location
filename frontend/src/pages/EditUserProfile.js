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
      {/* ... rest of the component remains the same as UserProfile.js ... */}
    </div>
  );
};

export default EditUserProfile; 