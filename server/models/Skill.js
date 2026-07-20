const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, default: '5 min' },
  type: { type: String, enum: ['video', 'game', 'interactive', 'reading', 'quiz'], default: 'reading' },
  gameType: { type: String, default: null },
  content: { type: String, default: '' },
  resources: [{ type: String }],
  order: { type: Number, default: 0 },
});

const SkillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  categoryRef: {
    type: mongoose.Schema.ObjectId,
    ref: 'SkillDomain',
  },
  icon: {
    type: String,
    default: 'FiStar',
  },
  duration: {
    type: String,
    default: '15 min',
  },
  durationMinutes: {
    type: Number,
    default: 15,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5,
  },
  lessons: {
    type: Number,
    default: 5,
  },
  certificate: {
    type: Boolean,
    default: false,
  },
  tags: [{ type: String, trim: true }],
  steps: [StepSchema],
  videoUrl: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SkillSchema.index({ title: 'text', description: 'text', tags: 'text' });
SkillSchema.index({ category: 1, active: 1 });

module.exports = mongoose.model('Skill', SkillSchema);
