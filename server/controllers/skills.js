const Skill = require('../models/Skill');

// @desc      Get all skills with filtering, sorting, and pagination
// @route     GET /api/v1/skills
// @access    Public
exports.getSkills = async (req, res) => {
  try {
    const { category, difficulty, search, sort, page = 1, limit = 50 } = req.query;
    const filter = { active: true };

    if (category && category !== 'all') filter.category = category;
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { title: 1 };
    else if (sort === 'difficulty') sortOption = { difficulty: 1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'duration') sortOption = { durationMinutes: 1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [skills, total] = await Promise.all([
      Skill.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Skill.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: skills.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: skills,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc      Get single skill
// @route     GET /api/v1/skills/:id
// @access    Public
exports.getSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).lean();
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, data: skill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc      Autocomplete / suggest skills
// @route     GET /api/v1/skills/search/suggest?q=
// @access    Public
exports.suggestSkills = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 1) {
      return res.json({ success: true, suggestions: [] });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [titles, tags] = await Promise.all([
      Skill.find({ active: true, title: regex }, { title: 1, category: 1, difficulty: 1, durationMinutes: 1, _id: 1 })
        .limit(8).lean(),
      Skill.distinct('tags', { active: true, tags: regex }),
    ]);

    const tagSuggestions = tags
      .filter(t => t && regex.test(t))
      .slice(0, 5)
      .map(t => ({ type: 'tag', text: t }));

    const titleSuggestions = titles.map(s => ({
      type: 'skill',
      text: s.title,
      _id: s._id,
      category: s.category,
      difficulty: s.difficulty,
      durationMinutes: s.durationMinutes,
    }));

    res.json({
      success: true,
      suggestions: [...titleSuggestions, ...tagSuggestions],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc      Get related skills (same category, excluding self)
// @route     GET /api/v1/skills/related/:id
// @access    Public
exports.getRelatedSkills = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).select('category tags').lean();
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

    const related = await Skill.find({
      _id: { $ne: req.params.id },
      active: true,
      $or: [
        { category: skill.category },
        { tags: { $in: skill.tags || [] } },
      ],
    })
      .sort({ rating: -1, createdAt: -1 })
      .limit(6)
      .lean();

    res.json({ success: true, count: related.length, data: related });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc      Create skill
// @route     POST /api/v1/skills
// @access    Private/Admin
exports.createSkill = async (req, res) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json({ success: true, data: skill });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc      Update skill
// @route     PUT /api/v1/skills/:id
// @access    Private/Admin
exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, data: skill });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc      Delete skill
// @route     DELETE /api/v1/skills/:id
// @access    Private/Admin
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
