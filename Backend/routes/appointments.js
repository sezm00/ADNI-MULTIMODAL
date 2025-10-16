const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getPatientAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getUpcomingAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.route('/upcoming')
  .get(getUpcomingAppointments);

router.route('/patient/:patientId')
  .get(getPatientAppointments);

router.route('/:id/status')
  .put(updateAppointmentStatus);

router.route('/:id')
  .get(getAppointment)
  .put(updateAppointment)
  .delete(deleteAppointment);

module.exports = router;
