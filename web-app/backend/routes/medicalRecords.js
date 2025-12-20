const express = require('express');
const router = express.Router();
const { auth, isDoctor } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');

// @route   GET /api/medical-records/patient/:patientId
// @desc    Get all medical records for a patient
// @access  Private
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    // Check authorization
    if (req.userId !== req.params.patientId && req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const records = await MedicalRecord.find({ patientId: req.params.patientId })
      .populate('doctorId', 'name email')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json({ success: true, records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/medical-records/:id
// @desc    Get medical record by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patientId', 'name email age gender')
      .populate('doctorId', 'name email')
      .populate('appointmentId');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    // Check authorization
    if (record.patientId._id.toString() !== req.userId && req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/medical-records
// @desc    Create new medical record
// @access  Private (Doctor only)
router.post('/', auth, isDoctor, async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      recordType,
      diagnosis,
      medications,
      vitalSigns,
      brainHealthMetrics,
      attachments
    } = req.body;

    const record = new MedicalRecord({
      patientId,
      doctorId: req.userId,
      appointmentId,
      recordType,
      diagnosis,
      medications,
      vitalSigns,
      brainHealthMetrics,
      attachments
    });

    await record.save();

    const populatedRecord = await MedicalRecord.findById(record._id)
      .populate('patientId', 'name email age gender')
      .populate('doctorId', 'name email')
      .populate('appointmentId');

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      record: populatedRecord
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/medical-records/:id
// @desc    Update medical record
// @access  Private (Doctor only)
router.put('/:id', auth, isDoctor, async (req, res) => {
  try {
    let record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    // Check authorization - only the doctor who created it can update
    if (record.doctorId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updateFields = {};
    const allowedFields = ['recordType', 'diagnosis', 'medications', 'vitalSigns', 'brainHealthMetrics', 'attachments'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).populate('patientId', 'name email age gender')
     .populate('doctorId', 'name email')
     .populate('appointmentId');

    res.json({
      success: true,
      message: 'Medical record updated successfully',
      record
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/medical-records/:id
// @desc    Delete medical record
// @access  Private (Doctor only)
router.delete('/:id', auth, isDoctor, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    // Check authorization - only the doctor who created it can delete
    if (record.doctorId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await MedicalRecord.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Medical record deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/medical-records/patient/:patientId/type/:recordType
// @desc    Get medical records by patient and type
// @access  Private
router.get('/patient/:patientId/type/:recordType', auth, async (req, res) => {
  try {
    // Check authorization
    if (req.userId !== req.params.patientId && req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const records = await MedicalRecord.find({
      patientId: req.params.patientId,
      recordType: req.params.recordType
    })
      .populate('doctorId', 'name email')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json({ success: true, records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
