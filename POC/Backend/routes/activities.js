const express = require('express');
const router = express.Router();
const {
  getActivities,
  getPatientActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivitiesByType,
  getActivitiesByDateRange
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getActivities)
  .post(createActivity);

router.route('/patient/:patientId')
  .get(getPatientActivities);

router.route('/type/:type')
  .get(getActivitiesByType);

router.route('/range/:startDate/:endDate')
  .get(getActivitiesByDateRange);

router.route('/:id')
  .get(getActivity)
  .put(updateActivity)
  .delete(deleteActivity);

module.exports = router;
