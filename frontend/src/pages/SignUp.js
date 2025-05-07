import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../App.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user", // Default role is user
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      // Redirect based on role
      navigate(formData.role === "user" ? "/user-profile" : "/institution-profile");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split-layout">
        {/* Left side - Hero section */}
        <div className="auth-hero signup-hero">
          <div className="auth-hero-content">
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>Begin Your Journey</h1>
            <p style={{ fontSize: '1.5rem', opacity: '0.9' }}>
            Support isn’t far. Let’s get you closer.
            </p>
          </div>
        </div>

        {/* Right side - Sign Up Form */}
        <div className="auth-form-container">
          <div className="auth-form-content">
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Create Account</h2>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  onChange={handleChange}
                  required
                  className="auth-input"
                  style={{ fontSize: '1.2rem', padding: '1rem' }}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  onChange={handleChange}
                  required
                  className="auth-input"
                  style={{ fontSize: '1.2rem', padding: '1rem' }}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                  className="auth-input"
                  style={{ fontSize: '1.2rem', padding: '1rem' }}
                />
              </div>
              
              <div className="form-group">
                <select 
                  name="role" 
                  onChange={handleChange}
                  className="auth-select"
                  style={{ fontSize: '1.2rem', padding: '1rem' }}
                >
                  <option value="user">User</option>
                  <option value="institution">Institution</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="auth-button"
                style={{ fontSize: '1.2rem', padding: '1rem' }}
              >
                Sign Up
              </button>
            </form>
            
            <p className="auth-footer" style={{ fontSize: '1rem', marginTop: '1.5rem' }}>
              Already have an account? <Link to="/login" className="auth-link">Login</Link>
            </p>
            
            <Link to="/" className="back-to-home" style={{ fontSize: '0.9rem' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
