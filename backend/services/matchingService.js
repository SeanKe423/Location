const User = require('../models/User');
const Counselor = require('../models/Counselor');
const Match = require('../models/Match');

class MatchingService {
  static calculateMatchScore(user, counselor) {
    console.log('Calculating match score between:');
    console.log('User:', user);
    console.log('Counselor:', counselor);

    let score = 0;
    let matchCriteria = {
      languageMatch: 0,
      specializationMatch: 0,
      genderPreferenceMatch: 0
    };

    // Language matching (30% weight)
    const userLanguages = new Set(user.languages || []);
    const counselorLanguages = new Set(counselor.languages || []);
    const languageMatches = [...userLanguages].filter(lang => counselorLanguages.has(lang));
    matchCriteria.languageMatch = userLanguages.size > 0 ? 
      (languageMatches.length / userLanguages.size) * 30 : 30;
    score += matchCriteria.languageMatch;

    // Specialization matching (40% weight)
    const userNeeds = new Set(user.counselingTypes || []);
    const counselorSpecializations = new Set(counselor.specializations || []);
    const specializationMatches = [...userNeeds].filter(need => 
      counselorSpecializations.has(need)
    );
    matchCriteria.specializationMatch = userNeeds.size > 0 ? 
      (specializationMatches.length / userNeeds.size) * 40 : 40;
    score += matchCriteria.specializationMatch;

    // Gender preference matching (30% weight)
    if (!user.counselorGenderPreference || 
        user.counselorGenderPreference === 'no-preference' || 
        user.counselorGenderPreference === counselor.gender) {
      matchCriteria.genderPreferenceMatch = 30;
      score += 30;
    }

    console.log('Match score calculated:', { score, matchCriteria });
    return { score, matchCriteria };
  }

  static async findMatches(userId) {
    try {
      // Get user profile
      const user = await User.findById(userId);
      if (!user) {
        console.log('User not found:', userId);
        throw new Error('User not found');
      }
      console.log('Found user:', user);

      // Get all counselors without strict filters initially
      const counselors = await Counselor.find({});
      console.log('Found counselors:', counselors);

      if (counselors.length === 0) {
        console.log('No counselors found in database');
        return [];
      }

      // Calculate matches for all counselors
      const matches = counselors.map(counselor => {
        const { score, matchCriteria } = this.calculateMatchScore(user, counselor);
        return {
          counselorId: counselor,
          userId: user._id,
          matchScore: score,
          matchCriteria,
          status: 'pending'
        };
      });

      console.log('Calculated matches:', matches);

      // Sort by match score
      matches.sort((a, b) => b.matchScore - a.matchScore);

      // Return top 5 matches
      return matches.slice(0, 5);
    } catch (error) {
      console.error('Error in findMatches:', error);
      throw error;
    }
  }
}

module.exports = MatchingService; 