const User = require('../models/User');
const { createNotification } = require('../utils/notificationService');

const XP_RULES = {
  complete_skill: 50,
  complete_step: 10,
  play_game: 15,
  win_game: 25,
  daily_checkin: 5,
  streak_bonus: 10,
  share_skill: 10,
  bookmark_skill: 5,
  post_comment: 8,
  rate_skill: 5,
  complete_quiz: 20,
};

const BADGE_DEFINITIONS = [
  { id: 'first-steps', name: 'First Steps', description: 'Complete your first skill', icon: '🎯', category: 'achievement', rarity: 'common', requirement: { type: 'skills_completed', value: 1 } },
  { id: 'skill-master', name: 'Skill Master', description: 'Complete 5 skills', icon: '🏆', category: 'achievement', rarity: 'rare', requirement: { type: 'skills_completed', value: 5 } },
  { id: 'dedicated-learner', name: 'Dedicated Learner', description: 'Complete 10 skills', icon: '👑', category: 'achievement', rarity: 'epic', requirement: { type: 'skills_completed', value: 10 } },
  { id: 'streak-3', name: 'Rising Star', description: '3-day learning streak', icon: '⭐', category: 'streak', rarity: 'common', requirement: { type: 'streak', value: 3 } },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', category: 'streak', rarity: 'rare', requirement: { type: 'streak', value: 7 } },
  { id: 'streak-30', name: 'Monthly Champion', description: '30-day learning streak', icon: '💎', category: 'streak', rarity: 'legendary', requirement: { type: 'streak', value: 30 } },
  { id: 'gamer', name: 'Game On', description: 'Play 5 mini-games', icon: '🎮', category: 'skill', rarity: 'common', requirement: { type: 'games_played', value: 5 } },
  { id: 'pro-gamer', name: 'Pro Gamer', description: 'Play 20 mini-games', icon: '🕹️', category: 'skill', rarity: 'epic', requirement: { type: 'games_played', value: 20 } },
  { id: 'point-collector', name: 'Point Collector', description: 'Earn 500 XP', icon: '💰', category: 'achievement', rarity: 'rare', requirement: { type: 'xp_earned', value: 500 } },
  { id: 'xp-legend', name: 'XP Legend', description: 'Earn 2000 XP', icon: '🚀', category: 'achievement', rarity: 'legendary', requirement: { type: 'xp_earned', value: 2000 } },
  { id: 'bookworm', name: 'Bookworm', description: 'Bookmark 5 skills', icon: '📚', category: 'learning', rarity: 'common', requirement: { type: 'bookmarks', value: 5 } },
  { id: 'social-learner', name: 'Social Learner', description: 'Share 3 skills', icon: '🤝', category: 'social', rarity: 'common', requirement: { type: 'shares', value: 3 } },
];

function calcLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

function xpForNextLevel(level) {
  return level * 100;
}

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('xp level currentStreak longestStreak lastActiveDate badges achievements points totalSkillsCompleted totalGamesPlayed');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const nextLevelXp = xpForNextLevel(user.level);
    const currentLevelXp = (user.level - 1) * 100;
    const levelProgress = nextLevelXp - currentLevelXp > 0
      ? Math.min(100, Math.round(((user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100))
      : 0;

    res.json({
      success: true,
      data: {
        xp: user.xp,
        level: user.level,
        levelProgress,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        lastActiveDate: user.lastActiveDate,
        points: user.points,
        badges: user.badges || [],
        achievements: user.achievements || [],
        totalSkillsCompleted: user.totalSkillsCompleted,
        totalGamesPlayed: user.totalGamesPlayed,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.awardXp = async (req, res) => {
  try {
    const { action } = req.body;
    if (!action || !XP_RULES[action]) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const points = XP_RULES[action];
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.xp += points;
    user.points += points;
    const newLevel = calcLevel(user.xp);
    const leveledUp = newLevel > user.level;
    user.level = newLevel;

    const unlockedBadges = [];

    const checkBadge = (badgeDef) => {
      if (user.badges.some(b => b.name === badgeDef.id)) return false;
      let earned = false;
      switch (badgeDef.requirement.type) {
        case 'skills_completed':
          earned = (user.totalSkillsCompleted || 0) >= badgeDef.requirement.value;
          break;
        case 'streak':
          earned = (user.currentStreak || 0) >= badgeDef.requirement.value;
          break;
        case 'games_played':
          earned = (user.totalGamesPlayed || 0) >= badgeDef.requirement.value;
          break;
        case 'xp_earned':
          earned = user.xp >= badgeDef.requirement.value;
          break;
        case 'bookmarks':
        case 'shares':
          earned = false;
          break;
      }
      return earned;
    };

    for (const badgeDef of BADGE_DEFINITIONS) {
      if (checkBadge(badgeDef)) {
        user.badges.push({
          name: badgeDef.id,
          description: badgeDef.description,
          icon: badgeDef.icon,
          rarity: badgeDef.rarity,
          category: badgeDef.category,
          unlockedAt: new Date(),
        });
        unlockedBadges.push(badgeDef);
      }
    }

    await user.save();

    // Trigger notifications
    if (leveledUp) {
      createNotification({ userId: user._id, type: 'level_up', data: { level: user.level } });
    }
    for (const badge of unlockedBadges) {
      createNotification({ userId: user._id, type: 'badge_unlocked', data: { badgeName: badge.name } });
    }

    res.json({
      success: true,
      data: {
        xpAwarded: points,
        totalXp: user.xp,
        level: user.level,
        leveledUp,
        unlockedBadges,
        currentStreak: user.currentStreak,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.checkin = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastActiveDate) {
      const last = new Date(user.lastActiveDate);
      last.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return res.json({ success: true, data: { message: 'Already checked in today', currentStreak: user.currentStreak, xpAwarded: 0 } });
      } else if (diffDays === 1) {
        user.currentStreak += 1;
      } else {
        user.currentStreak = 1;
      }
    } else {
      user.currentStreak = 1;
    }

    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    user.lastActiveDate = today;

    let xpAwarded = XP_RULES.daily_checkin;
    if (user.currentStreak > 0 && user.currentStreak % 7 === 0) {
      xpAwarded += XP_RULES.streak_bonus * Math.floor(user.currentStreak / 7);
    }
    user.xp += xpAwarded;
    user.points += xpAwarded;
    user.level = calcLevel(user.xp);

    const unlockedBadges = [];
    for (const badgeDef of BADGE_DEFINITIONS) {
      if (badgeDef.requirement.type === 'streak' && !user.badges.some(b => b.name === badgeDef.id) && user.currentStreak >= badgeDef.requirement.value) {
        user.badges.push({
          name: badgeDef.id,
          description: badgeDef.description,
          icon: badgeDef.icon,
          rarity: badgeDef.rarity,
          category: badgeDef.category,
          unlockedAt: new Date(),
        });
        unlockedBadges.push(badgeDef);
      }
    }

    await user.save();

    // Trigger notifications
    if ([3, 7, 30].includes(user.currentStreak)) {
      createNotification({ userId: user._id, type: 'streak_milestone', data: { streak: user.currentStreak } });
    }
    for (const badge of unlockedBadges) {
      createNotification({ userId: user._id, type: 'badge_unlocked', data: { badgeName: badge.name } });
    }

    res.json({
      success: true,
      data: {
        xpAwarded,
        totalXp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        unlockedBadges,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const users = await User.find({ role: 'teen' })
      .sort({ xp: -1 })
      .limit(limit)
      .select('name xp level currentStreak badges');

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      userId: u._id,
      name: u.name,
      xp: u.xp,
      level: u.level,
      streak: u.currentStreak,
      badges: (u.badges || []).length,
    }));

    res.json({ success: true, data: leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('badges xp level currentStreak totalSkillsCompleted totalGamesPlayed');
    const unlocked = (user.badges || []).map(b => b.name);

    const badges = BADGE_DEFINITIONS.map(b => ({
      ...b,
      unlocked: unlocked.includes(b.id),
      unlockedAt: (user.badges || []).find(ub => ub.name === b.id)?.unlockedAt || null,
      progress: (() => {
        switch (b.requirement.type) {
          case 'skills_completed': return Math.min(100, Math.round(((user.totalSkillsCompleted || 0) / b.requirement.value) * 100));
          case 'streak': return Math.min(100, Math.round(((user.currentStreak || 0) / b.requirement.value) * 100));
          case 'games_played': return Math.min(100, Math.round(((user.totalGamesPlayed || 0) / b.requirement.value) * 100));
          case 'xp_earned': return Math.min(100, Math.round((user.xp / b.requirement.value) * 100));
          default: return 0;
        }
      })(),
    }));

    res.json({ success: true, data: badges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
