const mongoose = require('mongoose');
const User = require('../models/User');
const Activity = require('../models/Activity');
const SkillCompletion = require('../models/SkillCompletion');
const Bookmark = require('../models/Bookmark');
const SkillDomain = require('../models/SkillDomain');

// Helper: day name from date
const dayName = (d) =>
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];

// Helper: date string YYYY-MM-DD
const dateStr = (d) => d.toISOString().split('T')[0];

// Helper: calculate learning streak from activities
function calcStreak(activities) {
  if (!activities.length) return 0;
  const days = [...new Set(activities.map((a) => dateStr(new Date(a.createdAt || a.timestamp))))].sort().reverse();
  let streak = 0;
  const today = dateStr(new Date());
  for (let i = 0; i < days.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (days[i] === dateStr(expected)) streak++;
    else break;
  }
  return streak;
}

// Helper: compute level from XP
const calcLevel = (xp) => Math.floor(xp / 100) + 1;
const xpForNextLevel = (level) => level * 100;

// @desc      Get dashboard analytics for current user
// @route     GET /api/v1/analytics/dashboard
// @access    Private
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const timeframe = req.query.timeframe || 'month';
    const skillDomainMap = {};

    // Build category slug map
    const domains = await SkillDomain.find().lean();
    for (const d of domains) {
      skillDomainMap[d._id.toString()] = d.slug || d.name.toLowerCase().replace(/\s+/g, '-');
    }

    // Date filter
    const now = new Date();
    let filterDate = new Date(0);
    if (timeframe === 'week') filterDate.setDate(now.getDate() - 7);
    else if (timeframe === 'month') filterDate.setMonth(now.getMonth() - 1);
    else if (timeframe === 'year') filterDate.setFullYear(now.getFullYear() - 1);

    const filter = { userId, createdAt: { $gte: filterDate } };

    // Fetch raw data
    const [rawActivities, completions, bookmarks, user] = await Promise.all([
      Activity.find(filter).sort({ createdAt: -1 }).lean(),
      SkillCompletion.find(filter).sort({ completedAt: -1 }).lean(),
      Bookmark.find({ userId }).lean(),
      User.findById(userId).select('xp level currentStreak longestStreak lastActiveDate badges achievements points totalSkillsCompleted totalGamesPlayed').lean(),
    ]);

    const nowDate = dateStr(now);

    // -- Learning metrics --
    const learningStreak = calcStreak(rawActivities);
    const totalSessions = rawActivities.length;
    const totalLearningTime = totalSessions * 30; // assume 30 min per activity
    const avgSessionTime = totalSessions > 0 ? totalLearningTime / totalSessions : 0;

    // Most active day of week
    const dayCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    for (const a of rawActivities) {
      const dn = dayName(new Date(a.createdAt));
      if (dayCounts[dn] !== undefined) dayCounts[dn]++;
    }
    const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mon';

    // -- Streak data (7-day normalized) --
    const days7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const rawDayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    for (const a of rawActivities) {
      const dn = dayName(new Date(a.createdAt));
      if (rawDayCounts[dn] !== undefined) rawDayCounts[dn]++;
    }
    const maxCount = Math.max(...Object.values(rawDayCounts), 1);
    const streakData = days7.map((day) => ({
      day,
      value: rawDayCounts[day] === 0 ? 0 : Math.max(0.1, rawDayCounts[day] / maxCount),
    }));

    // -- Skill categories progress --
    const categoryMap = {};
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500'];

    // Count completions by category (via skill domain slug)
    const allCompletions = await SkillCompletion.find({ userId }).lean();
    const totalByCategory = {}; // Would be populated from skills data

    // Use the seed skill category totals
    const skillTotals = {
      communication: 5,
      cooking: 4,
      finance: 6,
      art: 3,
      digital: 4,
      writing: 5,
      'time-management': 4,
      coding: 6,
      'mental-health': 4,
      relationships: 5,
      'life-skills': 6,
    };

    for (const c of allCompletions) {
      const cat = c.category || 'general';
      if (!categoryMap[cat]) categoryMap[cat] = 0;
      categoryMap[cat]++;
    }

    const skillCategories = Object.entries(skillTotals).map(([slug, total], i) => ({
      name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
      completed: categoryMap[slug] || 0,
      total,
      color: colors[i % colors.length],
    }));

    // -- Activity timeline (daily counts) --
    const activityMap = {};
    for (const a of rawActivities) {
      const d = dateStr(new Date(a.createdAt));
      activityMap[d] = (activityMap[d] || 0) + 1;
    }
    const activityTimeline = Object.entries(activityMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // -- Completions over time --
    const completionTimeline = {};
    for (const c of completions) {
      const d = dateStr(new Date(c.completedAt));
      completionTimeline[d] = (completionTimeline[d] || 0) + 1;
    }

    // -- Recent activities (last 10) --
    const recentActivities = rawActivities.slice(0, 10).map((a) => ({
      id: a._id.toString(),
      action: a.action,
      skill: a.skill,
      skillId: a.skillId,
      time: timeAgo(new Date(a.createdAt)),
      timestamp: new Date(a.createdAt).getTime(),
    }));

    // -- Productivity insights --
    const insights = [];
    if (learningStreak > 7) {
      insights.push({ type: 'success', message: `Amazing! You've maintained a ${learningStreak}-day learning streak!` });
    }
    if (totalLearningTime > 300) {
      insights.push({ type: 'info', message: `You've spent ${Math.round(totalLearningTime / 60)} hours learning this ${timeframe}!` });
    }
    if (completions.length > 0) {
      insights.push({ type: 'achievement', message: `You've completed ${completions.length} skills this ${timeframe}!` });
    }
    insights.push({ type: 'tip', message: `Your most productive day is ${mostActiveDay}. Keep it up!` });

    // -- Level progress --
    const nextLevelXp = xpForNextLevel(user.level);
    const currentLevelXp = (user.level - 1) * 100;
    const levelProgress = {
      current: user.xp - currentLevelXp,
      next: nextLevelXp - currentLevelXp,
      percentage: nextLevelXp - currentLevelXp > 0
        ? Math.min(100, Math.round(((user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100))
        : 100,
    };

    res.json({
      success: true,
      data: {
        learningMetrics: {
          learningStreak,
          totalSessions,
          totalLearningTime,
          averageSessionTime: Math.round(avgSessionTime * 10) / 10,
          mostActiveDay,
        },
        streakData,
        skillCategories,
        activityTimeline,
        completionTimeline: Object.entries(completionTimeline)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        recentActivities,
        productivityInsights: insights,
        levelProgress,
        userStats: {
          xp: user.xp,
          level: user.level,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          totalPoints: user.points,
          totalSkillsCompleted: user.totalSkillsCompleted,
          totalGamesPlayed: user.totalGamesPlayed,
        },
        stats: {
          completedSkills: allCompletions.length,
          bookmarked: bookmarks.length,
          totalHours: Math.round(totalLearningTime / 60),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc      Get admin-level platform analytics
// @route     GET /api/v1/analytics/admin
// @access    Private/Admin
exports.getAdmin = async (req, res) => {
  try {
    const now = new Date();

    // Total users by role
    const [totalTeens, totalParents, totalAdmins] = await Promise.all([
      User.countDocuments({ role: 'teen' }),
      User.countDocuments({ role: 'parent' }),
      User.countDocuments({ role: 'admin' }),
    ]);

    // New users
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [newUsersToday, newUsersThisWeek, newUsersThisMonth] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      User.countDocuments({ createdAt: { $gte: monthAgo } }),
    ]);

    // Platform activity
    const [totalCompletions, totalActivities, totalBookmarks] = await Promise.all([
      SkillCompletion.countDocuments(),
      Activity.countDocuments(),
      Bookmark.countDocuments(),
    ]);

    // Active users (have an activity in last 7 days)
    const activeUserIds = await Activity.distinct('userId', { createdAt: { $gte: weekAgo } });
    const activeUsers = activeUserIds.length;

    // Completions over time (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentCompletions = await SkillCompletion.find({ completedAt: { $gte: thirtyDaysAgo } }).lean();
    const completionByDay = {};
    for (const c of recentCompletions) {
      const d = dateStr(new Date(c.completedAt));
      completionByDay[d] = (completionByDay[d] || 0) + 1;
    }

    // Active days over time (daily active users, last 14 days)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const recentActivities = await Activity.find({ createdAt: { $gte: fourteenDaysAgo } }).lean();
    const dauByDay = {};
    const dauUsersByDay = {};
    for (const a of recentActivities) {
      const d = dateStr(new Date(a.createdAt));
      dauByDay[d] = (dauByDay[d] || 0) + 1;
      if (!dauUsersByDay[d]) dauUsersByDay[d] = new Set();
      dauUsersByDay[d].add(a.userId.toString());
    }

    // User signups over time (last 30 days)
    const recentUsers = await User.find({ createdAt: { $gte: thirtyDaysAgo } }).lean();
    const signupsByDay = {};
    for (const u of recentUsers) {
      const d = dateStr(new Date(u.createdAt));
      signupsByDay[d] = (signupsByDay[d] || 0) + 1;
    }

    res.json({
      success: true,
      data: {
        users: {
          total: totalTeens + totalParents + totalAdmins,
          teens: totalTeens,
          parents: totalParents,
          admins: totalAdmins,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
        },
        activity: {
          totalCompletions,
          totalActivities,
          totalBookmarks,
          activeUsers,
        },
        completionsOverTime: Object.entries(completionByDay)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        dailyActiveUsers: Object.entries(dauUsersByDay)
          .map(([date, userSet]) => ({ date, count: userSet.size }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        signupsOverTime: Object.entries(signupsByDay)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function timeAgo(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
