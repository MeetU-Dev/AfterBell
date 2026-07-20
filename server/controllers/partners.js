const Partner = require('../models/Partner');

exports.getPartners = async (req, res) => {
  try {
    const partners = await Partner.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: partners.length, data: partners });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: partners.length, data: partners });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.createPartner = async (req, res) => {
  try {
    const { name, website, logo, description, partnerType } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Partner name is required' });
    }
    const partner = await Partner.create({ name, website, logo, description, partnerType });
    res.status(201).json({ success: true, data: partner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    res.status(200).json({ success: true, data: partner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    res.status(200).json({ success: true, message: 'Partner deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};