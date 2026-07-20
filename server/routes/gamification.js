const express = require('express');
const {
  getProfile,
  awardXp,
  checkin,
  getLeaderboard,
  getBadges,
} = require('../controllers/gamification');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.post('/award', protect, awardXp);
router.post('/checkin', protect, checkin);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/badges', protect, getBadges);

module.exports = router;
