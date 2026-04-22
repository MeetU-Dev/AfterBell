const crypto = require('crypto');
const User = require('../models/User');
const { sendParentVerificationEmail } = require('../utils/email');

// @desc      Register teen (requires parent email for verification)
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = async (req, res, next) => {
  const { name, email, password, parentEmail, parentPhone, role } = req.body;
  const normalizedEmail = email && String(email).trim().toLowerCase();

  const isParent = role === 'parent';
  const isTeen = !isParent;

  try {
    const userData = {
      name: name && String(name).trim(),
      email: normalizedEmail,
      password,
      role: isParent ? 'parent' : 'teen',
    };

    if (isTeen && parentEmail) {
      userData.parentContact = { email: parentEmail.trim().toLowerCase() };
      if (parentPhone) userData.parentContact.phone = parentPhone.trim();
    }

    const user = await User.create(userData);

    if (isTeen && parentEmail) {
      const token = crypto.randomBytes(32).toString('hex');
      user.parentVerificationToken = token;
      user.parentVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
      await user.save({ validateBeforeSave: false });

      const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const verifyUrl = `${baseUrl}/verify-parent?token=${token}`;
      const emailSent = await sendParentVerificationEmail(parentEmail.trim().toLowerCase(), user.name, verifyUrl);

      if (emailSent) {
        return res.status(201).json({
          success: true,
          token: user.getSignedJwtToken(),
          user: { id: user._id, email: user.email, name: user.name, role: user.role, verifiedByParent: user.verifiedByParent },
          message: 'Account created. Ask your parent to check their email and approve your account.',
        });
      }
      if (process.env.NODE_ENV !== 'production') {
        return res.status(201).json({
          success: true,
          token: user.getSignedJwtToken(),
          user: { id: user._id, email: user.email, name: user.name, role: user.role, verifiedByParent: user.verifiedByParent },
          message: 'Account created. Parent must verify. In dev (no SMTP), use this link:',
          parentVerifyUrl: verifyUrl,
        });
      }
      return res.status(201).json({
        success: true,
        token: user.getSignedJwtToken(),
        user: { id: user._id, email: user.email, name: user.name, role: user.role, verifiedByParent: user.verifiedByParent },
        message: 'Account created. Parent must verify. Verification email could not be sent; please contact support.',
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  const normalizedEmail = email && String(email).trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ success: false, message: 'Please provide an email and password' });
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  sendTokenResponse(user, 200, res);
};

// @desc      Get parent verification info (teen name) for verification page
// @route     GET /api/v1/auth/verify-parent/:token
// @access    Public
exports.getVerifyParentInfo = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    parentVerificationToken: token,
    parentVerificationExpires: { $gt: Date.now() },
    role: 'teen',
  }).select('name email');

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification link',
    });
  }
  return res.status(200).json({
    success: true,
    teenName: user.name,
    teenEmail: user.email,
  });
};

// @desc      Parent approves teen account (optionally create parent account)
// @route     POST /api/v1/auth/verify-parent
// @access    Public
exports.approveTeenByParent = async (req, res) => {
  const { token, parentPassword, parentName } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  const teen = await User.findOne({
    parentVerificationToken: token,
    parentVerificationExpires: { $gt: Date.now() },
    role: 'teen',
  });

  if (!teen) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification link',
    });
  }

  const parentEmail = teen.parentContact?.email;
  if (!parentEmail) {
    return res.status(400).json({ success: false, message: 'No parent email on account' });
  }

  let parent = await User.findOne({ email: parentEmail, role: 'parent' });

  if (parent) {
    if (!parent.linkedTeenIds) parent.linkedTeenIds = [];
    if (!parent.linkedTeenIds.some(id => id.toString() === teen._id.toString())) {
      parent.linkedTeenIds.push(teen._id);
      await parent.save({ validateBeforeSave: false });
    }
  } else if (parentPassword && parentPassword.length >= 6) {
    parent = await User.create({
      name: parentName || parentEmail.split('@')[0],
      email: parentEmail,
      password: parentPassword,
      role: 'parent',
      linkedTeenIds: [teen._id],
    });
  } else {
    return res.status(400).json({
      success: false,
      message: 'Set a password (min 6 characters) to create your parent account and approve',
    });
  }

  teen.verifiedByParent = true;
  teen.linkedParentId = parent._id;
  teen.parentVerificationToken = undefined;
  teen.parentVerificationExpires = undefined;
  await teen.save({ validateBeforeSave: false });

  sendTokenResponse(parent, 200, res);
};

// @desc      Get current user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = async (req, res) => {
  let user = await User.findById(req.user.id);
  if (req.user.role === 'parent' && req.user.linkedTeenIds && req.user.linkedTeenIds.length > 0) {
    user = await User.findById(req.user.id).populate('linkedTeenIds', 'name email createdAt');
  }
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    linkedTeenIds: user.linkedTeenIds,
    ...(user.role === 'teen' && { verifiedByParent: !!user.verifiedByParent }),
  };
  res.status(200).json({ success: true, user: payload });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  const userPayload = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role || 'teen',
    ...(user.role === 'teen' && { verifiedByParent: !!user.verifiedByParent }),
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userPayload,
    });
};
