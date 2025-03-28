const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Counselor = require("../models/Counselor");
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected route for user profile
router.get('/user-profile', authMiddleware, authController.getUserProfile);

// Protected Route - Get User Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user =
      req.user.role === "counselor"
        ? await Counselor.findById(req.user.id).select("-password")
        : await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Add this route for counselor profile creation
router.post("/create-counselor-profile", authMiddleware, async (req, res) => {
  try {
    console.log('Request user:', req.user); // Debug log
    const counselorId = req.user.id;

    // Verify the user is a counselor
    if (req.user.role !== 'counselor') {
      return res.status(403).json({ message: 'Access denied. Counselor role required.' });
    }

    // Handle file upload if documents were included
    let documentUrl = null;
    if (req.files && req.files.documents) {
      const file = req.files.documents;
      const fileName = `${Date.now()}_${file.name}`;
      await file.mv(`./uploads/${fileName}`);
      documentUrl = `/uploads/${fileName}`;
    }

    // Find and update counselor profile
    const counselor = await Counselor.findByIdAndUpdate(
      counselorId,
      {
        fullName: req.body.fullName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        gender: req.body.gender,
        languages: JSON.parse(req.body.languages || '[]'),
        otherLanguage: req.body.otherLanguage,
        education: req.body.education,
        otherEducation: req.body.otherEducation,
        cpbNumber: req.body.cpbNumber,
        otherCertifications: req.body.otherCertifications,
        yearsExperience: req.body.yearsExperience,
        specializations: JSON.parse(req.body.specializations || '[]'),
        otherSpecialization: req.body.otherSpecialization,
        documents: documentUrl,
        agreeToTerms: req.body.agreeToTerms === 'true',
        additionalComments: req.body.additionalComments,
        profileCompleted: true
      },
      { new: true }
    );

    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    res.json({
      message: "Profile created successfully",
      counselor
    });

  } catch (error) {
    console.error("Profile creation error:", error);
    res.status(500).json({ 
      message: "Profile creation failed",
      error: error.message 
    });
  }
});

// Create user profile route
router.post("/create-user-profile", authMiddleware, async (req, res) => {
  try {
    console.log('Creating user profile with data:', req.body); // Debug log
    const userId = req.user.id;

    // Verify user exists and is not a counselor
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ageGroup: req.body.ageGroup,
        gender: req.body.gender,
        languages: Array.isArray(req.body.languages) ? req.body.languages : JSON.parse(req.body.languages || '[]'),
        otherLanguage: req.body.otherLanguage,
        counselingTypes: Array.isArray(req.body.counselingTypes) ? req.body.counselingTypes : JSON.parse(req.body.counselingTypes || '[]'),
        otherCounselingType: req.body.otherCounselingType,
        currentIssues: Array.isArray(req.body.currentIssues) ? req.body.currentIssues : JSON.parse(req.body.currentIssues || '[]'),
        otherIssue: req.body.otherIssue,
        severityLevel: req.body.severityLevel,
        counselorGenderPreference: req.body.counselorGenderPreference,
        additionalPreferences: req.body.additionalPreferences,
        profileCompleted: true
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    console.log('Updated user:', updatedUser); // Debug log

    res.json({
      message: "Profile created successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Profile creation error:", error);
    res.status(500).json({ 
      message: "Profile creation failed",
      error: error.message 
    });
  }
});

// Get counselor profile
router.get("/counselor-profile", authMiddleware, async (req, res) => {
  try {
    const counselorId = req.user.id;
    const counselor = await Counselor.findById(counselorId).select('-password');
    
    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    res.json(counselor);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Edit user profile
router.put("/edit-user-profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ageGroup: req.body.ageGroup,
        gender: req.body.gender,
        languages: Array.isArray(req.body.languages) ? req.body.languages : JSON.parse(req.body.languages || '[]'),
        otherLanguage: req.body.otherLanguage,
        counselingTypes: Array.isArray(req.body.counselingTypes) ? req.body.counselingTypes : JSON.parse(req.body.counselingTypes || '[]'),
        otherCounselingType: req.body.otherCounselingType,
        currentIssues: Array.isArray(req.body.currentIssues) ? req.body.currentIssues : JSON.parse(req.body.currentIssues || '[]'),
        otherIssue: req.body.otherIssue,
        severityLevel: req.body.severityLevel,
        counselorGenderPreference: req.body.counselorGenderPreference
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Profile update failed", error: error.message });
  }
});

// Edit counselor profile
router.put("/edit-counselor-profile", authMiddleware, async (req, res) => {
  try {
    const counselorId = req.user.id;
    
    let documentUrl = undefined;
    if (req.files && req.files.documents) {
      const file = req.files.documents;
      const fileName = `${Date.now()}_${file.name}`;
      await file.mv(`./uploads/${fileName}`);
      documentUrl = `/uploads/${fileName}`;
    }

    const updateData = {
      fullName: req.body.fullName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      gender: req.body.gender,
      languages: Array.isArray(req.body.languages) ? req.body.languages : JSON.parse(req.body.languages || '[]'),
      otherLanguage: req.body.otherLanguage,
      education: req.body.education,
      otherEducation: req.body.otherEducation,
      cpbNumber: req.body.cpbNumber,
      otherCertifications: req.body.otherCertifications,
      yearsExperience: req.body.yearsExperience,
      specializations: Array.isArray(req.body.specializations) ? req.body.specializations : JSON.parse(req.body.specializations || '[]'),
      otherSpecialization: req.body.otherSpecialization,
      agreeToTerms: req.body.agreeToTerms === 'true',
      additionalComments: req.body.additionalComments
    };

    // Only add documentUrl if a new file was uploaded
    if (documentUrl) {
      updateData.documents = documentUrl;
    }

    const updatedCounselor = await Counselor.findByIdAndUpdate(
      counselorId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCounselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    res.json({
      message: "Profile updated successfully",
      counselor: updatedCounselor
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Profile update failed", error: error.message });
  }
});

// Add this route to verify token validity
router.get("/verify-token", authMiddleware, (req, res) => {
  res.json({ valid: true });
});

// Add this route temporarily for testing
router.post('/create-test-counselor', async (req, res) => {
  try {
    const testCounselor = new Counselor({
      email: 'test.counselor@example.com',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Test Counselor',
      phoneNumber: '1234567890',
      gender: 'female',
      languages: ['English', 'Swahili'],
      education: 'masters',
      cpbNumber: 'CPB123',
      yearsExperience: '4-6',
      specializations: [
        'General Mental Health',
        'Relationship/Marital Counselling',
        'Family Counselling'
      ],
      profileCompleted: true,
      isVerified: true
    });

    await testCounselor.save();
    res.json({ message: 'Test counselor created', counselor: testCounselor });
  } catch (error) {
    console.error('Error creating test counselor:', error);
    res.status(500).json({ message: 'Error creating test counselor', error: error.message });
  }
});

module.exports = router;
