const User = require('../models/User');
const Institution = require('../models/Institution');
const Match = require('../models/Match');

const calculateDistance = (coords1, coords2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coords2[0] - coords1[0]);
  const dLon = toRad(coords2[1] - coords1[1]);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(coords1[0])) * Math.cos(toRad(coords2[0])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (degrees) => {
  return degrees * (Math.PI/180);
};

const filterEligibleInstitutions = (institutions, userPreferences) => {
  return institutions.filter(institution => {
    // Basic requirements
    if (!institution.isLegallyRegistered || 
        !institution.upholdEthics || 
        !institution.consentToDisplay) {
      return false;
    }

    // Mode compatibility
    const userPrefersOnline = userPreferences.preferredMode.includes('online');
    const userPrefersInPerson = userPreferences.preferredMode.includes('in-person');
    
    if (userPrefersOnline && institution.virtualCounseling !== 'yes') {
      return false;
    }

    return true;
  });
};

const calculateCounselingMatchScore = (userTypes, institutionServices, severityLevel) => {
  let score = 0;
  const maxScore = 40;

  // Count matching services
  const matches = userTypes.filter(type => 
    institutionServices.includes(type)
  ).length;

  // Base score on number of matches
  score = (matches / userTypes.length) * maxScore;

  // Adjust for severity level
  if (severityLevel === 'severe') {
    // Prioritize institutions with more matching services
    score *= 1.2;
  } else if (severityLevel === 'mild') {
    // More lenient matching for mild cases
    score *= 0.9;
  }

  return Math.min(score, maxScore);
};

const calculateLanguageMatchScore = (userLanguages, institutionLanguages) => {
  const maxScore = 20;
  const matches = userLanguages.filter(lang => 
    institutionLanguages.includes(lang)
  ).length;

  return (matches / userLanguages.length) * maxScore;
};

const calculateLocationMatchScore = (userLocation, institutionLocation, preferredMode) => {
  const maxScore = 20;
  let score = 0;

  if (preferredMode.includes('online')) {
    // For online sessions, location is less important
    score = maxScore * 0.8;
  } else {
    // Calculate distance between user and institution
    const distance = calculateDistance(
      userLocation.coordinates,
      institutionLocation.coordinates
    );

    // Score based on distance (closer = higher score)
    const MAX_DISTANCE = 100; // 100km
    score = maxScore * (1 - (distance / MAX_DISTANCE));
  }

  return Math.min(score, maxScore);
};

// Age group matching uses standardized values: children (3–12), adolescents (13–17), youngAdults (18–35), adults (36–60), seniors (61+)
const calculateAgeGroupMatchScore = (userAgeGroup, institutionTargetAgeGroups) => {
  const maxScore = 10;
  return institutionTargetAgeGroups.includes(userAgeGroup) ? maxScore : 0;
};

const calculateAdditionalFactorsScore = (institution) => {
  const maxScore = 10;
  let score = 0;

  // Handle yearsOfOperation as string or number
  let years = 0;
  if (typeof institution.yearsOfOperation === 'string') {
    if (institution.yearsOfOperation === 'less1') years = 0.5;
    else if (institution.yearsOfOperation === '1-5') years = 3;
    else if (institution.yearsOfOperation === '6-10') years = 8;
    else if (institution.yearsOfOperation === '10+') years = 12;
    else years = 0;
  } else if (typeof institution.yearsOfOperation === 'number') {
    years = institution.yearsOfOperation;
  }
  const yearsScore = Math.min(years / 10, 3);
  score += yearsScore;

  // Number of counselors (up to 3 points)
  let numCounselors = 0;
  if (typeof institution.numberOfCounselors === 'string') {
    numCounselors = parseInt(institution.numberOfCounselors) || 0;
  } else if (typeof institution.numberOfCounselors === 'number') {
    numCounselors = institution.numberOfCounselors;
  }
  const counselorsScore = Math.min(numCounselors / 10, 3);
  score += counselorsScore;

  // Legal and ethical compliance (4 points)
  if (institution.isLegallyRegistered && institution.upholdEthics) {
    score += 4;
  }

  // Always return a valid number
  return Math.min(isNaN(score) ? 0 : score, maxScore);
};

const getMatchQuality = (score) => {
  if (score >= 80) return 'Strong Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Moderate Match';
  return 'Weak Match';
};

const findMatches = (user, institutions) => {
  try {
    // 1. Filter eligible institutions
    const eligibleInstitutions = filterEligibleInstitutions(institutions, user);

    // 2. Calculate scores for each institution
    const scoredInstitutions = eligibleInstitutions.map(institution => {
      // Ensure targetAgeGroups is an array
      const targetAgeGroups = Array.isArray(institution.targetAgeGroups) ? 
        institution.targetAgeGroups : 
        [];

      console.log('Institution age groups:', {
        id: institution._id,
        name: institution.institutionName,
        targetAgeGroups
      });

      const counselingScore = calculateCounselingMatchScore(
        user.counselingServices || [],
        institution.counselingServices || [],
        user.severityLevel || 'moderate'
      );

      const languageScore = calculateLanguageMatchScore(
        user.languages || [],
        institution.languages || []
      );

      const locationScore = calculateLocationMatchScore(
        user.location || { coordinates: [0, 0] },
        institution.location || { coordinates: [0, 0] },
        user.preferredMode || ['online']
      );

      const ageGroupScore = calculateAgeGroupMatchScore(
        user.ageGroup || 'adult',
        targetAgeGroups
      );

      const additionalScore = calculateAdditionalFactorsScore(institution);

      // Calculate total score
      const totalScore = 
        counselingScore +
        languageScore +
        locationScore +
        ageGroupScore +
        additionalScore;

      return {
        institution: {
          ...institution.toObject(),
          id: institution._id,
          name: institution.institutionName,
          counselingServices: institution.counselingServices || institution.services || [],
          targetAgeGroups
        },
        scores: {
          counseling: counselingScore,
          language: languageScore,
          location: locationScore,
          ageGroup: ageGroupScore,
          additional: additionalScore,
          total: totalScore
        }
      };
    });

    // 3. Sort by total score and get top matches
    const sortedMatches = scoredInstitutions
      .sort((a, b) => b.scores.total - a.scores.total)
      .slice(0, 5);

    // 4. Add match quality indicators
    return sortedMatches.map(match => ({
      ...match,
      matchQuality: getMatchQuality(match.scores.total)
    }));
  } catch (error) {
    console.error('Error in findMatches:', error);
    throw error;
  }
};

class MatchingService {
  static calculateMatchScore(user, institution) {
    console.log('Calculating match score between:');
    console.log('User:', user);
    console.log('Institution:', institution);

    let score = 0;
    let matchCriteria = {
      languageMatch: 0,
      specializationMatch: 0,
      genderPreferenceMatch: 0
    };

    // Language matching (30% weight)
    const userLanguages = new Set(user.languages || []);
    const institutionLanguages = new Set(institution.languages || []);
    const languageMatches = [...userLanguages].filter(lang => institutionLanguages.has(lang));
    matchCriteria.languageMatch = userLanguages.size > 0 ? 
      (languageMatches.length / userLanguages.size) * 30 : 30;
    score += matchCriteria.languageMatch;

    // Specialization matching (40% weight)
    const userNeeds = new Set(user.counselingServices || []);
    const institutionSpecializations = new Set(institution.specializations || []);
    const specializationMatches = [...userNeeds].filter(need => 
      institutionSpecializations.has(need)
    );
    matchCriteria.specializationMatch = userNeeds.size > 0 ? 
      (specializationMatches.length / userNeeds.size) * 40 : 40;
    score += matchCriteria.specializationMatch;

    // Gender preference matching (30% weight)
    if (!user.counselorGenderPreference || 
        user.counselorGenderPreference === 'no-preference' || 
        user.counselorGenderPreference === institution.gender) {
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

      // Get all institutions without strict filters initially
      const institutions = await Institution.find({});
      console.log('Found institutions:', institutions);

      if (institutions.length === 0) {
        console.log('No institutions found in database');
        return [];
      }

      // Calculate matches for all institutions
      const matches = institutions.map(institution => {
        const { score, matchCriteria } = this.calculateMatchScore(user, institution);
        return {
          institutionId: institution,
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

// Export the findMatches function directly
module.exports = {
  findMatches,
  MatchingService
}; 