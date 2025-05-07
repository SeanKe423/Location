import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../App.css';

const UserProfile = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    ageGroup: '',
    gender: '',
    languages: [],
    otherLanguage: '',
    location: {
      coordinates: [0, 0],
      address: ''
    },

    // Step 2: Counseling Needs
    counselingTypes: [],
    otherCounselingType: '',
    severityLevel: '',

    // Step 3: Accessibility & Availability
    preferredMode: [],

    // Step 4: Consent
    privacyPolicyConsent: false,
    emergencyCareConsent: false,
    matchingConsent: false
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'privacyPolicyConsent' || name === 'emergencyCareConsent' || name === 'matchingConsent') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked 
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate current step
    if (step === 1) {
      if (!formData.ageGroup || !formData.gender || formData.languages.length === 0) {
        alert('Please complete all required fields in Personal Information');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!formData.counselingTypes.length || !formData.severityLevel) {
        alert('Please complete all required fields in Counseling Needs');
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!formData.preferredMode.length) {
        alert('Please select at least one preferred mode of counseling');
        return;
      }
      setStep(4);
      return;
    }

    // Final submission
    if (step === 4) {
      if (!formData.privacyPolicyConsent || !formData.emergencyCareConsent || !formData.matchingConsent) {
        alert('Please agree to all consent statements');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          alert('Please login first');
          navigate('/login');
          return;
        }

        // Log the data being sent
        console.log('Submitting profile data:', formData);

        // Validate location data
        if (!formData.location.coordinates || !formData.location.address) {
          alert('Please provide your location');
          return;
        }

        const response = await axios.post(
          'http://localhost:5000/api/auth/create-user-profile',
          formData,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data) {
          alert('Profile created successfully!');
          navigate('/matchmaking');
        }
      } catch (error) {
        console.error('Profile creation error:', error.response?.data || error);
        alert(error.response?.data?.message || 'Profile creation failed. Please try again.');
      }
    }
  };

  const nextStep = () => {
    handleSubmit({ preventDefault: () => {} });
  };

  const prevStep = () => setStep(prev => prev - 1);

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: [lat, lng]
          }
        }));
      }
    });

    return formData.location.coordinates[0] !== 0 ? (
      <Marker position={formData.location.coordinates} />
    ) : null;
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <section className="form-step-section">
            <h3>Step 1: Personal Information</h3>
            <div className="form-questions">
              <div className="radio-group">
                <label>Age Group</label>
                {[
                  ['18-25', '18–25'],
                  ['26-35', '26–35'],
                  ['36-50', '36–50'],
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
                <label>Gender</label>
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
                <label>Languages You Prefer for Counseling</label>
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

              <div className="location-group">
                <label>Location</label>
                <div className="map-container">
                  <MapContainer
                    center={[0, 0]}
                    zoom={2}
                    style={{ height: '300px', width: '100%', marginBottom: '1rem' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <LocationMarker />
                  </MapContainer>
                </div>
                <input
                  type="text"
                  name="location.address"
                  placeholder="Physical Address"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: {
                      ...prev.location,
                      address: e.target.value
                    }
                  }))}
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
                <label>What Type of Counseling Are You Seeking?</label>
                {[
                  ['General Mental Health', 'General Mental Health (e.g., stress, anxiety)'],
                  ['Relationship', 'Relationship / Marital Counseling'],
                  ['Family', 'Family Counseling'],
                  ['Trauma', 'Trauma & Abuse Recovery'],
                  ['Faith-Based', 'Faith-Based Counseling'],
                  ['Career', 'Career / Workplace Counseling'],
                  ['Addiction', 'Addiction Counseling'],
                  ['Grief', 'Grief & Loss Counseling'],
                  ['Academic', 'Student / Academic Counseling']
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

              <div className="radio-group">
                <label>How Severe Are Your Current Issues?</label>
                {[
                  ['mild', 'Mild (Manageable on my own)'],
                  ['moderate', 'Moderate (Affecting my daily life)'],
                  ['severe', 'Severe (Significant distress or disruption)']
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
            </div>
          </section>
        );

      case 3:
        return (
          <section className="form-step-section">
            <h3>Step 3: Preferred Mode</h3>
            <div className="form-questions">
              <div className="checkbox-group">
                <label>Preferred Mode of Counseling</label>
                {[
                  ['in-person', 'In-person'],
                  ['online', 'Online / virtual'],
                  ['no-preference', 'No preference']
                ].map(([value, label]) => (
                  <div key={value}>
                    <input
                      type="radio"
                      name="preferredMode"
                      value={value}
                      checked={formData.preferredMode.includes(value)}
                      onChange={handleChange}
                    />
                    <label>{label}</label>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 4:
        return (
          <section className="form-step-section">
            <h3>Step 4: Consent</h3>
            <div className="form-questions">
              <div className="checkbox-group">
                <div>
                  <input
                    type="checkbox"
                    name="privacyPolicyConsent"
                    checked={formData.privacyPolicyConsent}
                    onChange={handleChange}
                    required
                  />
                  <label>I agree to the platform's privacy policy and terms of use</label>
                </div>

                <div>
                  <input
                    type="checkbox"
                    name="emergencyCareConsent"
                    checked={formData.emergencyCareConsent}
                    onChange={handleChange}
                    required
                  />
                  <label>I understand this platform does not offer emergency care</label>
                </div>

                <div>
                  <input
                    type="checkbox"
                    name="matchingConsent"
                    checked={formData.matchingConsent}
                    onChange={handleChange}
                    required
                  />
                  <label>I consent to being matched with counseling institutions based on my data and preferences</label>
                </div>
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
              {[1, 2, 3, 4].map((dotStep) => (
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
                {step < 4 ? (
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