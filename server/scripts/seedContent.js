const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../config/config.env') });

const connectDB = require('../config/db');
const SkillDomain = require('../models/SkillDomain');
const Skill = require('../models/Skill');

const categories = [
  { name: 'Financial Literacy', slug: 'finance', description: 'Master money management, budgeting, and smart financial habits.', icon: 'FiDollarSign', gradient: 'from-green-400 to-emerald-500', color: '#10B981', displayOrder: 1 },
  { name: 'Communication', slug: 'communication', description: 'Build confidence in public speaking, writing, and self-expression.', icon: 'FiMessageCircle', gradient: 'from-blue-400 to-indigo-500', color: '#3B82F6', displayOrder: 2 },
  { name: 'Cooking & Nutrition', slug: 'cooking', description: 'Learn essential cooking skills and healthy eating habits.', icon: 'FiStar', gradient: 'from-orange-400 to-red-500', color: '#F97316', displayOrder: 3 },
  { name: 'Digital Skills', slug: 'digital', description: 'Navigate the digital world with photography, coding, and online safety.', icon: 'FiCamera', gradient: 'from-purple-400 to-pink-500', color: '#A855F7', displayOrder: 4 },
  { name: 'Arts & Creativity', slug: 'art', description: 'Unleash your creative potential through writing, design, and expression.', icon: 'FiFeather', gradient: 'from-pink-400 to-rose-500', color: '#EC4899', displayOrder: 5 },
  { name: 'Mental Health', slug: 'mental-health', description: 'Build resilience, manage stress, and prioritize your mental wellbeing.', icon: 'FiHeart', gradient: 'from-teal-400 to-cyan-500', color: '#14B8A6', displayOrder: 6 },
  { name: 'Relationships', slug: 'relationships', description: 'Navigate friendships, family dynamics, and romantic relationships.', icon: 'FiUsers', gradient: 'from-red-400 to-pink-500', color: '#EF4444', displayOrder: 7 },
  { name: 'Life Skills', slug: 'life-skills', description: 'Practical skills for everyday life — from time management to decision making.', icon: 'FiTool', gradient: 'from-amber-400 to-yellow-500', color: '#F59E0B', displayOrder: 8 },
];

const skills = [
  {
    title: 'How to Create a Budget',
    description: 'Learn the basics of budgeting and managing your money effectively. Perfect for students starting their financial journey.',
    category: 'finance',
    icon: 'FiDollarSign',
    duration: '15 min', durationMinutes: 15,
    difficulty: 'Beginner', rating: 4.8, lessons: 5, certificate: true,
    tags: ['budget', 'finance', 'money', 'saving'],
    videoUrl: 'https://www.youtube.com/embed/sNocjsSSRkE',
    content: 'Budgeting is a fundamental skill that helps you track your income and expenses. In this lesson, you\'ll learn how to create a simple budget, track your spending, and save money for your goals.',
    steps: [
      { title: 'Understanding Money Basics', description: 'Learn the fundamentals of income, expenses, and why budgeting matters.', duration: '5 min', type: 'video', content: 'https://www.youtube.com/embed/sVKQn2I4HDM', resources: ['Budget worksheet template', 'Income tracking sheet'] },
      { title: 'Track Your Spending', description: 'Discover where your money actually goes and identify spending patterns.', duration: '5 min', type: 'reading', content: 'Tracking your expenses is the first step to taking control of your finances. Start by writing down everything you spend for a week.', resources: ['Spending tracker app', 'Expense categories guide'] },
      { title: 'Create Your First Budget', description: 'Build a simple budget using the 50/30/20 rule.', duration: '10 min', type: 'interactive', content: 'The 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings. Apply your income and expenses to this framework.', resources: ['50/30/20 calculator', 'Sample budget template'] },
      { title: 'Budget Challenge Game', description: 'Test your budgeting skills in a real-world scenario.', duration: '10 min', type: 'game', gameType: 'budget', content: 'Manage your monthly budget and make smart financial decisions!', resources: [] },
      { title: 'Smart Saving Strategies', description: 'Learn practical tips for saving money and building an emergency fund.', duration: '5 min', type: 'reading', content: 'Pay yourself first! Set up automatic transfers to savings. Start small — even $5 a week adds up to $260 a year.', resources: ['Savings goals worksheet', 'Compound interest calculator'] },
    ],
  },
  {
    title: 'Public Speaking Basics',
    description: 'Overcome stage fright and deliver confident presentations. Essential for school projects and future career success.',
    category: 'communication',
    icon: 'FiMessageCircle',
    duration: '20 min', durationMinutes: 20,
    difficulty: 'Beginner', rating: 4.9, lessons: 8, certificate: true,
    tags: ['public speaking', 'communication', 'confidence', 'presentation'],
    videoUrl: 'https://www.youtube.com/embed/kcoch-Mpgls',
    content: 'Public speaking is a valuable skill that can boost your confidence and help you express your ideas clearly.',
    steps: [
      { title: 'Overcoming Stage Fright', description: 'Understand why we get nervous and learn techniques to stay calm.', duration: '5 min', type: 'video', content: 'https://www.youtube.com/embed/K93fMnFKwfI', resources: ['Breathing exercises', 'Nervousness checklist'] },
      { title: 'Structuring Your Speech', description: 'Learn the basic structure of an effective speech or presentation.', duration: '5 min', type: 'reading', content: 'A good speech has three parts: tell them what you\'re going to say, say it, then tell them what you said.', resources: ['Speech outline template', 'Speech structure guide'] },
      { title: 'Body Language & Voice', description: 'Master non-verbal communication and vocal techniques.', duration: '5 min', type: 'interactive', content: 'Your body language speaks louder than words. Practice open posture, eye contact, and varied vocal tone.', resources: ['Body language tips PDF', 'Voice warm-up exercises'] },
      { title: 'Speaking Practice Game', description: 'Practice your public speaking skills in a fun interactive scenario.', duration: '10 min', type: 'game', gameType: 'speaking', content: 'Deliver a speech and get scored on clarity, confidence, and content!', resources: [] },
      { title: 'Handling Q&A Sessions', description: 'Learn how to handle questions from your audience with confidence.', duration: '5 min', type: 'reading', content: 'Listen to the full question, pause to think, repeat it for the audience, then answer concisely.', resources: ['Q&A preparation tips', 'Common questions guide'] },
    ],
  },
  {
    title: 'Basic Cooking Skills',
    description: 'Master essential cooking techniques and learn to prepare simple, healthy meals.',
    category: 'cooking',
    icon: 'FiStar',
    duration: '25 min', durationMinutes: 25,
    difficulty: 'Beginner', rating: 4.7, lessons: 6, certificate: true,
    tags: ['cooking', 'nutrition', 'healthy eating', 'meal prep'],
    videoUrl: 'https://www.youtube.com/embed/aopS3q6f1GY',
    content: 'Cooking is a life skill that everyone should learn. Discover how to chop vegetables, cook pasta, make simple sauces, and create delicious meals from scratch.',
    steps: [
      { title: 'Kitchen Safety & Tools', description: 'Learn essential kitchen safety rules and must-have tools.', duration: '5 min', type: 'video', content: 'https://www.youtube.com/embed/iAJviCO5VuA', resources: ['Kitchen safety checklist', 'Essential tools guide'] },
      { title: 'Knife Skills', description: 'Master basic cutting techniques for safety and efficiency.', duration: '5 min', type: 'reading', content: 'The claw grip keeps your fingers safe. Practice dicing, slicing, and chopping with consistent sizes.', resources: ['Knife skills guide', 'Cutting techniques video'] },
      { title: 'Basic Recipes', description: 'Learn 3 simple recipes you can make with basic ingredients.', duration: '5 min', type: 'interactive', content: 'Start with scrambled eggs, pasta with tomato sauce, and a simple salad. Master these and you can build from there!', resources: ['Recipe cards PDF', 'Ingredient substitution guide'] },
      { title: 'Cooking Challenge Game', description: 'Test your cooking knowledge in a fun kitchen challenge!', duration: '10 min', type: 'game', gameType: 'cooking', content: 'Match ingredients, tools, and techniques in this interactive cooking challenge!', resources: [] },
      { title: 'Meal Planning Basics', description: 'Learn to plan meals for the week ahead.', duration: '5 min', type: 'reading', content: 'Plan your meals on Sunday. Prep ingredients in advance. This saves time, money, and reduces food waste.', resources: ['Meal planner template', 'Weekly meal prep guide'] },
    ],
  },
  {
    title: 'Digital Photography',
    description: 'Learn the art of photography and visual storytelling. Capture amazing photos with any camera or smartphone.',
    category: 'digital',
    icon: 'FiCamera',
    duration: '20 min', durationMinutes: 20,
    difficulty: 'Beginner', rating: 4.6, lessons: 6, certificate: true,
    tags: ['photography', 'digital', 'creative', 'visual'],
    videoUrl: 'https://www.youtube.com/embed/iWQQgZh9EyE',
    content: 'Photography is about capturing moments and telling stories through images.',
    steps: [
      { title: 'Understanding Your Camera', description: 'Learn the basic functions of any camera or smartphone.', duration: '5 min', type: 'video', content: 'https://www.youtube.com/embed/TcpQ4OAKVpQ', resources: [] },
      { title: 'Composition Rules', description: 'Master the rule of thirds, leading lines, and framing.', duration: '5 min', type: 'reading', content: 'The rule of thirds: imagine a 3x3 grid. Place key elements along the lines for more dynamic photos.', resources: [] },
      { title: 'Lighting Techniques', description: 'Understand natural and artificial lighting.', duration: '5 min', type: 'interactive', content: 'Golden hour (just after sunrise/before sunset) gives the best natural light. Avoid harsh midday sun.', resources: [] },
      { title: 'Photography Challenge', description: 'Put your skills to the test in a photo challenge!', duration: '10 min', type: 'game', gameType: 'photography', content: 'Frame the perfect shot in this interactive photography game!', resources: [] },
    ],
  },
  {
    title: 'Social Media Safety',
    description: 'Stay safe and smart on social media. Learn about privacy, cyberbullying, and digital footprints.',
    category: 'digital',
    icon: 'FiShield',
    duration: '20 min', durationMinutes: 20,
    difficulty: 'Beginner', rating: 4.9, lessons: 5, certificate: true,
    tags: ['social media', 'safety', 'privacy', 'cyberbullying'],
    videoUrl: 'https://www.youtube.com/embed/6Z1WDe0n-bQ',
    content: 'Social media is a powerful tool, but it comes with responsibilities.',
    steps: [
      { title: 'Privacy Settings', description: 'Learn to configure your privacy settings across platforms.', duration: '5 min', type: 'video', content: 'https://www.youtube.com/embed/0lUdd8cnwGA', resources: [] },
      { title: 'Digital Footprint', description: 'Understand how your online activity creates a permanent record.', duration: '5 min', type: 'reading', content: 'Everything you post online leaves a digital footprint. Think before you post — would you want a future employer to see this?', resources: [] },
      { title: 'Cyberbullying Awareness', description: 'Recognize and respond to cyberbullying.', duration: '5 min', type: 'interactive', content: 'Don\'t engage, save the evidence, block the user, and report it to a trusted adult.', resources: [] },
      { title: 'Safety Challenge Game', description: 'Test your knowledge of online safety!', duration: '10 min', type: 'game', gameType: 'safety', content: 'Navigate online scenarios and make smart safety choices!', resources: [] },
    ],
  },
  {
    title: 'Creative Writing',
    description: 'Unlock your imagination and develop your writing skills. Perfect for storytelling, essays, and self-expression.',
    category: 'art',
    icon: 'FiFeather',
    duration: '25 min', durationMinutes: 25,
    difficulty: 'Beginner', rating: 4.7, lessons: 7, certificate: true,
    tags: ['writing', 'creative', 'storytelling', 'expression'],
    videoUrl: 'https://www.youtube.com/embed/RSoRzTtwgP4',
    content: 'Creative writing is about expressing your unique voice and imagination through words.',
    steps: [
      { title: 'Finding Your Voice', description: 'Discover your unique writing style and perspective.', duration: '5 min', type: 'video', content: 'https://www.youtube.com/embed/x2e3c4GF8sw', resources: [] },
      { title: 'Story Structure', description: 'Learn the classic story arc and plot elements.', duration: '5 min', type: 'reading', content: 'Every story needs: exposition, rising action, climax, falling action, and resolution.', resources: [] },
      { title: 'Show, Don\'t Tell', description: 'Master the art of descriptive writing.', duration: '5 min', type: 'interactive', content: 'Instead of "she was sad," write "tears streamed down her cheeks as she stared at the empty chair."', resources: [] },
      { title: 'Writing Challenge Game', description: 'Put your creative writing skills to the test!', duration: '10 min', type: 'game', gameType: 'writing', content: 'Write compelling stories in this interactive creative writing challenge!', resources: [] },
    ],
  },
  {
    title: 'Time Management',
    description: 'Master the art of productivity and make the most of your time. Essential for school, work, and personal life.',
    category: 'life-skills',
    icon: 'FiClock',
    duration: '20 min', durationMinutes: 20,
    difficulty: 'Beginner', rating: 4.8, lessons: 6, certificate: true,
    tags: ['time management', 'productivity', 'organization', 'study skills'],
    videoUrl: 'https://www.youtube.com/embed/2Si7ah_h32s',
    content: 'Time management is about working smarter, not harder.',
    steps: [
      { title: 'Understanding Your Time', description: 'Analyze how you currently spend your time.', duration: '5 min', type: 'video', content: 'https://www.youtube.com/embed/iDbdXTMnOmE', resources: [] },
      { title: 'Priority Matrix', description: 'Learn to distinguish urgent from important tasks.', duration: '5 min', type: 'reading', content: 'The Eisenhower Matrix helps you prioritize: urgent+important first, then important-not-urgent, delegate urgent-not-important, eliminate neither.', resources: [] },
      { title: 'Pomodoro Technique', description: 'Master the focused work sprint method.', duration: '5 min', type: 'interactive', content: 'Work for 25 minutes, take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.', resources: [] },
      { title: 'Time Management Game', description: 'Test your time management skills in a fast-paced challenge!', duration: '10 min', type: 'game', gameType: 'time', content: 'Manage your tasks and beat the clock in this time management game!', resources: [] },
    ],
  },
  {
    title: 'Basic Coding Concepts',
    description: 'Dive into the world of programming! Learn fundamental coding concepts that power the digital world.',
    category: 'digital',
    icon: 'FiCode',
    duration: '30 min', durationMinutes: 30,
    difficulty: 'Beginner', rating: 4.5, lessons: 8, certificate: true,
    tags: ['coding', 'programming', 'technology', 'computer science'],
    videoUrl: 'https://www.youtube.com/embed/nwDq4adJwzM',
    content: 'Coding is the language of the future. Learn the basics of programming logic and syntax.',
    steps: [
      { title: 'What is Programming?', description: 'Understand what coding is and how it powers technology.', duration: '5 min', type: 'video', content: 'https://www.youtube.com/embed/l26oaHV7D40', resources: [] },
      { title: 'Variables & Data Types', description: 'Learn how programs store and manage data.', duration: '5 min', type: 'reading', content: 'Variables are like labeled boxes that store information. Text, numbers, and booleans are basic data types.', resources: [] },
      { title: 'Logic & Conditionals', description: 'Master if/else statements and decision-making in code.', duration: '5 min', type: 'interactive', content: 'If it\'s raining, take an umbrella. Otherwise, wear sunglasses. That\'s conditional logic!', resources: [] },
      { title: 'Coding Challenge Game', description: 'Apply your coding knowledge in an interactive challenge!', duration: '10 min', type: 'game', gameType: 'coding', content: 'Solve coding puzzles and learn programming concepts in this fun game!', resources: [] },
    ],
  },
  {
    title: 'Stress Management & Mental Wellness',
    description: 'Learn effective strategies to manage stress, build resilience, and maintain mental wellness.',
    category: 'mental-health',
    icon: 'FiHeart',
    duration: '20 min', durationMinutes: 20,
    difficulty: 'Beginner', rating: 4.9, lessons: 5, certificate: true,
    tags: ['stress', 'mental health', 'wellness', 'self-care'],
    videoUrl: '',
    content: 'Stress is a normal part of life, but it doesn\'t have to control you. Learn practical techniques to manage stress and build mental resilience.',
    steps: [
      { title: 'Understanding Stress', description: 'Learn what stress is and how it affects your body and mind.', duration: '5 min', type: 'video', content: 'https://www.youtube.com/embed/v-t1Z5-oPtU', resources: ['Stress symptoms checklist'] },
      { title: 'Breathing & Relaxation', description: 'Master breathing exercises and relaxation techniques.', duration: '5 min', type: 'interactive', content: 'Try the 4-7-8 technique: breathe in for 4 seconds, hold for 7, exhale for 8.', resources: ['Guided meditation audio', 'Breathing exercise guide'] },
      { title: 'Building Healthy Habits', description: 'Create daily habits that support mental wellness.', duration: '5 min', type: 'reading', content: 'Sleep 8-10 hours, exercise daily, eat balanced meals, and take breaks from screens.', resources: ['Daily wellness checklist', 'Habit tracker template'] },
      { title: 'Stress Management Game', description: 'Practice stress management techniques in a fun scenario!', duration: '10 min', type: 'game', gameType: 'stress', content: 'Navigate stressful situations and choose the best coping strategies!', resources: [] },
    ],
  },
  {
    title: 'Building Confidence & Self-Esteem',
    description: 'Develop unshakable confidence and a positive self-image. Learn to believe in yourself and your abilities.',
    category: 'mental-health',
    icon: 'FiStar',
    duration: '20 min', durationMinutes: 20,
    difficulty: 'Beginner', rating: 4.8, lessons: 5, certificate: true,
    tags: ['confidence', 'self-esteem', 'self-worth', 'personal growth'],
    videoUrl: '',
    content: 'Confidence isn\'t something you\'re born with — it\'s a skill you can build. Learn to recognize your worth and show up as your authentic self.',
    steps: [
      { title: 'Understanding Self-Esteem', description: 'Learn what self-esteem is and how it shapes your life.', duration: '5 min', type: 'video', content: 'https://www.youtube.com/embed/l_NYrWqUR40', resources: ['Self-esteem reflection worksheet'] },
      { title: 'Positive Self-Talk', description: 'Transform your inner critic into your biggest supporter.', duration: '5 min', type: 'reading', content: 'Notice negative self-talk and replace it with compassionate, realistic statements.', resources: ['Affirmations list', 'Thought journal template'] },
      { title: 'Stepping Out of Your Comfort Zone', description: 'Build confidence by taking small, brave actions.', duration: '5 min', type: 'interactive', content: 'Growth happens at the edge of your comfort zone. Start with small challenges and build up.', resources: ['Comfort zone challenge cards'] },
      { title: 'Confidence Building Game', description: 'Build your confidence through interactive scenarios!', duration: '10 min', type: 'game', gameType: 'confidence', content: 'Face challenging situations and build your confidence muscles!', resources: [] },
    ],
  },
  {
    title: 'Handling Heartbreak & Relationships',
    description: 'Navigate the ups and downs of relationships. Learn to handle heartbreak with grace and build healthy connections.',
    category: 'relationships',
    icon: 'FiUsers',
    duration: '25 min', durationMinutes: 25,
    difficulty: 'Intermediate', rating: 4.7, lessons: 6, certificate: false,
    tags: ['relationships', 'heartbreak', 'friendship', 'emotional intelligence'],
    videoUrl: '',
    content: 'Relationships are beautiful but challenging. Learn to build healthy connections and heal from heartbreak.',
    steps: [
      { title: 'Understanding Relationships', description: 'Learn what makes relationships healthy or unhealthy.', duration: '5 min', type: 'video', content: 'https://www.youtube.com/embed/Gn7ZQ2x0cOE', resources: ['Healthy vs unhealthy relationship checklist'] },
      { title: 'Communication in Relationships', description: 'Master honest and kind communication.', duration: '5 min', type: 'reading', content: 'Use "I feel" statements instead of blaming. Listen to understand, not to respond.', resources: ['Communication guide', 'Conflict resolution steps'] },
      { title: 'Healing from Heartbreak', description: 'Navigate the process of healing after a breakup or loss.', duration: '5 min', type: 'interactive', content: 'It\'s OK to grieve. Give yourself time. Talk to trusted friends. Focus on activities you enjoy.', resources: ['Healing journal prompts', 'Self-care after breakup guide'] },
      { title: 'Relationships Challenge Game', description: 'Navigate relationship scenarios in this interactive game!', duration: '10 min', type: 'game', gameType: 'confidence', content: 'Make healthy choices in various relationship situations!', resources: [] },
    ],
  },
  {
    title: 'Anxiety Management & Coping',
    description: 'Understand anxiety and learn practical coping strategies to find calm and control.',
    category: 'mental-health',
    icon: 'FiWind',
    duration: '20 min', durationMinutes: 20,
    difficulty: 'Beginner', rating: 4.9, lessons: 5, certificate: true,
    tags: ['anxiety', 'mental health', 'coping', 'calm'],
    videoUrl: '',
    content: 'Anxiety is a common experience, but you have more control than you think. Learn evidence-based techniques to manage anxious thoughts and feelings.',
    steps: [
      { title: 'Understanding Anxiety', description: 'Learn what anxiety is and why it happens.', duration: '5 min', type: 'video', content: 'https://www.youtube.com/embed/xsEJ6GeAGb0', resources: ['Anxiety symptoms guide'] },
      { title: 'Grounding Techniques', description: 'Master techniques to return to the present moment.', duration: '5 min', type: 'interactive', content: 'The 5-4-3-2-1 technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.', resources: ['Grounding exercises card', 'Calm-down toolkit'] },
      { title: 'Challenging Anxious Thoughts', description: 'Learn to question and reframe anxious thinking patterns.', duration: '5 min', type: 'reading', content: 'Is this thought true? Is it helpful? What would I tell a friend who thought this? Challenge catastrophic thinking.', resources: ['Thought record worksheet', 'Cognitive reframing guide'] },
      { title: 'Anxiety Management Game', description: 'Practice anxiety management techniques interactively!', duration: '10 min', type: 'game', gameType: 'anxiety', content: 'Learn and practice coping strategies for anxiety in real-world scenarios!', resources: [] },
    ],
  },
  {
    title: 'Decision Making & Life Choices',
    description: 'Develop critical thinking skills and learn to make confident, informed decisions about your future.',
    category: 'life-skills',
    icon: 'FiTrendingUp',
    duration: '20 min', durationMinutes: 20,
    difficulty: 'Intermediate', rating: 4.6, lessons: 5, certificate: true,
    tags: ['decision making', 'critical thinking', 'life choices', 'problem solving'],
    videoUrl: '',
    content: 'Every day you make hundreds of decisions. Learn a framework for making thoughtful choices that align with your values and goals.',
    steps: [
      { title: 'The Decision-Making Process', description: 'Learn a step-by-step framework for making decisions.', duration: '5 min', type: 'video', content: 'https://www.youtube.com/embed/X7j8F16eSqs', resources: ['Decision-making worksheet'] },
      { title: 'Weighing Pros & Cons', description: 'Master the art of evaluating options objectively.', duration: '5 min', type: 'reading', content: 'Write down the pros and cons of each option. Consider short-term AND long-term consequences.', resources: ['Pros and cons template'] },
      { title: 'Trusting Your Intuition', description: 'Learn when to trust your gut and when to analyze.', duration: '5 min', type: 'interactive', content: 'Your intuition is pattern recognition from past experiences. Use it wisely alongside logical analysis.', resources: ['Intuition vs logic guide'] },
      { title: 'Decision Making Game', description: 'Practice making important life decisions in a safe environment!', duration: '10 min', type: 'game', gameType: 'budget', content: 'Navigate important life choices and see the outcomes of your decisions!', resources: [] },
    ],
  },
];

async function seed() {
  await SkillDomain.deleteMany({});
  await Skill.deleteMany({});

  const createdCategories = await SkillDomain.insertMany(categories);
  console.log(`Created ${createdCategories.length} categories`);

  const catMap = {};
  createdCategories.forEach(c => { catMap[c.slug] = c._id; });

  const skillsWithRefs = skills.map(s => ({
    ...s,
    categoryRef: catMap[s.category],
  }));

  const createdSkills = await Skill.insertMany(skillsWithRefs);
  console.log(`Created ${createdSkills.length} skills`);

  console.log('Seed complete!');
}

async function main() {
  try {
    await connectDB();
    await seed();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { seed, connectDB, categories, skills };
