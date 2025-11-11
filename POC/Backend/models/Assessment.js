const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Please provide patient ID']
  },
  date: {
    type: Date,
    required: [true, 'Please provide assessment date'],
    default: Date.now
  },
  memoryScore: {
    type: Number,
    required: [true, 'Please provide memory score'],
    min: 0,
    max: 100
  },
  cognitiveScore: {
    type: Number,
    required: [true, 'Please provide cognitive score'],
    min: 0,
    max: 100
  },
  behaviorScore: {
    type: Number,
    required: [true, 'Please provide behavior score'],
    min: 0,
    max: 100
  },
  notes: {
    type: String,
    trim: true
  },
  assessedBy: {
    type: String,
    trim: true
  },
  assessmentType: {
    type: String,
    enum: ['Initial', 'Follow-up', 'Quarterly', 'Annual'],
    default: 'Follow-up'
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
assessmentSchema.index({ patientId: 1, date: -1 });
assessmentSchema.index({ userId: 1 });

// Virtual for overall score
assessmentSchema.virtual('overallScore').get(function() {
  return Math.round((this.memoryScore + this.cognitiveScore + this.behaviorScore) / 3);
});

// Ensure virtuals are included in JSON
assessmentSchema.set('toJSON', { virtuals: true });
assessmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
