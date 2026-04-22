
const express = require('express');
const {
  register,
  login,
  getVerifyParentInfo,
  approveTeenByParent,
  getMe,
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-parent/:token', getVerifyParentInfo);
router.post('/verify-parent', approveTeenByParent);
router.get('/me', protect, getMe);

module.exports = router;
