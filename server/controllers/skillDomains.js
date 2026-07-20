const SkillDomain = require('../models/SkillDomain');
const Skill = require('../models/Skill');

exports.getSkillDomains = async (req, res) => {
  try {
    const skillDomains = await SkillDomain.find().sort({ displayOrder: 1 });
    res.status(200).json({ success: true, count: skillDomains.length, data: skillDomains });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.createSkillDomain = async (req, res) => {
  try {
    const skillDomain = await SkillDomain.create(req.body);
    res.status(201).json({ success: true, data: skillDomain });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateSkillDomain = async (req, res) => {
  try {
    const skillDomain = await SkillDomain.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!skillDomain) return res.status(404).json({ success: false, message: 'Skill domain not found' });
    res.status(200).json({ success: true, data: skillDomain });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteSkillDomain = async (req, res) => {
  try {
    const skillDomain = await SkillDomain.findByIdAndDelete(req.params.id);
    if (!skillDomain) return res.status(404).json({ success: false, message: 'Skill domain not found' });
    await Skill.deleteMany({ categoryRef: req.params.id });
    // Also delete from the old Lesson model
    const Lesson = require('../models/Lesson');
    await Lesson.deleteMany({ skillDomain: req.params.id });
    res.status(200).json({ success: true, message: 'Skill domain deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
