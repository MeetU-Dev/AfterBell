const express = require('express');
const { getDashboard, getAdmin } = require('../controllers/analytics');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/admin', authorize('admin'), getAdmin);

module.exports = router;
