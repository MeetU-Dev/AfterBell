
const express = require('express');
const {
  getSkillDomains,
  createSkillDomain,
  updateSkillDomain,
  deleteSkillDomain,
} = require('../controllers/skillDomains');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getSkillDomains)
  .post(protect, authorize('admin'), createSkillDomain);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateSkillDomain)
  .delete(protect, authorize('admin'), deleteSkillDomain);

module.exports = router;
