const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'current'],
    default: 'pending'
  },
  condition: {
    type: String,
    required: true
  },
  symptoms: [String],
  notes: String,
  consultationNotes: String,
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Insurance Pending'],
    default: 'Pending'
  },
  fee: {
    type: Number,
    required: true
  },
  cardInfo: String
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
