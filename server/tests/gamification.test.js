jest.mock('../models/User');
jest.mock('../utils/notificationService');

const User = require('../models/User');
const { createNotification } = require('../utils/notificationService');
const { getProfile, awardXp, checkin, getLeaderboard, getBadges } = require('../controllers/gamification');

describe('Gamification Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 'user123' }, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user gamification profile', async () => {
      const mockUser = {
        xp: 250,
        level: 3,
        currentStreak: 5,
        longestStreak: 10,
        lastActiveDate: new Date(),
        points: 250,
        badges: [],
        achievements: [],
        totalSkillsCompleted: 2,
        totalGamesPlayed: 0,
        select: jest.fn().mockResolvedValue({
          xp: 250,
          level: 3,
          currentStreak: 5,
          longestStreak: 10,
          lastActiveDate: new Date(),
          points: 250,
          badges: [],
          achievements: [],
          totalSkillsCompleted: 2,
          totalGamesPlayed: 0,
        }),
      };

      User.findById.mockReturnValue(mockUser);

      await getProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          xp: 250,
          level: 3,
          currentStreak: 5,
        }),
      });
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('awardXp', () => {
    it('should return 400 for invalid action', async () => {
      req.body = { action: 'invalid_action' };

      await awardXp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid action' });
    });

    it('should award XP for valid action and save user', async () => {
      const saveMock = jest.fn();
      const mockUser = {
        _id: 'user123',
        xp: 0,
        points: 0,
        level: 1,
        currentStreak: 0,
        totalSkillsCompleted: 0,
        totalGamesPlayed: 0,
        badges: [],
        save: saveMock,
      };
      User.findById.mockResolvedValue(mockUser);
      req.body = { action: 'complete_skill' };

      await awardXp(req, res);

      expect(mockUser.xp).toBe(50);
      expect(mockUser.points).toBe(50);
      expect(mockUser.level).toBe(1); // 50 < 100, so still level 1
      expect(saveMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          xpAwarded: 50,
          totalXp: 50,
          leveledUp: false,
        }),
      });
    });

    it('should trigger level up notification when crossing threshold', async () => {
      const saveMock = jest.fn();
      const mockUser = {
        _id: 'user123',
        xp: 95,
        points: 95,
        level: 1,
        currentStreak: 0,
        totalSkillsCompleted: 1,
        totalGamesPlayed: 0,
        badges: [],
        save: saveMock,
      };
      User.findById.mockResolvedValue(mockUser);
      req.body = { action: 'complete_quiz' };

      await awardXp(req, res);

      expect(mockUser.level).toBe(2);
      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'level_up' })
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          leveledUp: true,
          level: 2,
        }),
      });
    });
  });

  describe('checkin', () => {
    it('should set streak to 1 on first checkin', async () => {
      const saveMock = jest.fn();
      const mockUser = {
        _id: 'user123',
        xp: 0,
        points: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        badges: [],
        totalSkillsCompleted: 0,
        totalGamesPlayed: 0,
        save: saveMock,
      };
      User.findById.mockResolvedValue(mockUser);

      await checkin(req, res);

      expect(mockUser.currentStreak).toBe(1);
      expect(saveMock).toHaveBeenCalled();
    });

    it('should not award duplicate XP for same day', async () => {
      const saveMock = jest.fn();
      const today = new Date();
      const mockUser = {
        _id: 'user123',
        xp: 100,
        points: 100,
        level: 2,
        currentStreak: 3,
        longestStreak: 3,
        lastActiveDate: today,
        badges: [],
        totalSkillsCompleted: 0,
        totalGamesPlayed: 0,
        save: saveMock,
      };
      User.findById.mockResolvedValue(mockUser);

      await checkin(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          xpAwarded: 0,
          currentStreak: 3,
        }),
      });
    });

    it('should increment streak for consecutive day', async () => {
      const saveMock = jest.fn();
      const yesterday = new Date(Date.now() - 86400000);
      const mockUser = {
        _id: 'user123',
        xp: 0,
        points: 0,
        level: 1,
        currentStreak: 2,
        longestStreak: 2,
        lastActiveDate: yesterday,
        badges: [],
        totalSkillsCompleted: 0,
        totalGamesPlayed: 0,
        save: saveMock,
      };
      User.findById.mockResolvedValue(mockUser);

      await checkin(req, res);

      expect(mockUser.currentStreak).toBe(3);
    });

    it('should reset streak for missed day', async () => {
      const saveMock = jest.fn();
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
      const mockUser = {
        _id: 'user123',
        xp: 0,
        points: 0,
        level: 1,
        currentStreak: 5,
        longestStreak: 5,
        lastActiveDate: twoDaysAgo,
        badges: [],
        totalSkillsCompleted: 0,
        totalGamesPlayed: 0,
        save: saveMock,
      };
      User.findById.mockResolvedValue(mockUser);

      await checkin(req, res);

      expect(mockUser.currentStreak).toBe(1);
    });
  });

  describe('getLeaderboard', () => {
    it('should return sorted leaderboard of teen users', async () => {
      const mockUsers = [
        { _id: '1', name: 'Alice', xp: 500, level: 5, currentStreak: 10, badges: [{ name: 'badge1' }] },
        { _id: '2', name: 'Bob', xp: 300, level: 3, currentStreak: 5, badges: [] },
      ];

      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      const selectMock = jest.fn().mockResolvedValue(mockUsers);
      User.find.mockReturnValue({ sort: sortMock, limit: limitMock, select: selectMock });

      await getLeaderboard(req, res);

      expect(User.find).toHaveBeenCalledWith({ role: 'teen' });
      expect(sortMock).toHaveBeenCalledWith({ xp: -1 });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [
          { rank: 1, userId: '1', name: 'Alice', xp: 500, level: 5, streak: 10, badges: 1 },
          { rank: 2, userId: '2', name: 'Bob', xp: 300, level: 3, streak: 5, badges: 0 },
        ],
      });
    });
  });

  describe('getBadges', () => {
    it('should return all badges with unlock status', async () => {
      const mockUser = {
        badges: [{ name: 'first-steps', unlockedAt: new Date() }],
        xp: 100,
        level: 2,
        currentStreak: 1,
        totalSkillsCompleted: 1,
        totalGamesPlayed: 0,
      };
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

      await getBadges(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'first-steps', unlocked: true }),
          expect.objectContaining({ id: 'skill-master', unlocked: false }),
        ]),
      });
    });
  });
});
