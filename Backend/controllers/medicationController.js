const Medication = require('../models/Medication');
const Patient = require('../models/Patient');

// @desc    Get all medications
// @route   GET /api/medications
// @access  Private
exports.getMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user.id, isActive: true })
      .populate('patientId', 'name age')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: medications.length,
      data: medications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get medications for a specific patient
// @route   GET /api/medications/patient/:patientId
// @access  Private
exports.getPatientMedications = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.patientId,
      userId: req.user.id
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const medications = await Medication.find({
      patientId: req.params.patientId,
      userId: req.user.id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: medications.length,
      data: medications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single medication
// @route   GET /api/medications/:id
// @access  Private
exports.getMedication = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('patientId', 'name age');

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    res.status(200).json({
      success: true,
      data: medication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new medication
// @route   POST /api/medications
// @access  Private
exports.createMedication = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.body.patientId,
      userId: req.user.id
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    req.body.userId = req.user.id;
    const medication = await Medication.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Medication created successfully',
      data: medication
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update medication
// @route   PUT /api/medications/:id
// @access  Private
exports.updateMedication = async (req, res) => {
  try {
    let medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    medication = await Medication.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Medication updated successfully',
      data: medication
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete medication (soft delete)
// @route   DELETE /api/medications/:id
// @access  Private
exports.deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    medication.isActive = false;
    await medication.save();

    res.status(200).json({
      success: true,
      message: 'Medication deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update last taken time
// @route   PUT /api/medications/:id/taken
// @access  Private
exports.updateLastTaken = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    medication.lastTaken = req.body.lastTaken || new Date();
    await medication.save();

    res.status(200).json({
      success: true,
      message: 'Medication taken time updated',
      data: medication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
