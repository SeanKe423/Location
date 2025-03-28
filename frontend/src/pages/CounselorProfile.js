import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import signupImage from '../signupuser.jpg'; // Update the image import

const CounselorProfile = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information (removed fullName and email)
    phoneNumber: '',
    gender: '',
    languages: [],
    otherLanguage: '',

    // Step 2: Qualifications & Experience
    education: '',
    otherEducation: '',
    cpbNumber: '',
    otherCertifications: '',
    yearsExperience: '',

    // Step 3: Specialization
    specializations: [],
    otherSpecialization: '',

    // Step 4: Verification
    documents: null,
    agreeToTerms: false,
    additionalComments: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'languages' || name === 'specializations') {
        setFormData(prev => ({
          ...prev,
          [name]: checked 
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: e.target.files[0]
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
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      console.log('Submitting with token:', token); // Debug log

      const formDataToSend = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key === 'documents') {
          if (formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        } else if (Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post(
        'http://localhost:5000/api/auth/create-counselor-profile',
        formDataToSend,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Profile creation response:', response.data); // Debug log

      if (response.data) {
        alert('Profile created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Profile creation error:', error.response || error);
      alert(error.response?.data?.message || 'Profile creation failed');
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <section className="form-step-section">
            <h3>Step 1: Basic Information</h3>
            <div className="form-questions">
              <input
                className='counseltext'
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              
              <div className="radio-group">
                <label>Gender:</label>
                <div>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                  />
                  <label>Male</label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                  />
                  <label>Female</label>
                </div>
              </div>

              <div className="checkbox-group">
                <label>Languages you can provide counselling in:</label>
                <div>
                  <input
                    type="checkbox"
                    name="languages"
                    value="English"
                    checked={formData.languages.includes('English')}
                    onChange={handleChange}
                  />
                  <label>English</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="languages"
                    value="Swahili"
                    checked={formData.languages.includes('Swahili')}
                    onChange={handleChange}
                  />
                  <label>Swahili</label>
                </div>
                <input
                  className='ol'
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
            <h3>Step 2: Qualifications & Experience</h3>
            <div className="form-questions">
              <select name="education" onChange={handleChange} required>
                <option value="">Select Education Level</option>
                <option value="diploma">Diploma in Counselling Psychology</option>
                <option value="bachelors">Bachelor's Degree in Counselling Psychology</option>
                <option value="masters">Master's Degree in Counselling Psychology</option>
                <option value="phd">PhD in Counselling Psychology</option>
                <option value="other">Other</option>
              </select>
              
              {formData.education === 'other' && (
                <input
                  className='counseltext'
                  type="text"
                  name="otherEducation"
                  placeholder="Specify Other Education"
                  value={formData.otherEducation}
                  onChange={handleChange}
                />
              )}

              <input
                className='counseltext'
                type="text"
                name="cpbNumber"
                placeholder="CPB Number"
                value={formData.cpbNumber}
                onChange={handleChange}
                required
              />
              
              <textarea
                className='counseltext'
                name="otherCertifications"
                placeholder="Other Certifications"
                value={formData.otherCertifications}
                onChange={handleChange}
              />

              <select name="yearsExperience" onChange={handleChange} required>
                <option value="">Years of Experience</option>
                <option value="less1">Less than 1 year</option>
                <option value="1-3">1 - 3 years</option>
                <option value="4-6">4 - 6 years</option>
                <option value="7+">7+ years</option>
              </select>
            </div>
          </section>
        );

      case 3:
        return (
          <section className="form-step-section">
            <h3>Step 3: Areas of Specialization</h3>
            <div className="form-questions">
              <div className="checkbox-group">
                {[
                  'General Mental Health',
                  'Relationship/Marital Counselling',
                  'Family Counselling',
                  'Trauma & Abuse Recovery',
                  'Faith-Based Counselling',
                  'Career & Workplace Counselling',
                  'Addiction Counselling',
                  'Grief & Loss Counselling',
                  'Student & Academic Counselling'
                ].map(spec => (
                  <div key={spec}>
                    <input
                      type="checkbox"
                      name="specializations"
                      value={spec}
                      checked={formData.specializations.includes(spec)}
                      onChange={handleChange}
                    />
                    <label>{spec}</label>
                  </div>
                ))}
                <input
                  className='ol'
                  type="text"
                  name="otherSpecialization"
                  placeholder="Other Specializations"
                  value={formData.otherSpecialization}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>
        );

      case 4:
        return (
          <section className="form-step-section">
            <h3>Step 4: Verification & Final Steps</h3>
            <div className="form-questions">
              <div className="file-upload">
                <label>Upload Documents:</label>
                <input
                  type="file"
                  name="documents"
                  onChange={handleChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
              </div>

              <div className="checkbox-group">
                <div>
                  <input
                    type="checkbox"
                    style={{ transform: "scale(2.0)", margin: "5px" }} 
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                  />
                  <label>I agree to the platform's ethical guidelines and confidentiality policies</label>
                </div>
              </div>

              <textarea
                className='counseltext'
                name="additionalComments"
                placeholder="Additional Comments (Optional)"
                value={formData.additionalComments}
                onChange={handleChange}
              />
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
        <div className="auth-hero counselor-hero">
          <img src={signupImage} alt="Supportive hands" />
          <div className="auth-hero-content">
            <h1>Complete Your Profile</h1>
            <p>Join our network of mental health professionals</p>
          </div>
        </div>

        {/* Right side - Profile Form */}
        <div className="auth-form-container">
          <div className="auth-form-content counselor">
            <h2>Professional Details</h2>
            <div className="progress-indicator">
              {[1, 2, 3, 4].map((dotStep) => (
                <div 
                  key={dotStep} 
                  className={`step-dot ${step === dotStep ? 'active' : ''}`}
                />
              ))}
            </div>
            <form onSubmit={handleSubmit} className="auth-form counselor-form">
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

export default CounselorProfile; 