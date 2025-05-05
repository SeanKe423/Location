import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
  });
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    // Clear any existing tokens on component mount
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Attempting login with:", formData);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login", 
        formData
      );

      console.log("Login response:", res.data);

      // Store token without 'Bearer' prefix
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (res.data.profileCompleted) {
        navigate("/connection-requests");
      } else {
        navigate(res.data.role === "counselor" ? "/counselor-profile" : "/user-profile");
      }
    } catch (error) {
      console.error("Login error:", error.response || error);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split-layout">
        {/* Left side - Content/Image */}
        <div className="auth-hero">
          <div className="auth-hero-content">
            <h1>Welcome Back</h1>
            <p>Your mental health journey continues here</p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="auth-form-container">
          <div className="auth-form-content">
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
              </div>
              
              <div className="form-group">
                <select 
                  name="role" 
                  value={formData.role}
                  onChange={handleChange}
                  className="auth-select"
                >
                  <option value="user">User</option>
                  <option value="counselor">Counselor</option>
                </select>
              </div>
              
              <button type="submit" className="auth-button">
                Login
              </button>
            </form>
            
            <p className="auth-footer">
              Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
            </p>
            
            <Link to="/" className="back-to-home">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
