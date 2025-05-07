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

    // Parse the form data
    let formData;
    try {
      formData = JSON.parse(req.body.data);
      console.log('Parsed form data:', formData); // Debug log
    } catch (parseError) {
      console.error('Error parsing form data:', parseError);
      return res.status(400).json({ 
        message: "Invalid form data format",
        error: parseError.message 
      });
    }

    // Handle file upload if documents were included
    let documentUrl = null;
    if (req.files && req.files.documents) {
      const file = req.files.documents;
      const fileName = `${Date.now()}_${file.name}`;
      await file.mv(`./uploads/${fileName}`);
      documentUrl = `/uploads/${fileName}`;
    }

    // Validate required fields
    const requiredFields = [
      'institutionName',
      'registrationNumber',
      'yearsOfOperation',
      'institutionType',
      'phoneNumber',
      'virtualCounseling',
      'numberOfCounselors',
      'waitTime'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        fields: missingFields
      });
    }

    // Validate location data
    if (!formData.location || !formData.location.address) {
      return res.status(400).json({
        message: "Location address is required"
      });
    }

    // Find and update counselor profile with new structure
    const updateData = {
      ...formData,
      documents: documentUrl,
      profileCompleted: true
    };

    console.log('Update data:', updateData); // Debug log

    const counselor = await Counselor.findByIdAndUpdate(
      counselorId,
      updateData,
      { new: true, runValidators: true }
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
    console.error("Error stack:", error.stack); // Add stack trace
    res.status(500).json({ 
      message: "Profile creation failed",
      error: error.message,
      stack: error.stack // Include stack trace in response
    });
  }
});

// Create user profile route
router.post("/create-user-profile", authMiddleware, async (req, res) => {
  try {
    console.log('Creating user profile with data:', JSON.stringify(req.body, null, 2));
    const userId = req.user.id;

    // Verify user exists and is not a counselor
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate required fields
    if (!req.body.ageGroup || !req.body.gender || !req.body.languages || !req.body.counselingTypes || !req.body.severityLevel || !req.body.preferredMode) {
      return res.status(400).json({ 
        message: "Missing required fields",
        receivedData: req.body
      });
    }

    // Validate location data
    if (!req.body.location || !req.body.location.coordinates || !req.body.location.address) {
      return res.status(400).json({ 
        message: "Invalid location data",
        receivedLocation: req.body.location
      });
    }

    // Helper function to safely parse arrays
    const safeParseArray = (data) => {
      if (Array.isArray(data)) return data;
      try {
        return JSON.parse(data || '[]');
      } catch (e) {
        return [];
      }
    };

    // Update user profile
    const updateData = {
      ageGroup: req.body.ageGroup,
      gender: req.body.gender,
      languages: safeParseArray(req.body.languages),
      otherLanguage: req.body.otherLanguage,
      location: {
        type: 'Point',
        coordinates: req.body.location.coordinates,
        address: req.body.location.address
      },
      counselingTypes: safeParseArray(req.body.counselingTypes),
      otherCounselingType: req.body.otherCounselingType,
      severityLevel: req.body.severityLevel,
      preferredMode: safeParseArray(req.body.preferredMode),
      privacyPolicyConsent: req.body.privacyPolicyConsent,
      emergencyCareConsent: req.body.emergencyCareConsent,
      matchingConsent: req.body.matchingConsent,
      profileCompleted: true
    };

    console.log('Update data:', JSON.stringify(updateData, null, 2));

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedUser) {
      console.error('User not found after update attempt');
      return res.status(404).json({ message: "User not found after update" });
    }

    console.log('Updated user:', JSON.stringify(updatedUser, null, 2));

    res.json({
      message: "Profile created successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Profile creation error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: "Profile creation failed",
      error: error.message,
      details: error.stack
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
      institutionName: req.body.institutionName,
      registrationNumber: req.body.registrationNumber,
      yearsOfOperation: req.body.yearsOfOperation,
      institutionType: req.body.institutionType,
      location: {
        coordinates: req.body.location.coordinates || [0, 0],
        address: req.body.location.address
      },
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      website: req.body.website,
      counselingServices: Array.isArray(req.body.counselingServices) ? req.body.counselingServices : JSON.parse(req.body.counselingServices || '[]'),
      otherCounselingService: req.body.otherCounselingService,
      targetAgeGroups: Array.isArray(req.body.targetAgeGroups) ? req.body.targetAgeGroups : JSON.parse(req.body.targetAgeGroups || '[]'),
      languages: Array.isArray(req.body.languages) ? req.body.languages : JSON.parse(req.body.languages || '[]'),
      otherLanguage: req.body.otherLanguage,
      virtualCounseling: req.body.virtualCounseling,
      numberOfCounselors: req.body.numberOfCounselors,
      waitTime: req.body.waitTime,
      isLegallyRegistered: req.body.isLegallyRegistered === 'true',
      upholdEthics: req.body.upholdEthics === 'true',
      consentToDisplay: req.body.consentToDisplay === 'true'
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
