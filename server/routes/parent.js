const express = require('express');
const { getLinkedTeensWithProgress, unlinkTeen } = require('../controllers/parent');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/teens', protect, authorize('parent', 'admin'), getLinkedTeensWithProgress);
router.delete('/teens/:teenId', protect, authorize('parent', 'admin'), unlinkTeen);

module.exports = router;
