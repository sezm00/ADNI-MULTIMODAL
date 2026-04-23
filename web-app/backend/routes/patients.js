const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');
const User = require('../models/User');
const inMemoryUsers = require('../inMemoryStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @route   GET /api/patients
// @desc    Get all patients (for doctors)
// @access  Private (Doctor)
router.get('/', auth, auditLog, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access denied. Doctor role required.' });
    }

    if (isDBConnected()) {
      const patients = await User.find({ role: 'patient' })
        .select('-password')
        .sort({ createdAt: -1 });
      return res.json({ success: true, patients });
    }

    const patients = inMemoryUsers
      .filter(u => u.role === 'patient')
      .map(({ password, ...u }) => u);
    res.json({ success: true, patients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', auth, auditLog, async (req, res) => {
  try {
    if (isDBConnected()) {
      const patient = await User.findById(req.params.id).select('-password');
      if (!patient || patient.role !== 'patient') {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }
      return res.json({ success: true, patient });
    }

    const found = inMemoryUsers.find(u => u.id === req.params.id && u.role === 'patient');
    if (!found) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    const { password, ...patient } = found;
    res.json({ success: true, patient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient profile
// @access  Private
router.put('/:id', auth, auditLog, async (req, res) => {
  try {
    if (req.userId !== req.params.id && req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const allowedFields = ['name', 'age', 'gender', 'phone', 'address', 'avatar'];
    const updateFields = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateFields[field] = req.body[field];
    });

    if (isDBConnected()) {
      const patient = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true }
      ).select('-password');
      if (!patient || patient.role !== 'patient') {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }
      return res.json({ success: true, message: 'Patient updated successfully', patient });
    }

    const idx = inMemoryUsers.findIndex(u => u.id === req.params.id && u.role === 'patient');
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    Object.assign(inMemoryUsers[idx], updateFields);
    const { password, ...patient } = inMemoryUsers[idx];
    res.json({ success: true, message: 'Patient updated successfully', patient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/patients/:id
// @desc    Delete patient
// @access  Private (Doctor)
router.delete('/:id', auth, auditLog, async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (isDBConnected()) {
      const patient = await User.findById(req.params.id);
      if (!patient || patient.role !== 'patient') {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }
      await User.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Patient deleted successfully' });
    }

    const idx = inMemoryUsers.findIndex(u => u.id === req.params.id && u.role === 'patient');
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    inMemoryUsers.splice(idx, 1);
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
