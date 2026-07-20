jest.mock('../models/Notification');

const Notification = require('../models/Notification');
const { createNotification, createBulkNotifications } = require('../utils/notificationService');

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    const userId = 'user123';

    it('should create a skill_completed notification', async () => {
      Notification.create.mockResolvedValue({ _id: 'notif1' });
      const data = { skillName: 'Cooking Basics', skillId: 'skill1', xpAwarded: 50 };

      await createNotification({ userId, type: 'skill_completed', data });

      expect(Notification.create).toHaveBeenCalledWith({
        userId,
        type: 'skill_completed',
        title: expect.stringContaining('Skill Completed'),
        message: expect.stringContaining('Cooking Basics'),
        link: '/skills/skill1',
        metadata: data,
      });
    });

    it('should create a badge_unlocked notification', async () => {
      Notification.create.mockResolvedValue({ _id: 'notif2' });

      await createNotification({ userId, type: 'badge_unlocked', data: { badgeName: 'Rising Star' } });

      expect(Notification.create).toHaveBeenCalledWith({
        userId,
        type: 'badge_unlocked',
        title: expect.stringContaining('New Badge'),
        message: expect.stringContaining('Rising Star'),
        link: '/badges',
        metadata: { badgeName: 'Rising Star' },
      });
    });

    it('should create a level_up notification', async () => {
      Notification.create.mockResolvedValue({ _id: 'notif3' });

      await createNotification({ userId, type: 'level_up', data: { level: 5 } });

      expect(Notification.create).toHaveBeenCalledWith({
        userId,
        type: 'level_up',
        title: expect.stringContaining('Level Up'),
        message: expect.stringContaining('Level 5'),
        link: '/analytics',
        metadata: { level: 5 },
      });
    });

    it('should create a streak_milestone notification', async () => {
      Notification.create.mockResolvedValue({ _id: 'notif4' });

      await createNotification({ userId, type: 'streak_milestone', data: { streak: 7 } });

      expect(Notification.create).toHaveBeenCalledWith({
        userId,
        type: 'streak_milestone',
        title: expect.stringContaining('Streak Milestone'),
        message: expect.stringContaining('7-day'),
        link: '/analytics',
        metadata: { streak: 7 },
      });
    });

    it('should create a weekly_report notification', async () => {
      Notification.create.mockResolvedValue({ _id: 'notif5' });

      await createNotification({ userId, type: 'weekly_report', data: { skillsCompleted: 3 } });

      expect(Notification.create).toHaveBeenCalledWith({
        userId,
        type: 'weekly_report',
        title: expect.stringContaining('Weekly Report'),
        message: expect.stringContaining('3 skills'),
        link: '/analytics',
        metadata: { skillsCompleted: 3 },
      });
    });

    it('should return null for unknown notification types', async () => {
      const result = await createNotification({ userId, type: 'unknown_type', data: {} });

      expect(result).toBeNull();
      expect(Notification.create).not.toHaveBeenCalled();
    });

    it('should return null on db error', async () => {
      Notification.create.mockRejectedValue(new Error('DB error'));

      const result = await createNotification({ userId, type: 'level_up', data: { level: 2 } });

      expect(result).toBeNull();
    });
  });

  describe('createBulkNotifications', () => {
    it('should create multiple notifications', async () => {
      Notification.create
        .mockResolvedValueOnce({ _id: 'n1' })
        .mockResolvedValueOnce({ _id: 'n2' });

      const entries = [
        { userId: 'u1', type: 'level_up', data: { level: 2 } },
        { userId: 'u1', type: 'badge_unlocked', data: { badgeName: 'Test' } },
      ];

      const results = await createBulkNotifications(entries);

      expect(results).toHaveLength(2);
      expect(Notification.create).toHaveBeenCalledTimes(2);
    });
  });
});
