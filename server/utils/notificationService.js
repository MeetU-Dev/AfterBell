const Notification = require('../models/Notification');

const NOTIFICATION_MESSAGES = {
  skill_completed: (data) => ({
    title: 'Skill Completed! 🎉',
    message: `You completed "${data.skillName}" and earned ${data.xpAwarded || 50} XP`,
    link: `/skills/${data.skillId}`,
  }),
  badge_unlocked: (data) => ({
    title: 'New Badge Unlocked! 🏆',
    message: `Congratulations! You earned the "${data.badgeName}" badge`,
    link: '/badges',
  }),
  level_up: (data) => ({
    title: 'Level Up! ⬆️',
    message: `You reached Level ${data.level}! Keep up the great work`,
    link: '/analytics',
  }),
  streak_milestone: (data) => ({
    title: 'Streak Milestone! 🔥',
    message: `You're on a ${data.streak}-day learning streak!`,
    link: '/analytics',
  }),
  weekly_report: (data) => ({
    title: 'Your Weekly Report 📊',
    message: `You completed ${data.skillsCompleted} skills this week`,
    link: '/analytics',
  }),
};

exports.createNotification = async ({ userId, type, data }) => {
  try {
    const template = NOTIFICATION_MESSAGES[type];
    if (!template) return null;

    const { title, message, link } = template(data);

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      metadata: data || {},
    });

    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
};

exports.createBulkNotifications = async (entries) => {
  const results = [];
  for (const entry of entries) {
    const n = await exports.createNotification(entry);
    if (n) results.push(n);
  }
  return results;
};
