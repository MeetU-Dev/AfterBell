
const Lesson = require('../models/Lesson');

// @desc      Get all lessons
// @route     GET /api/v1/lessons
// @route     GET /api/v1/skilldomains/:skillDomainId/lessons
// @access    Public
exports.getLessons = async (req, res, next) => {
  let query;

  if (req.params.skillDomainId) {
    query = Lesson.find({ skillDomain: req.params.skillDomainId });
  } else {
    query = Lesson.find();
  }

  try {
    const lessons = await query;

    res.status(200).json({ success: true, count: lessons.length, data: lessons });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc      Create new lesson
// @route     POST /api/v1/skilldomains/:skillDomainId/lessons
// @access    Private
exports.createLesson = async (req, res, next) => {
  req.body.skillDomain = req.params.skillDomainId;

  try {
    const lesson = await Lesson.create(req.body);

    res.status(201).json({
      success: true,
      data: lesson,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
