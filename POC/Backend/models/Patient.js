const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide patient name'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Please provide patient age'],
    min: 0
  },
  diagnosis: {
    type: String,
    required: [true, 'Please provide diagnosis'],
    trim: true
  },
  stage: {
    type: String,
    enum: ['Mild', 'Moderate', 'Severe'],
    required: [true, 'Please provide disease stage']
  },
  caregiverId: {
    type: String,
    required: [true, 'Please provide caregiver ID'],
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  contactNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  medicalHistory: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
patientSchema.index({ userId: 1, isActive: 1 });
patientSchema.index({ name: 'text' });

module.exports = mongoose.model('Patient', patientSchema);
