
const express = require('express');
const {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} = require('../controllers/lessons');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getLessons)
  .post(protect, authorize('admin'), createLesson);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateLesson)
  .delete(protect, authorize('admin'), deleteLesson);

module.exports = router;
