const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../config/config.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const SkillCompletion = require('../models/SkillCompletion');

const TEEN_EMAIL = 'teenadmin@afterbell.com';
const TEEN_PASSWORD = 'TeenAdmin@123';
const TEEN_NAME = 'Demo Teen';
const ADMIN_EMAIL = 'admin@afterbell.com';

const DEMO_COMPLETIONS = [
  { skillId: '1', skillName: 'How to Create a Budget' },
  { skillId: '2', skillName: 'Public Speaking Basics' },
  { skillId: '3', skillName: 'Basic Cooking Skills' },
];

const seedDemoTeen = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      console.error('Admin user not found. Run: npm run seed:admin first');
      process.exit(1);
    }

    let teen = await User.findOne({ email: TEEN_EMAIL });
    if (!teen) {
      teen = await User.create({
        name: TEEN_NAME,
        email: TEEN_EMAIL,
        password: TEEN_PASSWORD,
        role: 'teen',
        verifiedByParent: true,
        linkedParentId: admin._id,
      });
      console.log('Demo teen created:', TEEN_EMAIL);
    } else {
      teen.verifiedByParent = true;
      teen.linkedParentId = admin._id;
      await teen.save({ validateBeforeSave: false });
      console.log('Demo teen updated:', TEEN_EMAIL);
    }

    if (!admin.linkedTeenIds) admin.linkedTeenIds = [];
    if (!admin.linkedTeenIds.some(id => id.toString() === teen._id.toString())) {
      admin.linkedTeenIds.push(teen._id);
      await admin.save({ validateBeforeSave: false });
      console.log('Teen linked to admin');
    }

    for (const { skillId, skillName } of DEMO_COMPLETIONS) {
      await SkillCompletion.findOneAndUpdate(
        { userId: teen._id, skillId },
        { userId: teen._id, skillId, skillName, completedAt: new Date() },
        { upsert: true, new: true }
      );
    }
    console.log('Added', DEMO_COMPLETIONS.length, 'completed skills for demo teen');

    console.log('\n--- Demo teen (linked to admin) ---');
    console.log('Email:', TEEN_EMAIL);
    console.log('Password:', TEEN_PASSWORD);
    console.log('Completed skills:', DEMO_COMPLETIONS.map(c => c.skillName).join(', '));
    console.log('-----------------------------------\n');
    console.log('Log in as admin@afterbell.com and open Parent Dashboard to see this teen.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

seedDemoTeen();
