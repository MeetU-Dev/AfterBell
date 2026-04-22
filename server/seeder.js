
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const SkillDomain = require('./models/SkillDomain');
const Lesson = require('./models/Lesson');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Read JSON files
const skillDomains = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/skilldomains.json`, 'utf-8')
);

const lessons = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/lessons.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await SkillDomain.create(skillDomains);
    await Lesson.create(lessons);
    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await SkillDomain.deleteMany();
    await Lesson.deleteMany();
    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
