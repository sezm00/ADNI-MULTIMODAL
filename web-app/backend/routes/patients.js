const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/patients
// @desc    Get all patients (for doctors)
// @access  Private (Doctor)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access denied. Doctor role required.' });
    }

    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, patients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select('-password');

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, patient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient profile
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    // Check authorization
    if (req.userId !== req.params.id && req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updateFields = {};
    const allowedFields = ['name', 'age', 'gender', 'phone', 'address', 'avatar'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const patient = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ 
      success: true, 
      message: 'Patient updated successfully',
      patient 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/patients/:id
// @desc    Delete patient
// @access  Private (Admin/Doctor)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const patient = await User.findById(req.params.id);

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true, 
      message: 'Patient deleted successfully' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
