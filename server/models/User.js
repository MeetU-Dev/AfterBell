
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['teen', 'parent', 'admin'],
    default: 'teen',
  },
  // For teens: parent's contact (we send verification here)
  parentContact: {
    email: { type: String },
    phone: { type: String },
  },
  // For teens: true after parent approves via verification link
  verifiedByParent: {
    type: Boolean,
    default: false,
  },
  parentVerificationToken: String,
  parentVerificationExpires: Date,
  otp: {
    type: String,
    select: false,
  },
  otpExpiry: Date,
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  // For teens: set when parent approves (parent's user id)
  linkedParentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // For parents: teens they can see in dashboard
  linkedTeenIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  points: {
    type: Number,
    default: 0,
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastActiveDate: {
    type: Date,
    default: null,
  },
  badges: [
    {
      name: String,
      description: String,
      icon: String,
      rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
      category: { type: String, enum: ['learning', 'social', 'achievement', 'streak', 'skill'], default: 'learning' },
      unlockedAt: Date,
    },
  ],
  achievements: [
    {
      id: String,
      name: String,
      description: String,
      icon: String,
      unlockedAt: Date,
    },
  ],
  totalSkillsCompleted: { type: Number, default: 0 },
  totalGamesPlayed: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
