const SkillCompletion = require('../models/SkillCompletion');

// @desc      Record skill completion for current user (teen)
// @route     POST /api/v1/progress
// @access    Private
exports.recordCompletion = async (req, res) => {
  const { skillId, skillName } = req.body;
  if (!skillId || !skillName) {
    return res.status(400).json({ success: false, message: 'skillId and skillName are required' });
  }
  try {
    const existing = await SkillCompletion.findOne({ userId: req.user.id, skillId });
    if (existing) {
      return res.status(200).json({ success: true, completion: existing });
    }
    const completion = await SkillCompletion.create({
      userId: req.user.id,
      skillId,
      skillName,
    });
    res.status(201).json({ success: true, completion });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
