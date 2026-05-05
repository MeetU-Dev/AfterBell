
const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  getVerifyParentInfo,
  approveTeenByParent,
  getMe,
} = require('../controllers/auth');
const { sendOtp, verifyOtp } = require('../controllers/otpAuth');
const { protect } = require('../middleware/auth');

const router = express.Router();

const normalizePhone = (countryCode, phone) => {
  const normalizedCountryCode = String(countryCode || '').trim().replace(/[^\d+]/g, '');
  const normalizedPhone = String(phone || '').trim().replace(/\D/g, '');

  if (!normalizedPhone) {
    return '';
  }

  const combined = `${normalizedCountryCode || ''}${normalizedPhone}`.replace(/\s+/g, '');
  return combined.startsWith('+') ? combined : `+${combined.replace(/^\+/, '')}`;
};

const sendOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => normalizePhone(req.body.countryCode, req.body.phone) || req.ip,
  message: { success: false, message: 'Too many OTP requests. Please wait 10 minutes and try again.' },
});

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtpLimiter, sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/verify-parent/:token', getVerifyParentInfo);
router.post('/verify-parent', approveTeenByParent);
router.get('/me', protect, getMe);

module.exports = router;
