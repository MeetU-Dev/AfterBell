
const express = require('express');
const {
  getLessons,
  createLesson,
} = require('../controllers/lessons');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getLessons)
  .post(createLesson);

module.exports = router;
