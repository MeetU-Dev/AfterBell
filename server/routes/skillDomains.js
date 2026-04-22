
const express = require('express');
const {
  getSkillDomains,
  createSkillDomain,
} = require('../controllers/skillDomains');

const router = express.Router();

router
  .route('/')
  .get(getSkillDomains)
  .post(createSkillDomain);

module.exports = router;
