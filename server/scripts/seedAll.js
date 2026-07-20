const { execSync } = require('child_process');
const path = require('path');

const seeds = [
  'seedAdmin.js',
  'seedDemoTeen.js',
  'seedContent.js',
  'seedPartners.js',
];

async function runAll() {
  console.log('Running all seeds...\n');
  for (const seed of seeds) {
    console.log(`--- ${seed} ---`);
    try {
      execSync(`node ${path.join(__dirname, seed)}`, { stdio: 'inherit' });
      console.log(`✅ ${seed} complete\n`);
    } catch (err) {
      console.error(`❌ ${seed} failed:`, err.message);
    }
  }
  console.log('Done!');
  process.exit(0);
}

runAll();
