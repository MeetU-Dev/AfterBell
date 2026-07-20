const express = require('express');
const { getLinkedTeensWithProgress, unlinkTeen, getPreferences, updatePreferences, getRestrictedCategories, getTeenDetail } = require('../controllers/parent');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/teens', protect, authorize('parent', 'admin'), getLinkedTeensWithProgress);
router.get('/teens/:teenId', protect, authorize('parent', 'admin'), getTeenDetail);
router.delete('/teens/:teenId', protect, authorize('parent', 'admin'), unlinkTeen);
router.get('/preferences', protect, authorize('parent', 'admin'), getPreferences);
router.put('/preferences', protect, authorize('parent', 'admin'), updatePreferences);
router.get('/restrictions', protect, getRestrictedCategories);

module.exports = router;
