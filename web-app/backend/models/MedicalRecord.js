const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  recordType: {
    type: String,
    enum: ['lab-result', 'imaging', 'prescription', 'diagnosis', 'vital-signs', 'brain-scan'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  findings: String,
  recommendations: String,
  diagnosis: String,
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    oxygenSaturation: Number
  },
  brainHealthMetrics: {
    memoryScore: Number,
    cognitiveScore: Number,
    brainActivity: Number,
    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High']
    }
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
