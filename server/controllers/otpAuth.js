const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendParentVerificationEmail } = require('../utils/email');
const { sendOtpSms } = require('../utils/sms');

const OTP_EXPIRY_MS = 10 * 60 * 1000;

const normalizePhone = (countryCode, phone) => {
  const normalizedCountryCode = String(countryCode || '').trim().replace(/[^\d+]/g, '');
  const normalizedPhone = String(phone || '').trim().replace(/\D/g, '');

  if (!normalizedPhone) {
    return '';
  }

  const combined = `${normalizedCountryCode || ''}${normalizedPhone}`.replace(/\s+/g, '');
  if (!combined) {
    return '';
  }

  return combined.startsWith('+') ? combined : `+${combined.replace(/^\+/, '')}`;
};

const generateOtp = () => String(crypto.randomInt(100000, 1000000));

const buildUserPayload = user => ({
  id: user._id,
  email: user.email || '',
  phone: user.phone || '',
  name: user.name,
  role: user.role || 'teen',
  phoneVerified: !!user.phoneVerified,
  ...(user.role === 'teen' && { verifiedByParent: !!user.verifiedByParent }),
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: buildUserPayload(user),
  });
};

const maybeSendTeenParentVerification = async user => {
  if (user.role !== 'teen' || user.verifiedByParent || !user.parentContact?.email) {
    return null;
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.parentVerificationToken = token;
  user.parentVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/verify-parent?token=${token}`;
  const emailSent = await sendParentVerificationEmail(user.parentContact.email, user.name, verifyUrl);

  return { verifyUrl, emailSent };
};

exports.sendOtp = async (req, res) => {
  try {
    const {
      phone,
      countryCode,
      role = 'teen',
      name,
      email,
      parentEmail,
      parentPhone,
      intent = 'login',
    } = req.body;

    if (role === 'admin') {
      return res.status(400).json({ success: false, message: 'Phone OTP login is not available for admin accounts' });
    }

    const normalizedPhone = normalizePhone(countryCode, phone);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number' });
    }

    if (intent === 'signup' && !name?.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your name' });
    }

    if (intent === 'signup' && role === 'teen' && !parentEmail?.trim()) {
      return res.status(400).json({ success: false, message: 'Parent email is required for teen signup' });
    }

    let user = await User.findOne({ phone: normalizedPhone }).select('+otp +otpExpiry');

    if (!user) {
      user = new User({
        name: name?.trim() || normalizedPhone,
        phone: normalizedPhone,
        email: email?.trim().toLowerCase() || undefined,
        role: role === 'parent' ? 'parent' : 'teen',
        phoneVerified: false,
      });
    } else {
      if (name?.trim()) {
        user.name = name.trim();
      }
      if (email?.trim()) {
        user.email = email.trim().toLowerCase();
      }
      if (role && role !== 'admin') {
        user.role = role;
      }
    }

    if (role === 'teen' && parentEmail?.trim()) {
      user.parentContact = { email: parentEmail.trim().toLowerCase() };
      if (parentPhone?.trim()) {
        user.parentContact.phone = parentPhone.trim();
      }
    }

    const otp = generateOtp();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = Date.now() + OTP_EXPIRY_MS;

    const smsResult = await sendOtpSms(normalizedPhone, otp);
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV !== 'production' && smsResult?.devOtp ? { devOtp: smsResult.devOtp } : {}),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Unable to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, countryCode, otp } = req.body;
    const normalizedPhone = normalizePhone(countryCode, phone);

    if (!normalizedPhone || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide phone number and OTP' });
    }

    const user = await User.findOne({ phone: normalizedPhone }).select('+otp +otpExpiry +password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Phone number not found' });
    }

    if (!user.otp || !user.otpExpiry || user.otpExpiry.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), user.otp);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    user.phoneVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    const parentVerification = await maybeSendTeenParentVerification(user);

    return res.status(200).json({
      success: true,
      token: user.getSignedJwtToken(),
      user: buildUserPayload(user),
      message: parentVerification?.emailSent
        ? 'Phone verified. Ask your parent to check their email and approve your account.'
        : 'Phone verified successfully.',
      ...(parentVerification && !parentVerification.emailSent && process.env.NODE_ENV !== 'production'
        ? { parentVerifyUrl: parentVerification.verifyUrl }
        : {}),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Unable to verify OTP' });
  }
};
