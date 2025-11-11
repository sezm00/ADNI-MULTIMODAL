const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Please provide patient ID']
  },
  date: {
    type: Date,
    required: [true, 'Please provide activity date'],
    default: Date.now
  },
  type: {
    type: String,
    required: [true, 'Please provide activity type'],
    enum: ['Physical Exercise', 'Cognitive Activity', 'Social Interaction', 'Therapy', 'Recreation', 'Other'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide activity description'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Please provide duration'],
    trim: true
  },
  mood: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  notes: {
    type: String,
    trim: true
  },
  completedBy: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  participants: {
    type: String,
    trim: true
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
activitySchema.index({ patientId: 1, date: -1 });
activitySchema.index({ userId: 1 });
activitySchema.index({ type: 1 });

module.exports = mongoose.model('Activity', activitySchema);
