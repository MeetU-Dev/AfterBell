const User = require('../models/User');
const SkillCompletion = require('../models/SkillCompletion');
const ParentPreference = require('../models/ParentPreference');

const BADGE_DEFINITIONS = [
  { id: 'first-steps', name: 'First Steps', description: 'Complete your first skill', icon: '🎯', category: 'achievement', rarity: 'common' },
  { id: 'skill-master', name: 'Skill Master', description: 'Complete 5 skills', icon: '🏆', category: 'achievement', rarity: 'rare' },
  { id: 'dedicated-learner', name: 'Dedicated Learner', description: 'Complete 10 skills', icon: '👑', category: 'achievement', rarity: 'epic' },
  { id: 'streak-3', name: 'Rising Star', description: '3-day learning streak', icon: '⭐', category: 'streak', rarity: 'common' },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', category: 'streak', rarity: 'rare' },
  { id: 'streak-30', name: 'Monthly Champion', description: '30-day learning streak', icon: '💎', category: 'streak', rarity: 'legendary' },
  { id: 'gamer', name: 'Game On', description: 'Play 5 mini-games', icon: '🎮', category: 'skill', rarity: 'common' },
  { id: 'pro-gamer', name: 'Pro Gamer', description: 'Play 20 mini-games', icon: '🕹️', category: 'skill', rarity: 'epic' },
  { id: 'point-collector', name: 'Point Collector', description: 'Earn 500 XP', icon: '💰', category: 'achievement', rarity: 'rare' },
  { id: 'xp-legend', name: 'XP Legend', description: 'Earn 2000 XP', icon: '🚀', category: 'achievement', rarity: 'legendary' },
  { id: 'bookworm', name: 'Bookworm', description: 'Bookmark 5 skills', icon: '📚', category: 'learning', rarity: 'common' },
  { id: 'social-learner', name: 'Social Learner', description: 'Share 3 skills', icon: '🤝', category: 'social', rarity: 'common' },
];

function resolveEquippedBadge(equippedBadgeId) {
  if (!equippedBadgeId) return null;
  const def = BADGE_DEFINITIONS.find(b => b.id === equippedBadgeId);
  if (!def) return null;
  return { id: def.id, name: def.name, icon: def.icon, rarity: def.rarity };
}

exports.getLinkedTeensWithProgress = async (req, res) => {
  try {
    const parent = await User.findById(req.user.id).populate('linkedTeenIds', 'name email createdAt xp level currentStreak longestStreak badges totalSkillsCompleted totalGamesPlayed equippedBadgeId');
    const teenIds = (parent.linkedTeenIds || []).map(t => t._id);
    if (teenIds.length === 0) {
      return res.status(200).json({ success: true, teens: [] });
    }
    const completions = await SkillCompletion.find({ userId: { $in: teenIds } })
      .sort({ completedAt: -1 })
      .lean();

    const teens = (parent.linkedTeenIds || []).map(teen => ({
      id: teen._id,
      name: teen.name,
      email: teen.email,
      joinedAt: teen.createdAt,
      xp: teen.xp || 0,
      level: teen.level || 1,
      currentStreak: teen.currentStreak || 0,
      longestStreak: teen.longestStreak || 0,
      badges: teen.badges || [],
      equippedBadge: resolveEquippedBadge(teen.equippedBadgeId),
      totalSkillsCompleted: teen.totalSkillsCompleted || 0,
      totalGamesPlayed: teen.totalGamesPlayed || 0,
      completedSkills: completions
        .filter(c => c.userId.toString() === teen._id.toString())
        .map(c => ({ skillId: c.skillId, skillName: c.skillName, completedAt: c.completedAt })),
    }));

    res.status(200).json({ success: true, teens });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.unlinkTeen = async (req, res) => {
  try {
    const { teenId } = req.params;
    const parent = await User.findById(req.user.id);
    if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });

    const teenIds = (parent.linkedTeenIds || []).map(id => id.toString());
    if (!teenIds.includes(teenId)) return res.status(404).json({ success: false, message: 'Teen not linked' });

    parent.linkedTeenIds = parent.linkedTeenIds.filter(id => id.toString() !== teenId);
    await parent.save({ validateBeforeSave: false });

    const teen = await User.findById(teenId);
    if (teen) {
      teen.linkedParentId = undefined;
      teen.verifiedByParent = false;
      await teen.save({ validateBeforeSave: false });
    }

    res.status(200).json({ success: true, message: 'Teen unlinked' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    let prefs = await ParentPreference.findOne({ parentId: req.user.id });
    if (!prefs) {
      prefs = await ParentPreference.create({ parentId: req.user.id });
    }
    res.json({ success: true, data: prefs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { restrictedCategories, notifications } = req.body;
    let prefs = await ParentPreference.findOne({ parentId: req.user.id });
    if (!prefs) {
      prefs = new ParentPreference({ parentId: req.user.id });
    }
    if (restrictedCategories !== undefined) prefs.restrictedCategories = restrictedCategories;
    if (notifications !== undefined) prefs.notifications = { ...prefs.notifications, ...notifications };
    await prefs.save();
    res.json({ success: true, data: prefs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRestrictedCategories = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('linkedParentId');
    if (!user.linkedParentId) {
      return res.json({ success: true, restrictedCategories: [] });
    }
    const prefs = await ParentPreference.findOne({ parentId: user.linkedParentId._id });
    res.json({ success: true, restrictedCategories: prefs?.restrictedCategories || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTeenDetail = async (req, res) => {
  try {
    const { teenId } = req.params;
    const parent = await User.findById(req.user.id);
    const isLinked = (parent.linkedTeenIds || []).some(id => id.toString() === teenId);
    if (!isLinked && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const teen = await User.findById(teenId).select('name email createdAt xp level currentStreak longestStreak badges achievements totalSkillsCompleted totalGamesPlayed lastActiveDate equippedBadgeId');
    if (!teen) return res.status(404).json({ success: false, message: 'Teen not found' });

    const completions = await SkillCompletion.find({ userId: teenId }).sort({ completedAt: -1 }).lean();
    const completedByMonth = {};
    completions.forEach(c => {
      const key = new Date(c.completedAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      completedByMonth[key] = (completedByMonth[key] || 0) + 1;
    });

    const weeklyActivity = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = days[d.getDay()];
      const count = completions.filter(c => {
        const cd = new Date(c.completedAt);
        return cd.toDateString() === d.toDateString();
      }).length;
      weeklyActivity.push({ day: dayStr, count });
    }

    res.json({
      success: true,
      data: {
        id: teen._id,
        name: teen.name,
        email: teen.email,
        joinedAt: teen.createdAt,
        xp: teen.xp || 0,
        level: teen.level || 1,
        currentStreak: teen.currentStreak || 0,
        longestStreak: teen.longestStreak || 0,
        badges: teen.badges || [],
        equippedBadge: resolveEquippedBadge(teen.equippedBadgeId),
        totalSkillsCompleted: teen.totalSkillsCompleted || 0,
        totalGamesPlayed: teen.totalGamesPlayed || 0,
        lastActiveDate: teen.lastActiveDate,
        completedSkills: completions.map(c => ({
          skillId: c.skillId,
          skillName: c.skillName,
          completedAt: c.completedAt,
        })),
        completedByMonth,
        weeklyActivity,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
