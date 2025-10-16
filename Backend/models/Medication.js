const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Please provide patient ID']
  },
  name: {
    type: String,
    required: [true, 'Please provide medication name'],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, 'Please provide dosage'],
    trim: true
  },
  frequency: {
    type: String,
    required: [true, 'Please provide frequency'],
    trim: true
  },
  time: {
    type: String,
    required: [true, 'Please provide time'],
    trim: true
  },
  lastTaken: {
    type: Date
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  prescribedBy: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    trim: true
  },
  sideEffects: {
    type: String,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
medicationSchema.index({ patientId: 1, isActive: 1 });
medicationSchema.index({ userId: 1 });

module.exports = mongoose.model('Medication', medicationSchema);
