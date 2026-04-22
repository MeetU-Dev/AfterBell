
const SkillDomain = require('../models/SkillDomain');

// @desc      Get all skill domains
// @route     GET /api/v1/skilldomains
// @access    Public
exports.getSkillDomains = async (req, res, next) => {
  try {
    const skillDomains = await SkillDomain.find();

    res.status(200).json({ success: true, count: skillDomains.length, data: skillDomains });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc      Create new skill domain
// @route     POST /api/v1/skilldomains
// @access    Private
exports.createSkillDomain = async (req, res, next) => {
  try {
    const skillDomain = await SkillDomain.create(req.body);

    res.status(201).json({
      success: true,
      data: skillDomain,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
