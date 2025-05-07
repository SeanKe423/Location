import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import InstitutionProfile from "./pages/InstitutionProfile";
import EditUserProfile from './pages/EditUserProfile';
import EditInstitutionProfile from './pages/EditInstitutionProfile';
import Dashboard from './pages/Dashboard';
import Matchmaking from './pages/Matchmaking';
import Matches from './pages/Matches';
import "./App.css";

const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/user-profile" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } />
          <Route path="/institution-profile" element={
            <PrivateRoute>
              <InstitutionProfile />
            </PrivateRoute>
          } />
          <Route path="/edit-user-profile" element={
            <PrivateRoute>
              <EditUserProfile />
            </PrivateRoute>
          } />
          <Route path="/edit-institution-profile" element={
            <PrivateRoute>
              <EditInstitutionProfile />
            </PrivateRoute>
          } />
          <Route path="/matchmaking" element={
            <PrivateRoute>
              <Matchmaking />
            </PrivateRoute>
          } />
          <Route path="/matches" element={
            <PrivateRoute>
              <Matches />
            </PrivateRoute>
          } />

          {/* Catch all undefined routes and redirect to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;