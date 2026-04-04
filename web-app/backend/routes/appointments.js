const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth, isDoctor } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const isDBConnected = () => mongoose.connection.readyState === 1;

// Mock appointments for when MongoDB is unavailable
const getMockAppointments = (userRole, userId) => {
  return [
    {
      _id: 'mock-apt-1',
      date: '2026-04-05',
      time: '09:00',
      condition: 'Mild Cognitive Impairment',
      status: 'confirmed',
      notes: 'Follow-up cognitive assessment',
      consultationNotes: 'Patient showing improvement',
      fee: 150,
      paymentStatus: 'Paid',
      patientId: { _id: 'mock-patient-1', name: 'Margaret Thompson', email: 'margaret@test.com', age: 72, gender: 'Female', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
      doctorId: { _id: userId, name: 'Dr. Smith', email: 'doctor@test.com', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop' }
    },
    {
      _id: 'mock-apt-2',
      date: '2026-04-06',
      time: '14:00',
      condition: 'Early Alzheimer\'s',
      status: 'pending',
      notes: 'Initial consultation',
      consultationNotes: '',
      fee: 200,
      paymentStatus: 'Pending',
      patientId: { _id: 'mock-patient-2', name: 'Robert Johnson', email: 'robert@test.com', age: 68, gender: 'Male', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
      doctorId: { _id: userId, name: 'Dr. Smith', email: 'doctor@test.com', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop' }
    },
    {
      _id: 'mock-apt-3',
      date: '2026-04-07',
      time: '11:30',
      condition: 'Memory Assessment',
      status: 'confirmed',
      notes: 'Routine check-up',
      consultationNotes: 'Stable condition',
      fee: 120,
      paymentStatus: 'Paid',
      patientId: { _id: 'mock-patient-3', name: 'Susan Williams', email: 'susan@test.com', age: 75, gender: 'Female', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
      doctorId: { _id: userId, name: 'Dr. Smith', email: 'doctor@test.com', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop' }
    }
  ];
};

// @route   GET /api/appointments
// @desc    Get all appointments (for doctors) or user's appointments (for patients)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      const appointments = getMockAppointments(req.user.role, req.userId);
      return res.json({ success: true, appointments });
    }

    let appointments;

    if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ doctorId: req.userId })
        .populate('patientId', 'name email age gender avatar')
        .sort({ date: -1, time: -1 });
    } else {
      appointments = await Appointment.find({ patientId: req.userId })
        .populate('doctorId', 'name email avatar')
        .sort({ date: -1, time: -1 });
    }

    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email age gender avatar phone address')
      .populate('doctorId', 'name email avatar');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check authorization
    if (appointment.patientId._id.toString() !== req.userId && 
        appointment.doctorId._id.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, date, time, duration, condition, symptoms, notes } = req.body;

    const appointment = new Appointment({
      patientId: req.userId,
      doctorId,
      date,
      time,
      duration: duration || 30,
      condition,
      symptoms,
      notes,
      status: 'pending'
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email age gender avatar')
      .populate('doctorId', 'name email avatar');

    res.status(201).json({ 
      success: true, 
      message: 'Appointment created successfully',
      appointment: populatedAppointment 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check authorization
    if (appointment.patientId.toString() !== req.userId && 
        appointment.doctorId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updateFields = {};
    const allowedFields = ['date', 'time', 'duration', 'status', 'condition', 'symptoms', 'notes', 'consultationNotes', 'fee', 'paymentStatus', 'cardInfo'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).populate('patientId', 'name email age gender avatar')
     .populate('doctorId', 'name email avatar');

    res.json({ 
      success: true, 
      message: 'Appointment updated successfully',
      appointment 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check authorization
    if (appointment.patientId.toString() !== req.userId && 
        appointment.doctorId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true, 
      message: 'Appointment deleted successfully' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/appointments/doctor/:doctorId
// @desc    Get appointments by doctor ID
// @access  Private
router.get('/doctor/:doctorId', auth, isDoctor, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId })
      .populate('patientId', 'name email age gender avatar')
      .sort({ date: -1, time: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/appointments/patient/:patientId
// @desc    Get appointments by patient ID
// @access  Private
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    // Check authorization
    if (req.userId !== req.params.patientId && req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const appointments = await Appointment.find({ patientId: req.params.patientId })
      .populate('doctorId', 'name email avatar')
      .sort({ date: -1, time: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
