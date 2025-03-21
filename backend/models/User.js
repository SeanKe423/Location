const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Authentication fields
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },

  // Profile fields
  ageGroup: {
    type: String,
    enum: ['under18', '18-25', '26-35', '36-50', '51above'],
    required: false
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: false
  },
  languages: [{
    type: String
  }],
  otherLanguage: {
    type: String
  },

  // Counseling needs
  counselingTypes: [{
    type: String
  }],
  otherCounselingType: {
    type: String
  },
  currentIssues: [{
    type: String
  }],
  otherIssue: {
    type: String
  },
  severityLevel: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    required: false
  },
  counselorGenderPreference: {
    type: String,
    enum: ['no-preference', 'male', 'female'],
    required: false
  },
  additionalPreferences: {
    type: String
  },

  // Profile status
  profileCompleted: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Additional fields
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'counselor'],
    default: 'user'
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
