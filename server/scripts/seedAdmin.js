const User = require('../models/User');

const ADMIN_EMAIL = 'admin@afterbell.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = 'AfterBell Admin';

const seedAdmin = async () => {
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role === 'admin') {
      console.log('Admin user already exists:', ADMIN_EMAIL);
      return;
    }
    existing.role = 'admin';
    existing.name = ADMIN_NAME;
    existing.password = ADMIN_PASSWORD;
    await existing.save();
    console.log('Existing user updated to admin:', ADMIN_EMAIL);
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log('Admin user created:', ADMIN_EMAIL);
  }

  console.log('\n--- Admin credentials ---');
  console.log('Email:', ADMIN_EMAIL);
  console.log('Password:', ADMIN_PASSWORD);
  console.log('------------------------\n');
};

async function main() {
  try {
    require('dotenv').config({ path: require('path').join(__dirname, '../config/config.env') });
    await require('mongoose').connect(process.env.MONGO_URI);
    await seedAdmin();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedAdmin, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME };