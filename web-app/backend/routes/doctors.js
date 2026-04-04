const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth, isDoctor } = require('../middleware/auth');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const inMemoryUsers = require('../inMemoryStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Public
router.get('/', async (req, res) => {
  try {
    if (!isDBConnected()) {
      const doctors = inMemoryUsers.filter(u => u.role === 'doctor').map(({ password, ...d }) => d);
      return res.json({ success: true, doctors });
    }

    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, doctors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get doctor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    if (!isDBConnected()) {
      const memUser = inMemoryUsers.find(u => u.id === req.params.id && u.role === 'doctor');
      if (memUser) {
        const { password, ...doctor } = memUser;
        return res.json({ success: true, doctor });
      }
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const doctor = await User.findById(req.params.id).select('-password');

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/doctors/:id
// @desc    Update doctor profile
// @access  Private (Doctor only)
router.put('/:id', auth, isDoctor, async (req, res) => {
  try {
    // Check authorization
    if (req.userId !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updateFields = {};
    const allowedFields = ['name', 'age', 'gender', 'phone', 'address', 'avatar'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ 
      success: true, 
      message: 'Doctor profile updated successfully',
      doctor 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/doctors/:id/statistics
// @desc    Get doctor statistics (appointments, patients, etc.)
// @access  Private (Doctor only)
router.get('/:id/statistics', auth, isDoctor, async (req, res) => {
  try {
    if (!isDBConnected()) {
      // Return mock statistics
      return res.json({
        success: true,
        statistics: {
          totalAppointments: 3,
          pendingAppointments: 1,
          confirmedAppointments: 2,
          completedAppointments: 0,
          totalPatients: 3
        }
      });
    }

    // Check authorization
    if (req.userId !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const totalAppointments = await Appointment.countDocuments({ doctorId: req.params.id });
    const pendingAppointments = await Appointment.countDocuments({ doctorId: req.params.id, status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ doctorId: req.params.id, status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ doctorId: req.params.id, status: 'completed' });

    // Get unique patients
    const appointments = await Appointment.find({ doctorId: req.params.id }).select('patientId');
    const uniquePatients = [...new Set(appointments.map(app => app.patientId.toString()))];

    const statistics = {
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      totalPatients: uniquePatients.length
    };

    res.json({ success: true, statistics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
