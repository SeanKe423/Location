const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Institution = require('../models/Institution');
const Match = require('../models/Match');
const { findMatches } = require('../services/matchingService');

// Get matches for a user
router.get('/matches', authMiddleware, async (req, res) => {
  try {
    console.log('Finding matches for user:', req.user.id);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all institutions that have completed their profiles
    const institutions = await Institution.find({ profileCompleted: true });
    console.log('Found institutions:', institutions.length);

    if (institutions.length === 0) {
      return res.status(404).json({ message: 'No institutions available for matching' });
    }

    try {
      // Find matches using the matching service
      const matches = findMatches(user, institutions);
      console.log('Found matches:', matches.length);
      
      // Format the response
      const formattedMatches = matches.map(match => ({
        institution: {
          id: match.institution._id,
          name: match.institution.institutionName,
          counselingServices: match.institution.counselingServices || [],
          languages: match.institution.languages || [],
          location: match.institution.location || {},
          waitTime: match.institution.waitTime,
          virtualCounseling: match.institution.virtualCounseling,
          numberOfCounselors: match.institution.numberOfCounselors,
          yearsOfOperation: match.institution.yearsOfOperation,
          targetAgeGroups: match.institution.targetAgeGroups || []
        },
        matchQuality: match.matchQuality,
        scores: match.scores
      }));

      res.json({
        matches: formattedMatches
      });
    } catch (matchError) {
      console.error('Error in matching algorithm:', matchError);
      res.status(500).json({ 
        message: 'Error in matching algorithm', 
        error: matchError.message 
      });
    }
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ 
      message: 'Error finding matches', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get match details
router.get('/match/:matchId', authMiddleware, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate('counselorId', '-password')
      .populate('userId', '-password');
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Error getting match details', error: error.message });
  }
});

// Update match status
router.put('/match/:matchId', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const match = await Match.findByIdAndUpdate(
      req.params.matchId,
      { status },
      { new: true }
    );
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Error updating match status', error: error.message });
  }
});

// Create a new match
router.post('/create-match', authMiddleware, async (req, res) => {
  try {
    const { counselorId } = req.body;
    const userId = req.user.id;

    // Check if match already exists
    const existingMatch = await Match.findOne({
      userId,
      counselorId,
      status: { $ne: 'rejected' }
    });

    if (existingMatch) {
      return res.status(400).json({ 
        message: 'You already have a pending or accepted match with this counselor' 
      });
    }

    const match = new Match({
      userId,
      counselorId,
      status: 'pending',
      matchScore: 0, // This will be calculated later
      matchCriteria: {
        languageMatch: 0,
        specializationMatch: 0,
        genderPreferenceMatch: 0
      }
    });

    await match.save();
    res.json(match);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ 
      message: 'Error creating match', 
      error: error.message 
    });
  }
});

// Get connection requests
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let requests;
    if (userRole === 'institution') {
      // Get requests sent to this institution
      requests = await Match.find({ 
        counselorId: userId,
        status: 'pending'
      }).populate('userId', 'fullName email');
    } else {
      // Get requests sent by this user
      requests = await Match.find({ 
        userId: userId,
        status: 'pending'
      }).populate('counselorId', 'institutionName email');
    }

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching connection requests:', error);
    res.status(500).json({ 
      message: 'Error fetching connection requests', 
      error: error.message 
    });
  }
});

// Accept connection request
router.post('/requests/:requestId/accept', authMiddleware, async (req, res) => {
  try {
    const request = await Match.findByIdAndUpdate(
      req.params.requestId,
      { status: 'accepted' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Request accepted', request });
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ 
      message: 'Error accepting request', 
      error: error.message 
    });
  }
});

// Reject connection request
router.post('/requests/:requestId/reject', authMiddleware, async (req, res) => {
  try {
    const request = await Match.findByIdAndUpdate(
      req.params.requestId,
      { status: 'rejected' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Request rejected', request });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ 
      message: 'Error rejecting request', 
      error: error.message 
    });
  }
});

module.exports = router; 