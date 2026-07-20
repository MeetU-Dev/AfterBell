const mongoose = require('mongoose');

const SkillCompletionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skillId: {
    type: String,
    required: true,
  },
  skillName: {
    type: String,
    required: true,
  },
  completedSteps: {
    type: [Number],
    default: [],
  },
  totalSteps: {
    type: Number,
    default: 0,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: null,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

SkillCompletionSchema.index({ userId: 1, skillId: 1 }, { unique: true });

module.exports = mongoose.model('SkillCompletion', SkillCompletionSchema);
