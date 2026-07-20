
const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  getVerifyParentInfo,
  approveTeenByParent,
  getMe,
  getUsers,
} = require('../controllers/auth');
const { sendOtp, verifyOtp } = require('../controllers/otpAuth');
const { protect, authorize } = require('../middleware/auth');

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
  keyGenerator: req => normalizePhone(req.body.countryCode, req.body.phone) || rateLimit.ipKeyGenerator(req),
  message: { success: false, message: 'Too many OTP requests. Please wait 10 minutes and try again.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
});

const verifyOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => normalizePhone(req.body.countryCode, req.body.phone) || rateLimit.ipKeyGenerator(req),
  message: { success: false, message: 'Too many OTP verification attempts. Please wait 10 minutes.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/send-otp', sendOtpLimiter, sendOtp);
router.post('/verify-otp', verifyOtpLimiter, verifyOtp);
router.get('/verify-parent/:token', getVerifyParentInfo);
router.post('/verify-parent', authLimiter, approveTeenByParent);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);

module.exports = router;
