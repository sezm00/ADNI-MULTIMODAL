const express = require('express');
const router = express.Router();
const {
  getMedications,
  getPatientMedications,
  getMedication,
  createMedication,
  updateMedication,
  deleteMedication,
  updateLastTaken
} = require('../controllers/medicationController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getMedications)
  .post(createMedication);

router.route('/patient/:patientId')
  .get(getPatientMedications);

router.route('/:id/taken')
  .put(updateLastTaken);

router.route('/:id')
  .get(getMedication)
  .put(updateMedication)
  .delete(deleteMedication);

module.exports = router;
