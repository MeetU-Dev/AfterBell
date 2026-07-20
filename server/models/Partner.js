const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a partner name'],
    trim: true,
    maxlength: [100, 'Name can not be more than 100 characters'],
  },
  website: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    maxlength: [1000, 'Description can not be more than 1000 characters'],
  },
  partnerType: {
    type: String,
    enum: ['ngo', 'government', 'psychologist', 'career_expert', 'financial_educator', 'healthcare', 'educational', 'other'],
    default: 'other',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Partner', PartnerSchema);