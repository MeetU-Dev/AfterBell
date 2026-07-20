
const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  video: String,
  videoType: {
    type: String,
    enum: ['youtube', 'vimeo', 'direct', 'none'],
    default: 'none',
  },
  videoThumbnail: String,
  videoDuration: Number,
  source: {
    type: String,
    trim: true,
  },
  partner: {
    type: mongoose.Schema.ObjectId,
    ref: 'Partner',
  },
  quiz: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
    },
  ],
  skillDomain: {
    type: mongoose.Schema.ObjectId,
    ref: 'SkillDomain',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Lesson', LessonSchema);
