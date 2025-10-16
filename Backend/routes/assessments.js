const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getPatientAssessments,
  getAssessment,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentStats
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getAssessments)
  .post(createAssessment);

router.route('/patient/:patientId')
  .get(getPatientAssessments);

router.route('/stats/:patientId')
  .get(getAssessmentStats);

router.route('/:id')
  .get(getAssessment)
  .put(updateAssessment)
  .delete(deleteAssessment);

module.exports = router;
