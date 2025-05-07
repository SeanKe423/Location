import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const EditCounselorProfile = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    languages: [],
    otherLanguage: '',
    education: '',
    otherEducation: '',
    cpbNumber: '',
    otherCertifications: '',
    yearsExperience: '',
    specializations: [],
    otherSpecialization: '',
    documents: null,
    agreeToTerms: false,
    additionalComments: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current profile data
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/counselor-profile', {
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

      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'documents') {
          if (formData[key] && formData[key] instanceof File) {
            formDataToSend.append(key, formData[key]);
          }
        } else if (Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.put(
        'http://localhost:5000/api/auth/edit-counselor-profile',
        formDataToSend,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
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

  // ... rest of the component remains the same as CounselorProfile.js
};

export default EditCounselorProfile; 