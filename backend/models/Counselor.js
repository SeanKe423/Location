const mongoose = require("mongoose");

const counselorSchema = new mongoose.Schema({
  // User authentication fields
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
  fullName: {
    type: String,
    required: false // Can be added during profile creation
  },
  phoneNumber: {
    type: String,
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
  
  // Qualifications
  education: {
    type: String,
    enum: ['diploma', 'bachelors', 'masters', 'phd', 'other'],
    required: false
  },
  otherEducation: {
    type: String
  },
  cpbNumber: {
    type: String,
    required: false
  },
  otherCertifications: {
    type: String
  },
  yearsExperience: {
    type: String,
    enum: ['less1', '1-3', '4-6', '7+'],
    required: false
  },
  
  // Specializations
  specializations: [{
    type: String
  }],
  otherSpecialization: {
    type: String
  },
  
  // Verification
  documents: {
    type: String // URL to uploaded document
  },
  agreeToTerms: {
    type: Boolean,
    default: false
  },
  additionalComments: {
    type: String
  },
  
  // Profile status
  profileCompleted: {
    type: Boolean,
    default: false
  },
  isVerified: {
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
  }
});

// Update timestamp on save
counselorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Counselor", counselorSchema);
