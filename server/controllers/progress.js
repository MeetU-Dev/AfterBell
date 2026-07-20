const SkillCompletion = require('../models/SkillCompletion');
const Bookmark = require('../models/Bookmark');
const Activity = require('../models/Activity');
const { createNotification } = require('../utils/notificationService');

// -- Completions --

exports.recordCompletion = async (req, res) => {
  try {
    const { skillId, skillName, completedSteps, totalSteps, timeSpent, score } = req.body;
    if (!skillId || !skillName) {
      return res.status(400).json({ success: false, message: 'skillId and skillName are required' });
    }
    const existing = await SkillCompletion.findOne({ userId: req.user.id, skillId });
    if (existing) {
      existing.completedSteps = completedSteps || existing.completedSteps;
      existing.totalSteps = totalSteps || existing.totalSteps;
      existing.timeSpent = (existing.timeSpent || 0) + (timeSpent || 0);
      if (score !== undefined) existing.score = score;
      await existing.save();
      return res.status(200).json({ success: true, completion: existing });
    }
    const completion = await SkillCompletion.create({
      userId: req.user.id,
      skillId,
      skillName,
      completedSteps: completedSteps || [],
      totalSteps: totalSteps || 0,
      timeSpent: timeSpent || 0,
      score: score || null,
    });

    createNotification({ userId: req.user.id, type: 'skill_completed', data: { skillName, skillId, xpAwarded: 50 } });

    res.status(201).json({ success: true, completion });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMyCompletions = async (req, res) => {
  try {
    const completions = await SkillCompletion.find({ userId: req.user.id }).sort({ completedAt: -1 });
    res.status(200).json({ success: true, count: completions.length, completions });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.removeCompletion = async (req, res) => {
  try {
    const result = await SkillCompletion.findOneAndDelete({ userId: req.user.id, skillId: req.params.skillId });
    if (!result) return res.status(404).json({ success: false, message: 'Completion not found' });
    res.status(200).json({ success: true, message: 'Completion removed' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// -- Bookmarks --

exports.addBookmark = async (req, res) => {
  try {
    const { skillId } = req.body;
    if (!skillId) return res.status(400).json({ success: false, message: 'skillId is required' });
    const existing = await Bookmark.findOne({ userId: req.user.id, skillId });
    if (existing) return res.status(200).json({ success: true, bookmark: existing });
    const bookmark = await Bookmark.create({ userId: req.user.id, skillId });
    res.status(201).json({ success: true, bookmark });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const result = await Bookmark.findOneAndDelete({ userId: req.user.id, skillId: req.params.skillId });
    if (!result) return res.status(404).json({ success: false, message: 'Bookmark not found' });
    res.status(200).json({ success: true, message: 'Bookmark removed' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user.id }).sort({ bookmarkedAt: -1 });
    res.status(200).json({ success: true, count: bookmarks.length, bookmarks });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// -- Activities --

exports.addActivity = async (req, res) => {
  try {
    const { action, skill, skillId } = req.body;
    if (!action) return res.status(400).json({ success: false, message: 'action is required' });
    const activity = await Activity.create({ userId: req.user.id, action, skill: skill || '', skillId: skillId || '' });
    res.status(201).json({ success: true, activity });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMyActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activities = await Activity.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(limit);
    res.status(200).json({ success: true, count: activities.length, activities });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// -- Sync --

exports.syncAll = async (req, res) => {
  try {
    const [completions, bookmarks, activities] = await Promise.all([
      SkillCompletion.find({ userId: req.user.id }).sort({ completedAt: -1 }).lean(),
      Bookmark.find({ userId: req.user.id }).sort({ bookmarkedAt: -1 }).lean(),
      Activity.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100).lean(),
    ]);
    res.status(200).json({ success: true, completions, bookmarks, activities });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
