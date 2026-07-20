jest.mock('../models/Skill');

const Skill = require('../models/Skill');
const { getSkills, getSkill, suggestSkills, getRelatedSkills } = require('../controllers/skills');

describe('Skills Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getSkills', () => {
    const mockSkills = [
      { _id: '1', title: 'Cooking Basics', description: 'Learn to cook', difficulty: 'Beginner', category: 'life-skills', active: true },
      { _id: '2', title: 'Mindfulness', description: 'Be present', difficulty: 'Intermediate', category: 'mental-health', active: true },
    ];

    beforeEach(() => {
      Skill.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockSkills),
      });
      Skill.countDocuments.mockResolvedValue(mockSkills.length);
    });

    it('should return all active skills with default pagination', async () => {
      await getSkills(req, res);

      expect(Skill.find).toHaveBeenCalledWith({ active: true });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        total: 2,
        page: 1,
        pages: 1,
        data: mockSkills,
      });
    });

    it('should filter by category', async () => {
      req.query.category = 'mental-health';

      await getSkills(req, res);

      expect(Skill.find).toHaveBeenCalledWith({ active: true, category: 'mental-health' });
    });

    it('should filter by difficulty', async () => {
      req.query.difficulty = 'beginner';

      await getSkills(req, res);

      expect(Skill.find).toHaveBeenCalledWith(
        expect.objectContaining({ difficulty: 'Beginner' })
      );
    });

    it('should search by keyword', async () => {
      req.query.search = 'cook';

      await getSkills(req, res);

      const filterArg = Skill.find.mock.calls[0][0];
      expect(filterArg.$or).toBeDefined();
      expect(filterArg.$or.length).toBe(3);
    });

    it('should sort by name', async () => {
      req.query.sort = 'name';

      await getSkills(req, res);

      const chain = Skill.find.mock.results[0].value;
      expect(chain.sort).toHaveBeenCalledWith({ title: 1 });
    });

    it('should sort by duration', async () => {
      req.query.sort = 'duration';

      await getSkills(req, res);

      const chain = Skill.find.mock.results[0].value;
      expect(chain.sort).toHaveBeenCalledWith({ durationMinutes: 1 });
    });

    it('should handle errors', async () => {
      Skill.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await getSkills(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'DB error' });
    });
  });

  describe('getSkill', () => {
    it('should return a skill by id', async () => {
      const skill = { _id: '1', title: 'Cooking Basics' };
      Skill.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(skill) });
      req.params.id = '1';

      await getSkill(req, res);

      expect(Skill.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({ success: true, data: skill });
    });

    it('should return 404 if skill not found', async () => {
      Skill.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      req.params.id = 'nonexistent';

      await getSkill(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Skill not found' });
    });
  });

  describe('suggestSkills', () => {
    it('should return empty suggestions for empty query', async () => {
      req.query.q = '';

      await suggestSkills(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, suggestions: [] });
    });

    it('should return title and tag suggestions for valid query', async () => {
      req.query.q = 'cook';
      Skill.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { _id: '1', title: 'Cooking Basics', category: 'life-skills', difficulty: 'Beginner', durationMinutes: 30 },
        ]),
      });
      Skill.distinct.mockResolvedValue(['cooking', 'kitchen']);

      await suggestSkills(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        suggestions: expect.arrayContaining([
          expect.objectContaining({ type: 'skill', text: 'Cooking Basics' }),
          expect.objectContaining({ type: 'tag', text: 'cooking' }),
        ]),
      });
    });
  });

  describe('getRelatedSkills', () => {
    it('should return related skills by category and tags', async () => {
      const skill = { _id: '1', category: 'life-skills', tags: ['cooking'] };
      const related = [{ _id: '2', title: 'Meal Prep' }];

      Skill.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(skill) }) });
      Skill.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(related),
      });
      req.params.id = '1';

      await getRelatedSkills(req, res);

      expect(Skill.find).toHaveBeenCalledWith(
        expect.objectContaining({ _id: { $ne: '1' }, active: true })
      );
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 1, data: related });
    });

    it('should return 404 if skill not found', async () => {
      Skill.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }) });
      req.params.id = 'nonexistent';

      await getRelatedSkills(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
