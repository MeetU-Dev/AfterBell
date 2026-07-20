const mongoose = require('mongoose');

const ParentPreferenceSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  restrictedCategories: [{
    type: String,
    trim: true,
  }],
  notifications: {
    skillCompleted: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
    monthlyReport: { type: Boolean, default: false },
    streakMilestone: { type: Boolean, default: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ParentPreference', ParentPreferenceSchema);
