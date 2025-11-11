const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Please provide patient ID']
  },
  date: {
    type: Date,
    required: [true, 'Please provide appointment date']
  },
  time: {
    type: String,
    required: [true, 'Please provide appointment time'],
    trim: true
  },
  doctor: {
    type: String,
    required: [true, 'Please provide doctor name'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please provide appointment type'],
    enum: ['Neurologist', 'Psychiatrist', 'General Practitioner', 'Therapist', 'Specialist', 'Other'],
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled'
  },
  reminder: {
    type: Boolean,
    default: true
  },
  reminderSent: {
    type: Boolean,
    default: false
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
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ userId: 1 });
appointmentSchema.index({ status: 1 });

// Virtual to check if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  return this.date > new Date() && this.status === 'Scheduled';
});

// Ensure virtuals are included in JSON
appointmentSchema.set('toJSON', { virtuals: true });
appointmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
