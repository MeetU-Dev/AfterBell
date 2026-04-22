
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
