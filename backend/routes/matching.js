const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const MatchingService = require('../services/matchingService');
const Match = require('../models/Match');
const Counselor = require('../models/Counselor');

// Get matches for a user
router.get('/find-matches', authMiddleware, async (req, res) => {
  try {
    console.log('Finding matches for user:', req.user.id);
    
    // First, check if there are any counselors
    const counselorCount = await Counselor.countDocuments({});
    console.log('Total counselors in database:', counselorCount);

    if (counselorCount === 0) {
      return res.json({
        message: 'No counselors available yet',
        matches: []
      });
    }

    const matches = await MatchingService.findMatches(req.user.id);
    console.log('Matches found:', matches);

    res.json(matches);
  } catch (error) {
    console.error('Error in find-matches route:', error);
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

module.exports = router; 