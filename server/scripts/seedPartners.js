const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Partner = require('../models/Partner');
const SkillDomain = require('../models/SkillDomain');
const Lesson = require('../models/Lesson');

dotenv.config({ path: './config/config.env' });

const partners = [
  {
    name: 'Khan Academy',
    website: 'https://www.khanacademy.org',
    description: 'Free world-class education for anyone, anywhere. Khan Academy offers practice exercises, instructional videos, and a personalized learning dashboard.',
    partnerType: 'educational',
  },
  {
    name: 'Crash Course',
    website: 'https://thecrashcourse.com',
    description: 'Educational YouTube channel that delivers engaging courses on a wide range of topics from psychology to economics.',
    partnerType: 'educational',
  },
  {
    name: 'TED-Ed',
    website: 'https://ed.ted.com',
    description: 'TED-Ed\'s commitment to creating lessons worth sharing is an extension of TED\'s mission of spreading great ideas.',
    partnerType: 'educational',
  },
  {
    name: 'National Institute of Mental Health',
    website: 'https://www.nimh.nih.gov',
    description: 'The lead federal agency for research on mental disorders, providing educational resources on mental health.',
    partnerType: 'healthcare',
  },
  {
    name: 'Consumer Financial Protection Bureau',
    website: 'https://www.consumerfinance.gov',
    description: 'Helping consumers take control of their financial lives through education and advocacy.',
    partnerType: 'government',
  },
  {
    name: 'UNICEF',
    website: 'https://www.unicef.org',
    description: 'Works in over 190 countries to protect children\'s rights and provide quality education and life skills.',
    partnerType: 'ngo',
  },
  {
    name: 'Mindful Schools',
    website: 'https://www.mindfulschools.org',
    description: 'Bringing mindfulness to education, helping students build focus, resilience, and emotional intelligence.',
    partnerType: 'psychologist',
  },
  {
    name: 'Junior Achievement',
    website: 'https://www.juniorachievement.org',
    description: 'Prepares young people for the real world by providing hands-on financial literacy, work readiness, and entrepreneurship education.',
    partnerType: 'career_expert',
  },
];

const seedPartners = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    await Partner.deleteMany({});
    await Partner.insertMany(partners);
    console.log(`${partners.length} partners seeded`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedPartners();