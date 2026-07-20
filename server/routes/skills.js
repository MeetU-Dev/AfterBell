const express = require('express');
const { getSkills, getSkill, suggestSkills, getRelatedSkills, createSkill, updateSkill, deleteSkill, checkVideos } = require('../controllers/skills');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public search/related routes (must come before /:id)
router.get('/search/suggest', suggestSkills);
router.get('/related/:id', getRelatedSkills);

router.post('/check-videos', protect, authorize('admin'), checkVideos);

// Standard CRUD
router.route('/')
  .get(getSkills)
  .post(protect, authorize('admin'), createSkill);

router.route('/:id')
  .get(getSkill)
  .put(protect, authorize('admin'), updateSkill)
  .delete(protect, authorize('admin'), deleteSkill);

module.exports = router;
