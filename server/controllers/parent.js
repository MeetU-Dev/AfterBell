const User = require('../models/User');
const SkillCompletion = require('../models/SkillCompletion');

// @desc      Get linked teens with their skill completions (parent or admin)
// @route     GET /api/v1/parent/teens
// @access    Private (parent or admin)
exports.getLinkedTeensWithProgress = async (req, res) => {
  const parent = await User.findById(req.user.id).populate('linkedTeenIds', 'name email createdAt');
  const teenIds = (parent.linkedTeenIds || []).map(t => t._id);
  if (teenIds.length === 0) {
    return res.status(200).json({ success: true, teens: [] });
  }
  const completions = await SkillCompletion.find({ userId: { $in: teenIds } })
    .sort({ completedAt: -1 });
  const teens = (parent.linkedTeenIds || []).map(teen => ({
    id: teen._id,
    name: teen.name,
    email: teen.email,
    joinedAt: teen.createdAt,
    completedSkills: completions
      .filter(c => c.userId.toString() === teen._id.toString())
      .map(c => ({ skillId: c.skillId, skillName: c.skillName, completedAt: c.completedAt })),
  }));
  res.status(200).json({ success: true, teens });
};

// @desc      Unlink a teen from parent (parent or admin)
// @route     DELETE /api/v1/parent/teens/:teenId
// @access    Private (parent or admin)
exports.unlinkTeen = async (req, res) => {
  const { teenId } = req.params;
  const parent = await User.findById(req.user.id);
  const teenIds = (parent.linkedTeenIds || []).map(id => id.toString());
  if (!teenIds.includes(teenId)) {
    return res.status(404).json({ success: false, message: 'Teen not linked to your account' });
  }
  parent.linkedTeenIds = parent.linkedTeenIds.filter(id => id.toString() !== teenId);
  await parent.save({ validateBeforeSave: false });

  const teen = await User.findById(teenId);
  if (teen) {
    teen.linkedParentId = undefined;
    teen.verifiedByParent = false;
    await teen.save({ validateBeforeSave: false });
  }

  res.status(200).json({ success: true, message: 'Teen unlinked' });
};
