
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
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
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
  // For teens: set when parent approves (parent's user id)
  linkedParentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // For parents: teens they can see in dashboard
  linkedTeenIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  points: {
    type: Number,
    default: 0,
  },
  badges: [
    {
      name: String,
      date: Date,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
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
