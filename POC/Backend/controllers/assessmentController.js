const Assessment = require('../models/Assessment');
const Patient = require('../models/Patient');

// @desc    Get all assessments
// @route   GET /api/assessments
// @access  Private
exports.getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user.id })
      .populate('patientId', 'name age')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get assessments for a specific patient
// @route   GET /api/assessments/patient/:patientId
// @access  Private
exports.getPatientAssessments = async (req, res) => {
  try {
    // Verify patient belongs to user
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

    const assessments = await Assessment.find({
      patientId: req.params.patientId,
      userId: req.user.id
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single assessment
// @route   GET /api/assessments/:id
// @access  Private
exports.getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('patientId', 'name age diagnosis');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new assessment
// @route   POST /api/assessments
// @access  Private
exports.createAssessment = async (req, res) => {
  try {
    // Verify patient belongs to user
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
    const assessment = await Assessment.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update assessment
// @route   PUT /api/assessments/:id
// @access  Private
exports.updateAssessment = async (req, res) => {
  try {
    let assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      data: assessment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
// @access  Private
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    await assessment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get assessment statistics for a patient
// @route   GET /api/assessments/stats/:patientId
// @access  Private
exports.getAssessmentStats = async (req, res) => {
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

    const assessments = await Assessment.find({
      patientId: req.params.patientId,
      userId: req.user.id
    }).sort({ date: 1 });

    if (assessments.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalAssessments: 0,
          averageScores: null,
          trend: null
        }
      });
    }

    const totalMemory = assessments.reduce((sum, a) => sum + a.memoryScore, 0);
    const totalCognitive = assessments.reduce((sum, a) => sum + a.cognitiveScore, 0);
    const totalBehavior = assessments.reduce((sum, a) => sum + a.behaviorScore, 0);

    const stats = {
      totalAssessments: assessments.length,
      averageScores: {
        memory: Math.round(totalMemory / assessments.length),
        cognitive: Math.round(totalCognitive / assessments.length),
        behavior: Math.round(totalBehavior / assessments.length)
      },
      latestScores: {
        memory: assessments[assessments.length - 1].memoryScore,
        cognitive: assessments[assessments.length - 1].cognitiveScore,
        behavior: assessments[assessments.length - 1].behaviorScore
      },
      trend: assessments.length > 1 ? {
        memory: assessments[assessments.length - 1].memoryScore - assessments[0].memoryScore,
        cognitive: assessments[assessments.length - 1].cognitiveScore - assessments[0].cognitiveScore,
        behavior: assessments[assessments.length - 1].behaviorScore - assessments[0].behaviorScore
      } : null
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
