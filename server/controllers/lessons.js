
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
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc      Create new lesson
// @route     POST /api/v1/skilldomains/:skillDomainId/lessons
// @access    Private/Admin
exports.createLesson = async (req, res, next) => {
  try {
    const skillDomainId = req.params.skillDomainId;
    const SkillDomain = require('../models/SkillDomain');
    const domain = await SkillDomain.findById(skillDomainId);
    if (!domain) {
      return res.status(404).json({ success: false, message: 'Skill domain not found' });
    }

    const { title, description, video, videoType, videoThumbnail, videoDuration, source, partner, quiz } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Please provide title and description' });
    }

    const lesson = await Lesson.create({
      title,
      description,
      video,
      videoType: videoType || 'none',
      videoThumbnail,
      videoDuration,
      source,
      partner,
      quiz,
      skillDomain: skillDomainId,
    });

    res.status(201).json({
      success: true,
      data: lesson,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc      Update lesson
// @route     PUT /api/v1/lessons/:id
// @access    Private/Admin
exports.updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.status(200).json({ success: true, data: lesson });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc      Delete lesson
// @route     DELETE /api/v1/lessons/:id
// @access    Private/Admin
exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.status(200).json({ success: true, message: 'Lesson deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
