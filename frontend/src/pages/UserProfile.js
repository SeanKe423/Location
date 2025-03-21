import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import signupImage from '../signupuser.jpg';

const UserProfile = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    ageGroup: '',
    gender: '',
    languages: [],
    otherLanguage: '',

    // Step 2: Counseling Needs
    counselingTypes: [],
    otherCounselingType: '',
    currentIssues: [],
    otherIssue: '',
    severityLevel: '',
    counselorGenderPreference: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate current step only
    if (step === 1) {
      if (!formData.ageGroup || !formData.gender || formData.languages.length === 0) {
        alert('Please complete all required fields in Basic Information');
        return;
      }
      // If step 1 is valid, move to step 2
      setStep(2);
      return;
    }

    // Only validate step 2 fields when actually submitting
    if (step === 2) {
      if (!formData.counselingTypes.length || !formData.currentIssues.length || 
          !formData.severityLevel || !formData.counselorGenderPreference) {
        alert('Please complete all required fields in Counseling Needs');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          alert('Please login first');
          navigate('/login');
          return;
        }

        // Create the complete profile data
        const profileData = {
          ...formData,
          profileCompleted: true
        };

        const response = await axios.post(
          'http://localhost:5000/api/auth/create-user-profile',
          profileData,
          {
            headers: { 
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data) {
          alert('Profile created successfully!');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Profile creation error:', error.response || error);
        alert(error.response?.data?.message || 'Profile creation failed');
      }
    }
  };

  const nextStep = () => {
    if (step === 1) {
      handleSubmit({ preventDefault: () => {} }); // This will handle validation and step progression
    }
  };

  const prevStep = () => setStep(prev => prev - 1);

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <section className="form-step-section">
            <h3>Step 1: Basic Information</h3>
            <div className="form-questions">
              <div className="radio-group">
                <label>What is your age group?</label>
                {[
                  ['18-25', '18 - 25'],
                  ['26-35', '26 - 35'],
                  ['36-50', '36 - 50'],
                  ['51above', '51 and above']
                ].map(([value, label]) => (
                  <div key={value}>
                    <input
                      type="radio"
                      name="ageGroup"
                      value={value}
                      checked={formData.ageGroup === value}
                      onChange={handleChange}
                    />
                    <label>{label}</label>
                  </div>
                ))}
              </div>

              <div className="radio-group">
                <label>What is your gender?</label>
                {[
                  ['male', 'Male'],
                  ['female', 'Female']
                ].map(([value, label]) => (
                  <div key={value}>
                    <input
                      type="radio"
                      name="gender"
                      value={value}
                      checked={formData.gender === value}
                      onChange={handleChange}
                    />
                    <label>{label}</label>
                  </div>
                ))}
              </div>

              <div className="checkbox-group">
                <label>What language(s) are you comfortable with for counseling?</label>
                {[
                  ['English', 'English'],
                  ['Swahili', 'Swahili']
                ].map(([value, label]) => (
                  <div key={value}>
                    <input
                      type="checkbox"
                      name="languages"
                      value={value}
                      checked={formData.languages.includes(value)}
                      onChange={handleChange}
                    />
                    <label>{label}</label>
                  </div>
                ))}
                <input
                  className='userlang'
                  type="text"
                  name="otherLanguage"
                  placeholder="Other Languages"
                  value={formData.otherLanguage}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>
        );

      case 2:
        return (
          <section className="form-step-section">
            <h3>Step 2: Counseling Needs</h3>
            <div className="form-questions">
              <div className="checkbox-group">
                <label>What type of counseling are you seeking?</label>
                {[
                  ['General Mental Health', 'General Mental Health (stress, anxiety)'],
                  ['Relationship/Marital', 'Relationship/Marital Counseling'],
                  ['Family', 'Family Counseling'],
                  ['Trauma', 'Trauma & Abuse Recovery'],
                  ['Faith-Based', 'Faith-Based Counseling'],
                  ['Career', 'Career & Workplace Counseling'],
                  ['Addiction', 'Addiction Counseling'],
                  ['Grief', 'Grief & Loss Counseling'],
                  ['Academic', 'Student & Academic Counseling']
                ].map(([value, label]) => (
                  <div key={value}>
                    <input
                      type="checkbox"
                      name="counselingTypes"
                      value={value}
                      checked={formData.counselingTypes.includes(value)}
                      onChange={handleChange}
                    />
                    <label>{label}</label>
                  </div>
                ))}
                <input
                  type="text"
                  name="otherCounselingType"
                  placeholder="Other counseling type"
                  value={formData.otherCounselingType}
                  onChange={handleChange}
                />
              </div>

              <div className="checkbox-group">
                <label>Which issues would you say you are currently facing?</label>
                {[
                  ['Anxiety', 'Anxiety or stress'],
                  ['Depression', 'Depression or low mood'],
                  ['Relationship', 'Relationship or family issues'],
                  ['Work', 'Work or academic pressure'],
                  ['Trauma', 'Trauma or past experiences'],
                  ['Self-esteem', 'Low self-esteem or confidence'],
                  ['Grief', 'Grief or loss'],
                  ['Addiction', 'Addiction struggles']
                ].map(([value, label]) => (
                  <div key={value}>
                    <input
                      type="checkbox"
                      name="currentIssues"
                      value={value}
                      checked={formData.currentIssues.includes(value)}
                      onChange={handleChange}
                    />
                    <label>{label}</label>
                  </div>
                ))}
                <input
                  type="text"
                  name="otherIssue"
                  placeholder="Other issues"
                  value={formData.otherIssue}
                  onChange={handleChange}
                />
              </div>

              <div className="radio-group" >
                <label>How severe do you feel your situation is?</label>
                {[
                  ['mild', 'Mild (manageable)'],
                  ['moderate', 'Moderate (affects my daily life)'],
                  ['severe', 'Severe (significant distress)']
                ].map(([value, label]) => (
                  <div key={value}>
                    <input
                      type="radio"
                      name="severityLevel"
                      value={value}
                      checked={formData.severityLevel === value}
                      onChange={handleChange}
                    />
                    <label>{label}</label>
                  </div>
                ))}
              </div>

              <div className="radio-group">
                <label>Do you have a gender preference for your counselor?</label>
                {[
                  ['no-preference', 'No preference'],
                  ['male', 'Male'],
                  ['female', 'Female']
                ].map(([value, label]) => (
                  <div key={value}>
                    <input
                      type="radio"
                      name="counselorGenderPreference"
                      value={value}
                      checked={formData.counselorGenderPreference === value}
                      onChange={handleChange}
                    />
                    <label>{label}</label>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split-layout">
        {/* Left side - Hero section */}
        <div className="auth-hero profile-hero">
          <div className="auth-hero-content">
            <h1>Complete Your Profile</h1>
            <p>Help us understand you better to provide the best possible support</p>
          </div>
        </div>

        {/* Right side - Profile Form */}
        <div className="auth-form-container right-profile">
          <div className="auth-form-content user-p">
            <h2>Your Preferences</h2>
            <div className="progress-indicator">
              {[1, 2].map((dotStep) => (
                <div 
                  key={dotStep} 
                  className={`step-dot ${step === dotStep ? 'active' : ''}`}
                />
              ))}
            </div>
            <form onSubmit={handleSubmit} className="auth-form user-profile-form">
              {renderStep()}
              <div className="form-navigation">
                {step > 1 && (
                  <button type="button" onClick={prevStep} className="auth-button secondary">
                    Previous
                  </button>
                )}
                {step < 2 ? (
                  <button type="button" onClick={nextStep} className="auth-button">
                    Next
                  </button>
                ) : (
                  <button type="submit" className="auth-button">
                    Submit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 