import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Story {
    id: string;
    title: string;
    content: string;
    author: string;
    authorId: string;
    category: string;
    tags: string[];
    rating: number;
    totalRatings: number;
    likes: number;
    views: number;
    comments: number;
    createdAt: string;
    updatedAt: string;
    isVerified: boolean;
    isFeatured: boolean;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    readTime: number;
    image?: string;
    likedBy: string[];
    bookmarkedBy: string[];
    reportedBy: string[];
}

export interface Comment {
    id: string;
    storyId: string;
    author: string;
    authorId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    likes: number;
    isHelpful: boolean;
    likedBy: string[];
    replies: Comment[];
    parentId?: string;
}

export interface StoryRating {
    id: string;
    storyId: string;
    userId: string;
    rating: number;
    review?: string;
    createdAt: string;
}

export interface StoryNotification {
    id: string;
    userId: string;
    type: 'like' | 'comment' | 'rating' | 'bookmark' | 'reply';
    storyId: string;
    storyTitle: string;
    fromUser: string;
    fromUserId: string;
    content?: string;
    createdAt: string;
    isRead: boolean;
}

interface StoriesContextType {
    stories: Story[];
    comments: Comment[];
    ratings: StoryRating[];
    notifications: StoryNotification[];
    bookmarkedStories: string[];
    likedStories: string[];
    userRatings: { [storyId: string]: number };

    // Story actions
    addStory: (story: Omit<Story, 'id' | 'createdAt' | 'updatedAt' | 'likedBy' | 'bookmarkedBy' | 'reportedBy'>) => Promise<string>;
    updateStory: (storyId: string, updates: Partial<Story>) => Promise<void>;
    deleteStory: (storyId: string) => Promise<void>;
    likeStory: (storyId: string) => Promise<void>;
    unlikeStory: (storyId: string) => Promise<void>;
    bookmarkStory: (storyId: string) => Promise<void>;
    unbookmarkStory: (storyId: string) => Promise<void>;
    reportStory: (storyId: string, reason: string) => Promise<void>;
    viewStory: (storyId: string) => Promise<void>;

    // Comment actions
    addComment: (storyId: string, content: string, parentId?: string) => Promise<string>;
    updateComment: (commentId: string, content: string) => Promise<void>;
    deleteComment: (commentId: string) => Promise<void>;
    likeComment: (commentId: string) => Promise<void>;
    unlikeComment: (commentId: string) => Promise<void>;
    markCommentHelpful: (commentId: string) => Promise<void>;

    // Rating actions
    rateStory: (storyId: string, rating: number, review?: string) => Promise<void>;
    updateRating: (storyId: string, rating: number, review?: string) => Promise<void>;
    deleteRating: (storyId: string) => Promise<void>;

    // Utility functions
    getStoryById: (storyId: string) => Story | undefined;
    getCommentsByStoryId: (storyId: string) => Comment[];
    getRatingByUser: (storyId: string, userId: string) => number | undefined;
    getBookmarkedStories: () => Story[];
    getLikedStories: () => Story[];
    getUnreadNotifications: () => StoryNotification[];
    markNotificationRead: (notificationId: string) => Promise<void>;
    markAllNotificationsRead: () => Promise<void>;
}

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

// Sample stories data
const sampleStories: Story[] = [
    {
        id: '1',
        title: 'Learning to Budget: From Student to Financial Freedom',
        content: `When I started college, I had no idea how to manage money. I would spend everything I had on food, entertainment, and impulse purchases. By the end of my first semester, I was broke and stressed.

Then I discovered budgeting. I started tracking every dollar I spent and created categories for my expenses. It wasn't easy at first - I had to say no to many things my friends were doing. But slowly, I began to see the benefits.

I opened a savings account and started putting away $50 from each paycheck. I learned to cook simple meals instead of eating out constantly. I found free activities on campus instead of expensive entertainment.

By my senior year, I had saved over $3,000 and had a clear understanding of my financial situation. This gave me confidence when applying for jobs and planning my future.

The key lessons I learned:
- Track every expense, no matter how small
- Create a realistic budget and stick to it
- Build an emergency fund
- Learn to differentiate between wants and needs
- Start saving early, even if it's just a small amount

Now, two years into my career, I have a solid financial foundation and feel confident about my future. Budgeting isn't about restricting yourself - it's about giving yourself freedom and peace of mind.`,
        author: 'Emily Rodriguez',
        authorId: 'emily123',
        category: 'finance',
        tags: ['Budgeting', 'Money Management', 'Student Life', 'Financial Planning'],
        rating: 4.8,
        totalRatings: 24,
        likes: 156,
        views: 1203,
        comments: 18,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        isVerified: true,
        isFeatured: true,
        difficulty: 'beginner',
        readTime: 4,
        likedBy: [],
        bookmarkedBy: [],
        reportedBy: []
    },
    {
        id: '2',
        title: 'I Overcame My Fear of Public Speaking',
        content: `Public speaking was my biggest fear. I would literally shake, sweat, and forget everything I wanted to say whenever I had to present in front of a class. This fear was holding me back from opportunities and making me feel inadequate.

The turning point came when I was assigned a group project that required each member to present a section. I couldn't avoid it anymore. I decided to face my fear head-on.

Here's what I did to overcome it:

1. **Started Small**: I began by speaking up more in small group discussions and asking questions in class.

2. **Practice, Practice, Practice**: I rehearsed my presentations multiple times, first alone, then in front of friends, then in front of a mirror.

3. **Breathing Techniques**: I learned deep breathing exercises to calm my nerves before speaking.

4. **Positive Visualization**: I imagined myself giving a successful presentation and receiving positive feedback.

5. **Preparation**: I made sure I knew my material inside and out, so even if I got nervous, I could rely on my knowledge.

6. **Accept Imperfection**: I realized that making small mistakes is normal and doesn't ruin a presentation.

The first few times were still nerve-wracking, but each presentation got easier. I started to focus on sharing valuable information rather than on my performance.

Now, I actually enjoy public speaking! I've given presentations at conferences and even led workshops. The confidence I gained from overcoming this fear has helped me in job interviews, networking events, and everyday conversations.

If you're struggling with public speaking anxiety, remember: everyone feels nervous at first. The key is to start small, practice regularly, and be patient with yourself. You have valuable things to say, and the world deserves to hear them.`,
        author: 'Marcus Johnson',
        authorId: 'marcus456',
        category: 'personal',
        tags: ['Confidence', 'Public Speaking', 'Overcoming Fear', 'Personal Growth'],
        rating: 4.6,
        totalRatings: 19,
        likes: 134,
        views: 987,
        comments: 12,
        createdAt: '2024-01-12T14:20:00Z',
        updatedAt: '2024-01-12T14:20:00Z',
        isVerified: true,
        isFeatured: false,
        difficulty: 'intermediate',
        readTime: 5,
        likedBy: [],
        bookmarkedBy: [],
        reportedBy: []
    },
    {
        id: '3',
        title: 'How I Learned to Cook and Saved Money',
        content: `Growing up, I never learned to cook. My family always ordered takeout or ate at restaurants. When I moved to college, I quickly realized how expensive this lifestyle was. I was spending $15-20 per meal, which added up to over $400 per month just on food!

I decided to learn how to cook, and it completely changed my life. Here's my journey:

**Week 1-2: The Basics**
I started with simple recipes like scrambled eggs, pasta with jarred sauce, and grilled cheese sandwiches. I bought basic kitchen tools and learned fundamental techniques.

**Week 3-4: Building Confidence**
I tried more complex recipes like stir-fries, soups, and simple casseroles. I learned about meal prep and started cooking larger portions to have leftovers.

**Month 2: Advanced Techniques**
I learned to make my own sauces, bake bread, and experiment with different cuisines. I discovered that cooking could be creative and fun.

**The Results:**
- Reduced my food expenses from $400/month to $150/month
- Lost 15 pounds by eating healthier, home-cooked meals
- Discovered a new hobby that I genuinely enjoy
- Impressed my friends and family with my cooking skills
- Gained confidence in my ability to take care of myself

**Tips for Beginners:**
1. Start with simple recipes and build your skills gradually
2. Invest in good basic kitchen tools (knife, cutting board, pots, pans)
3. Learn to read recipes properly and follow them exactly at first
4. Don't be afraid to make mistakes - they're part of the learning process
5. Cook in batches and freeze portions for busy days
6. Watch cooking videos and read food blogs for inspiration

Cooking has become one of my favorite activities. It's meditative, creative, and practical. Plus, there's something incredibly satisfying about creating a delicious meal from scratch.`,
        author: 'Sarah Chen',
        authorId: 'sarah789',
        category: 'health',
        tags: ['Cooking', 'Money Saving', 'Healthy Eating', 'Life Skills'],
        rating: 4.7,
        totalRatings: 22,
        likes: 189,
        views: 1456,
        comments: 25,
        createdAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-10T09:15:00Z',
        isVerified: true,
        isFeatured: true,
        difficulty: 'beginner',
        readTime: 6,
        likedBy: [],
        bookmarkedBy: [],
        reportedBy: []
    },
    {
        id: '4',
        title: 'Building My First Professional Network',
        content: `Networking always seemed intimidating to me. I thought it was about being fake or using people for personal gain. But when I graduated and started looking for jobs, I realized how important professional relationships are.

Here's how I built my network from scratch:

**Starting Point**: I had zero professional connections. No family in my field, no mentors, no industry contacts.

**Step 1: LinkedIn Strategy**
I created a professional LinkedIn profile and started connecting with people in my field. I joined relevant groups and participated in discussions. I shared articles and insights about my industry.

**Step 2: Industry Events**
I attended local meetups, conferences, and workshops. At first, I was nervous about approaching strangers, but I learned to ask genuine questions and listen actively.

**Step 3: Informational Interviews**
I reached out to professionals I admired and asked for 15-minute informational interviews. Most people were surprisingly willing to help.

**Step 4: Volunteering**
I volunteered for industry organizations and non-profits. This gave me hands-on experience and introduced me to like-minded professionals.

**Step 5: Maintaining Relationships**
I made sure to follow up with people I met, share relevant articles, and offer help when I could.

**The Results:**
- Built a network of 200+ professionals in my field
- Received 3 job offers through referrals
- Found mentors who guided my career decisions
- Collaborated on projects with other professionals
- Gained confidence in professional settings

**Key Lessons:**
- Networking is about building genuine relationships, not just collecting contacts
- Always offer value before asking for help
- Follow up consistently and meaningfully
- Be patient - relationships take time to develop
- Don't be afraid to reach out to people you admire

Now, I help other young professionals build their networks. It's amazing how one conversation can change your entire career trajectory.`,
        author: 'David Kim',
        authorId: 'david101',
        category: 'career',
        tags: ['Networking', 'Career Development', 'Professional Growth', 'Job Search'],
        rating: 4.5,
        totalRatings: 17,
        likes: 98,
        views: 756,
        comments: 14,
        createdAt: '2024-01-08T16:45:00Z',
        updatedAt: '2024-01-08T16:45:00Z',
        isVerified: true,
        isFeatured: false,
        difficulty: 'intermediate',
        readTime: 5,
        likedBy: [],
        bookmarkedBy: [],
        reportedBy: []
    },
    {
        id: '5',
        title: 'My Journey to Better Time Management',
        content: `I used to be the person who was always late, always stressed, and always feeling behind. I would procrastinate on important tasks and then panic when deadlines approached. My grades suffered, my relationships suffered, and my mental health suffered.

Something had to change. I decided to completely overhaul my approach to time management.

**The Problem:**
- No system for tracking tasks and deadlines
- Constantly distracted by social media and notifications
- Poor sleep schedule affecting my productivity
- No clear priorities or goals

**The Solution - My Time Management System:**

**1. Digital Calendar + Task Management**
I started using Google Calendar for appointments and Todoist for tasks. Everything goes in one of these systems - nothing is left to memory.

**2. Time Blocking**
I block out specific times for different activities: work, study, exercise, social time, and relaxation. This prevents me from overcommitting.

**3. The 2-Minute Rule**
If something takes less than 2 minutes, I do it immediately instead of adding it to my task list.

**4. Weekly Planning**
Every Sunday, I review the past week and plan the upcoming week. I set 3 main priorities for each week.

**5. Digital Detox**
I turn off notifications during work hours and use apps like Forest to stay focused.

**6. Sleep Schedule**
I go to bed and wake up at the same time every day, even on weekends.

**The Results:**
- Improved my GPA from 2.8 to 3.6
- Reduced stress and anxiety significantly
- Have more free time for hobbies and friends
- Feel more confident and in control
- Better work-life balance

**Tips for Better Time Management:**
- Start small - don't try to change everything at once
- Use tools that work for you (digital or analog)
- Be realistic about how long tasks actually take
- Build in buffer time for unexpected events
- Review and adjust your system regularly

Time management isn't about being perfect - it's about being intentional with your time and energy.`,
        author: 'Jessica Martinez',
        authorId: 'jessica202',
        category: 'education',
        tags: ['Time Management', 'Productivity', 'Study Skills', 'Organization'],
        rating: 4.9,
        totalRatings: 31,
        likes: 267,
        views: 1890,
        comments: 28,
        createdAt: '2024-01-05T11:30:00Z',
        updatedAt: '2024-01-05T11:30:00Z',
        isVerified: true,
        isFeatured: true,
        difficulty: 'beginner',
        readTime: 6,
        likedBy: [],
        bookmarkedBy: [],
        reportedBy: []
    },
    // Mental Health & Life Preparation Stories
    {
        id: '6',
        title: 'How I Learned to Manage My Anxiety in College',
        content: `I never thought I would struggle with anxiety. I was always the "strong" friend, the one people came to for advice. But when I started college, everything changed. The pressure of academics, social life, and being away from home for the first time hit me like a wall.

At first, I tried to ignore the symptoms - the racing heart, the constant worry, the difficulty sleeping. I thought I just needed to "toughen up" and push through. But the anxiety only got worse.

The turning point came during finals week of my first semester. I had a panic attack in the library and had to leave. That's when I realized I needed help.

Here's what I learned about managing anxiety:

**1. Recognize the Signs**
- Racing heart and rapid breathing
- Constant worry about things beyond my control
- Difficulty concentrating
- Physical tension and restlessness
- Avoidance of certain situations

**2. Breathing Techniques**
I learned the 4-7-8 breathing technique: inhale for 4 counts, hold for 7, exhale for 8. This became my go-to tool for immediate relief.

**3. Grounding Exercises**
The 5-4-3-2-1 technique helped me stay present: 5 things I can see, 4 I can touch, 3 I can hear, 2 I can smell, 1 I can taste.

**4. Lifestyle Changes**
- Regular exercise (even just walking)
- Consistent sleep schedule
- Limiting caffeine and alcohol
- Eating regular, balanced meals

**5. Cognitive Techniques**
I learned to challenge my anxious thoughts by asking: "Is this thought helpful? Is it realistic? What's the worst that could happen, and how would I cope?"

**6. Building a Support System**
I opened up to close friends and family about my struggles. I also found a counselor on campus who helped me develop coping strategies.

**7. Self-Compassion**
I stopped being so hard on myself. Anxiety isn't a weakness - it's a human experience that many people face.

Today, I still experience anxiety, but I have tools to manage it. I've learned that it's okay to not be okay sometimes. The key is having strategies in place and knowing when to ask for help.

If you're struggling with anxiety, remember: you're not alone, and it's okay to seek help. Start with small steps, be patient with yourself, and know that recovery is possible.`,
        author: 'Sarah Chen',
        authorId: 'sarah789',
        category: 'mental-health',
        tags: ['Anxiety', 'Mental Health', 'College Life', 'Coping Strategies', 'Self-Care'],
        rating: 4.9,
        totalRatings: 31,
        likes: 203,
        views: 1456,
        comments: 25,
        createdAt: '2024-01-20T09:15:00Z',
        updatedAt: '2024-01-20T09:15:00Z',
        isVerified: true,
        isFeatured: true,
        difficulty: 'intermediate',
        readTime: 6,
        likedBy: [],
        bookmarkedBy: [],
        reportedBy: []
    },
    {
        id: '7',
        title: 'Surviving My First Heartbreak: A Teenager\'s Guide to Healing',
        content: `I was 17 when I experienced my first real heartbreak. We had been together for almost two years, and I thought we would be together forever. When he broke up with me, I felt like my world was ending.

The pain was physical - I couldn't eat, couldn't sleep, and felt like I had a constant weight on my chest. I cried for days, questioned my worth, and wondered if I would ever love or be loved again.

Looking back, I wish someone had told me that what I was feeling was completely normal. Here's what I learned about healing from heartbreak:

**The Stages of Heartbreak (and they're all normal):**

1. **Shock and Denial**: "This can't be happening. He'll change his mind."
2. **Anger**: "How could he do this to me? What's wrong with him?"
3. **Bargaining**: "If I just change this about myself, maybe he'll come back."
4. **Depression**: "I'll never find love again. I'm not good enough."
5. **Acceptance**: "This relationship is over, and that's okay."

**What Actually Helped Me Heal:**

**1. Feel Your Feelings**
I stopped trying to "get over it" quickly. I let myself cry, be angry, and feel sad. Suppressing emotions only made them stronger.

**2. Cut Contact (At Least Initially)**
I unfollowed him on social media and deleted his number. This wasn't to be mean - it was to protect my healing process.

**3. Lean on Your Support System**
My friends and family were my lifeline. They listened without judgment and reminded me of my worth when I couldn't see it.

**4. Focus on Yourself**
I rediscovered hobbies I had neglected, started working out, and focused on my goals. I became the person I wanted to be, not the person I thought he wanted.

**5. Learn from the Experience**
I reflected on what I learned about myself, what I want in future relationships, and what red flags I might have missed.

**6. Give It Time**
There's no timeline for healing. Some days were better than others, and that was okay.

**7. Remember Your Worth**
A breakup doesn't define your value. You are worthy of love, respect, and happiness, regardless of one person's decision.

**What I Wish I Had Known:**
- The pain is temporary, even when it feels permanent
- You will love again, and it will be even better
- This experience will make you stronger and wiser
- It's okay to miss someone and still know the breakup was right

Six months later, I was in a much better place. A year later, I was grateful for the experience because it taught me so much about myself and what I truly want in a relationship.

If you're going through a breakup right now, please know that you will get through this. The pain you're feeling is proof that you loved deeply, and that's a beautiful thing. Your heart will heal, and you will love again.`,
        author: 'Maya Patel',
        authorId: 'maya101',
        category: 'relationships',
        tags: ['Heartbreak', 'Relationships', 'Healing', 'Self-Love', 'Teenage Life'],
        rating: 4.7,
        totalRatings: 28,
        likes: 189,
        views: 1234,
        comments: 22,
        createdAt: '2024-01-18T16:45:00Z',
        updatedAt: '2024-01-18T16:45:00Z',
        isVerified: true,
        isFeatured: false,
        difficulty: 'beginner',
        readTime: 5,
        likedBy: [],
        bookmarkedBy: [],
        reportedBy: []
    },
    {
        id: '8',
        title: 'Building Confidence: From Shy Student to Campus Leader',
        content: `I was the kid who never raised their hand in class, who ate lunch alone, and who avoided any situation that required speaking up. My lack of confidence was holding me back from opportunities, friendships, and personal growth.

But I decided I was tired of being invisible. I wanted to be the person who could speak up, take risks, and pursue their dreams. Here's how I transformed my confidence:

**Understanding the Problem:**
My low confidence came from:
- Fear of judgment and rejection
- Perfectionism and fear of failure
- Comparing myself to others
- Negative self-talk
- Avoiding challenges

**The Confidence Building Journey:**

**1. Start Small**
I began by making small changes: saying "good morning" to classmates, asking one question per class, and making eye contact during conversations.

**2. Challenge Negative Thoughts**
I learned to recognize when I was being overly critical of myself and replace negative thoughts with more realistic ones.

**3. Practice Self-Compassion**
I started treating myself like I would treat a good friend - with kindness, understanding, and encouragement.

**4. Set and Achieve Goals**
I set small, achievable goals and celebrated each success. This built evidence that I was capable of more than I thought.

**5. Step Outside My Comfort Zone**
I joined clubs, volunteered for presentations, and took on leadership roles. Each challenge made me stronger.

**6. Learn from Failures**
Instead of seeing failures as proof of inadequacy, I started viewing them as learning opportunities.

**7. Surround Myself with Supportive People**
I distanced myself from people who brought me down and sought out those who believed in me.

**8. Develop Skills**
I focused on improving skills I was interested in, which naturally boosted my confidence in those areas.

**9. Practice Positive Self-Talk**
I started daily affirmations and learned to speak to myself with encouragement rather than criticism.

**10. Help Others**
Volunteering and mentoring others helped me see my own value and capabilities.

**The Results:**
- I became president of the debate club
- I gave a speech at graduation
- I made genuine friendships
- I pursued opportunities I never would have before
- I learned to love and accept myself

**Key Lessons:**
- Confidence is a skill that can be developed
- It's okay to feel scared and do it anyway
- Progress, not perfection, is the goal
- Your worth isn't determined by others' opinions
- Small steps lead to big changes

Building confidence is an ongoing process, not a destination. I still have moments of self-doubt, but now I have tools to work through them. The most important thing I learned is that confidence isn't about being perfect - it's about being comfortable with who you are and believing in your ability to grow and learn.

If you're struggling with confidence, start with one small step today. You are more capable than you think, and you deserve to believe in yourself.`,
        author: 'Alex Thompson',
        authorId: 'alex202',
        category: 'personal',
        tags: ['Confidence', 'Self-Esteem', 'Personal Growth', 'Leadership', 'Overcoming Fear'],
        rating: 4.8,
        totalRatings: 26,
        likes: 167,
        views: 1089,
        comments: 19,
        createdAt: '2024-01-16T11:30:00Z',
        updatedAt: '2024-01-16T11:30:00Z',
        isVerified: true,
        isFeatured: true,
        difficulty: 'intermediate',
        readTime: 6,
        likedBy: [],
        bookmarkedBy: [],
        reportedBy: []
    },
    {
        id: '9',
        title: 'Managing Stress: How I Survived My Most Challenging Semester',
        content: `My junior year of college was the most stressful period of my life. I was taking 18 credits, working part-time, dealing with family issues, and trying to maintain a social life. I felt like I was drowning in responsibilities and expectations.

The stress manifested in physical ways: constant headaches, difficulty sleeping, frequent colds, and emotional breakdowns. I knew something had to change.

Here's how I learned to manage stress effectively:

**Recognizing Stress Symptoms:**
- Physical: headaches, muscle tension, fatigue, sleep problems
- Emotional: irritability, anxiety, depression, mood swings
- Behavioral: overeating, social withdrawal, procrastination
- Cognitive: racing thoughts, difficulty concentrating, forgetfulness

**My Stress Management Toolkit:**

**1. Time Management**
I learned to prioritize tasks using the Eisenhower Matrix:
- Urgent and Important: Do first
- Important but not Urgent: Schedule
- Urgent but not Important: Delegate
- Neither: Eliminate

**2. The Power of "No"**
I learned to say no to commitments that didn't align with my priorities. This was hard but necessary.

**3. Break Tasks into Smaller Steps**
Instead of thinking "I have to write a 20-page paper," I broke it down into: research, outline, write introduction, etc.

**4. Regular Exercise**
Even 20 minutes of walking helped clear my mind and reduce tension.

**5. Mindfulness and Meditation**
I started with just 5 minutes of deep breathing daily. This helped me stay present and reduce anxiety.

**6. Healthy Boundaries**
I set specific times for studying, socializing, and rest. I learned to protect my personal time.

**7. Support System**
I opened up to friends, family, and a counselor about my struggles. Talking about stress helped reduce its power.

**8. Self-Care Rituals**
I created daily self-care routines: morning coffee, evening reading, weekend hikes.

**9. Perspective Shifting**
I learned to ask: "Will this matter in 5 years?" This helped me prioritize what was truly important.

**10. Professional Help**
I sought counseling when stress became overwhelming. There's no shame in asking for help.

**What I Learned:**
- Stress is a normal part of life, but it can be managed
- Prevention is better than cure - build stress management into your daily routine
- It's okay to ask for help and support
- Self-care isn't selfish - it's necessary
- Small changes can have big impacts

**The Results:**
- Better sleep and physical health
- Improved academic performance
- Stronger relationships
- Greater sense of control and confidence
- Better work-life balance

Today, I still face stressful situations, but I have tools to handle them. I've learned that stress management isn't about eliminating stress entirely - it's about building resilience and coping skills.

If you're feeling overwhelmed by stress, start small. Pick one stress management technique and practice it consistently. Remember: you don't have to handle everything alone, and it's okay to prioritize your wellbeing.`,
        author: 'Jordan Kim',
        authorId: 'jordan303',
        category: 'mental-health',
        tags: ['Stress Management', 'Time Management', 'Self-Care', 'College Life', 'Mental Health'],
        rating: 4.6,
        totalRatings: 23,
        likes: 145,
        views: 987,
        comments: 16,
        createdAt: '2024-01-14T13:20:00Z',
        updatedAt: '2024-01-14T13:20:00Z',
        isVerified: true,
        isFeatured: false,
        difficulty: 'beginner',
        readTime: 5,
        likedBy: [],
        bookmarkedBy: [],
        reportedBy: []
    }
];

export const StoriesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [stories, setStories] = useState<Story[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [ratings, setRatings] = useState<StoryRating[]>([]);
    const [notifications, setNotifications] = useState<StoryNotification[]>([]);
    const [bookmarkedStories, setBookmarkedStories] = useState<string[]>([]);
    const [likedStories, setLikedStories] = useState<string[]>([]);
    const [userRatings, setUserRatings] = useState<{ [storyId: string]: number }>({});

    // Load data from localStorage on mount
    useEffect(() => {
        const savedStories = localStorage.getItem('afterbell_stories');
        const savedComments = localStorage.getItem('afterbell_story_comments');
        const savedRatings = localStorage.getItem('afterbell_story_ratings');
        const savedNotifications = localStorage.getItem('afterbell_story_notifications');
        const savedBookmarks = localStorage.getItem('afterbell_story_bookmarks');
        const savedLikes = localStorage.getItem('afterbell_story_likes');
        const savedUserRatings = localStorage.getItem('afterbell_user_ratings');

        if (savedStories) {
            try {
                setStories(JSON.parse(savedStories));
            } catch (error) {
                console.error('Error loading stories:', error);
                // If there's an error loading saved stories, use sample stories
                setStories(sampleStories);
            }
        } else {
            // If no saved stories, use sample stories
            setStories(sampleStories);
        }

        if (savedComments) {
            try {
                setComments(JSON.parse(savedComments));
            } catch (error) {
                console.error('Error loading comments:', error);
            }
        }

        if (savedRatings) {
            try {
                setRatings(JSON.parse(savedRatings));
            } catch (error) {
                console.error('Error loading ratings:', error);
            }
        }

        if (savedNotifications) {
            try {
                setNotifications(JSON.parse(savedNotifications));
            } catch (error) {
                console.error('Error loading notifications:', error);
            }
        }

        if (savedBookmarks) {
            try {
                setBookmarkedStories(JSON.parse(savedBookmarks));
            } catch (error) {
                console.error('Error loading bookmarks:', error);
            }
        }

        if (savedLikes) {
            try {
                setLikedStories(JSON.parse(savedLikes));
            } catch (error) {
                console.error('Error loading likes:', error);
            }
        }

        if (savedUserRatings) {
            try {
                setUserRatings(JSON.parse(savedUserRatings));
            } catch (error) {
                console.error('Error loading user ratings:', error);
            }
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('afterbell_stories', JSON.stringify(stories));
    }, [stories]);

    useEffect(() => {
        localStorage.setItem('afterbell_story_comments', JSON.stringify(comments));
    }, [comments]);

    useEffect(() => {
        localStorage.setItem('afterbell_story_ratings', JSON.stringify(ratings));
    }, [ratings]);

    useEffect(() => {
        localStorage.setItem('afterbell_story_notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('afterbell_story_bookmarks', JSON.stringify(bookmarkedStories));
    }, [bookmarkedStories]);

    useEffect(() => {
        localStorage.setItem('afterbell_story_likes', JSON.stringify(likedStories));
    }, [likedStories]);

    useEffect(() => {
        localStorage.setItem('afterbell_user_ratings', JSON.stringify(userRatings));
    }, [userRatings]);

    // Story actions
    const addStory = async (storyData: Omit<Story, 'id' | 'createdAt' | 'updatedAt' | 'likedBy' | 'bookmarkedBy' | 'reportedBy'>): Promise<string> => {
        const newStory: Story = {
            ...storyData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            likedBy: [],
            bookmarkedBy: [],
            reportedBy: []
        };

        setStories(prev => [newStory, ...prev]);
        return newStory.id;
    };

    const updateStory = async (storyId: string, updates: Partial<Story>): Promise<void> => {
        setStories(prev => prev.map(story =>
            story.id === storyId
                ? { ...story, ...updates, updatedAt: new Date().toISOString() }
                : story
        ));
    };

    const deleteStory = async (storyId: string): Promise<void> => {
        setStories(prev => prev.filter(story => story.id !== storyId));
        setComments(prev => prev.filter(comment => comment.storyId !== storyId));
        setRatings(prev => prev.filter(rating => rating.storyId !== storyId));
        setBookmarkedStories(prev => prev.filter(id => id !== storyId));
        setLikedStories(prev => prev.filter(id => id !== storyId));
    };

    const likeStory = async (storyId: string): Promise<void> => {
        const story = stories.find(s => s.id === storyId);
        if (!story) return;

        const isLiked = likedStories.includes(storyId);

        if (isLiked) {
            // Unlike
            setLikedStories(prev => prev.filter(id => id !== storyId));
            setStories(prev => prev.map(s =>
                s.id === storyId
                    ? { ...s, likes: s.likes - 1, likedBy: s.likedBy.filter(id => id !== 'current-user') }
                    : s
            ));
        } else {
            // Like
            setLikedStories(prev => [...prev, storyId]);
            setStories(prev => prev.map(s =>
                s.id === storyId
                    ? { ...s, likes: s.likes + 1, likedBy: [...s.likedBy, 'current-user'] }
                    : s
            ));

            // Add notification
            const notification: StoryNotification = {
                id: Date.now().toString(),
                userId: story.authorId,
                type: 'like',
                storyId: storyId,
                storyTitle: story.title,
                fromUser: 'Current User',
                fromUserId: 'current-user',
                createdAt: new Date().toISOString(),
                isRead: false
            };
            setNotifications(prev => [notification, ...prev]);
        }
    };

    const unlikeStory = async (storyId: string): Promise<void> => {
        await likeStory(storyId); // Toggle function
    };

    const bookmarkStory = async (storyId: string): Promise<void> => {
        const isBookmarked = bookmarkedStories.includes(storyId);

        if (isBookmarked) {
            setBookmarkedStories(prev => prev.filter(id => id !== storyId));
            setStories(prev => prev.map(s =>
                s.id === storyId
                    ? { ...s, bookmarkedBy: s.bookmarkedBy.filter(id => id !== 'current-user') }
                    : s
            ));
        } else {
            setBookmarkedStories(prev => [...prev, storyId]);
            setStories(prev => prev.map(s =>
                s.id === storyId
                    ? { ...s, bookmarkedBy: [...s.bookmarkedBy, 'current-user'] }
                    : s
            ));

            // Add notification
            const story = stories.find(s => s.id === storyId);
            if (story) {
                const notification: StoryNotification = {
                    id: Date.now().toString(),
                    userId: story.authorId,
                    type: 'bookmark',
                    storyId: storyId,
                    storyTitle: story.title,
                    fromUser: 'Current User',
                    fromUserId: 'current-user',
                    createdAt: new Date().toISOString(),
                    isRead: false
                };
                setNotifications(prev => [notification, ...prev]);
            }
        }
    };

    const unbookmarkStory = async (storyId: string): Promise<void> => {
        await bookmarkStory(storyId); // Toggle function
    };

    const reportStory = async (storyId: string, reason: string): Promise<void> => {
        setStories(prev => prev.map(s =>
            s.id === storyId
                ? { ...s, reportedBy: [...s.reportedBy, 'current-user'] }
                : s
        ));

        // In a real app, this would send a report to moderators
        console.log(`Story ${storyId} reported for: ${reason}`);
    };

    const viewStory = async (storyId: string): Promise<void> => {
        setStories(prev => prev.map(s =>
            s.id === storyId ? { ...s, views: s.views + 1 } : s
        ));
    };

    // Comment actions
    const addComment = async (storyId: string, content: string, parentId?: string): Promise<string> => {
        const newComment: Comment = {
            id: Date.now().toString(),
            storyId,
            author: 'Current User',
            authorId: 'current-user',
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            likes: 0,
            isHelpful: false,
            likedBy: [],
            replies: [],
            parentId
        };

        setComments(prev => [newComment, ...prev]);

        // Update story comment count
        setStories(prev => prev.map(s =>
            s.id === storyId ? { ...s, comments: s.comments + 1 } : s
        ));

        // Add notification
        const story = stories.find(s => s.id === storyId);
        if (story) {
            const notification: StoryNotification = {
                id: Date.now().toString(),
                userId: story.authorId,
                type: parentId ? 'reply' : 'comment',
                storyId: storyId,
                storyTitle: story.title,
                fromUser: 'Current User',
                fromUserId: 'current-user',
                content: content.substring(0, 100),
                createdAt: new Date().toISOString(),
                isRead: false
            };
            setNotifications(prev => [notification, ...prev]);
        }

        return newComment.id;
    };

    const updateComment = async (commentId: string, content: string): Promise<void> => {
        setComments(prev => prev.map(comment =>
            comment.id === commentId
                ? { ...comment, content, updatedAt: new Date().toISOString() }
                : comment
        ));
    };

    const deleteComment = async (commentId: string): Promise<void> => {
        const comment = comments.find(c => c.id === commentId);
        if (!comment) return;

        setComments(prev => prev.filter(c => c.id !== commentId));

        // Update story comment count
        setStories(prev => prev.map(s =>
            s.id === comment.storyId ? { ...s, comments: s.comments - 1 } : s
        ));
    };

    const likeComment = async (commentId: string): Promise<void> => {
        setComments(prev => prev.map(comment =>
            comment.id === commentId
                ? {
                    ...comment,
                    likes: comment.likedBy.includes('current-user') ? comment.likes - 1 : comment.likes + 1,
                    likedBy: comment.likedBy.includes('current-user')
                        ? comment.likedBy.filter(id => id !== 'current-user')
                        : [...comment.likedBy, 'current-user']
                }
                : comment
        ));
    };

    const unlikeComment = async (commentId: string): Promise<void> => {
        await likeComment(commentId); // Toggle function
    };

    const markCommentHelpful = async (commentId: string): Promise<void> => {
        setComments(prev => prev.map(comment =>
            comment.id === commentId
                ? { ...comment, isHelpful: !comment.isHelpful }
                : comment
        ));
    };

    // Rating actions
    const rateStory = async (storyId: string, rating: number, review?: string): Promise<void> => {
        const existingRating = ratings.find(r => r.storyId === storyId && r.userId === 'current-user');

        if (existingRating) {
            await updateRating(storyId, rating, review);
            return;
        }

        const newRating: StoryRating = {
            id: Date.now().toString(),
            storyId,
            userId: 'current-user',
            rating,
            review,
            createdAt: new Date().toISOString()
        };

        setRatings(prev => [newRating, ...prev]);
        setUserRatings(prev => ({ ...prev, [storyId]: rating }));

        // Update story rating
        const story = stories.find(s => s.id === storyId);
        if (story) {
            const newTotalRatings = story.totalRatings + 1;
            const newAverageRating = ((story.rating * story.totalRatings) + rating) / newTotalRatings;

            setStories(prev => prev.map(s =>
                s.id === storyId
                    ? { ...s, rating: newAverageRating, totalRatings: newTotalRatings }
                    : s
            ));

            // Add notification
            const notification: StoryNotification = {
                id: Date.now().toString(),
                userId: story.authorId,
                type: 'rating',
                storyId: storyId,
                storyTitle: story.title,
                fromUser: 'Current User',
                fromUserId: 'current-user',
                content: review || `Rated ${rating} stars`,
                createdAt: new Date().toISOString(),
                isRead: false
            };
            setNotifications(prev => [notification, ...prev]);
        }
    };

    const updateRating = async (storyId: string, rating: number, review?: string): Promise<void> => {
        const existingRating = ratings.find(r => r.storyId === storyId && r.userId === 'current-user');
        if (!existingRating) return;

        const oldRating = existingRating.rating;

        setRatings(prev => prev.map(r =>
            r.id === existingRating.id
                ? { ...r, rating, review, createdAt: new Date().toISOString() }
                : r
        ));
        setUserRatings(prev => ({ ...prev, [storyId]: rating }));

        // Update story rating
        const story = stories.find(s => s.id === storyId);
        if (story) {
            const newAverageRating = ((story.rating * story.totalRatings) - oldRating + rating) / story.totalRatings;
            setStories(prev => prev.map(s =>
                s.id === storyId ? { ...s, rating: newAverageRating } : s
            ));
        }
    };

    const deleteRating = async (storyId: string): Promise<void> => {
        const existingRating = ratings.find(r => r.storyId === storyId && r.userId === 'current-user');
        if (!existingRating) return;

        setRatings(prev => prev.filter(r => r.id !== existingRating.id));
        setUserRatings(prev => {
            const newRatings = { ...prev };
            delete newRatings[storyId];
            return newRatings;
        });

        // Update story rating
        const story = stories.find(s => s.id === storyId);
        if (story && story.totalRatings > 1) {
            const newTotalRatings = story.totalRatings - 1;
            const newAverageRating = ((story.rating * story.totalRatings) - existingRating.rating) / newTotalRatings;

            setStories(prev => prev.map(s =>
                s.id === storyId
                    ? { ...s, rating: newAverageRating, totalRatings: newTotalRatings }
                    : s
            ));
        } else if (story) {
            setStories(prev => prev.map(s =>
                s.id === storyId
                    ? { ...s, rating: 0, totalRatings: 0 }
                    : s
            ));
        }
    };

    // Utility functions
    const getStoryById = (storyId: string): Story | undefined => {
        return stories.find(story => story.id === storyId);
    };

    const getCommentsByStoryId = (storyId: string): Comment[] => {
        return comments.filter(comment => comment.storyId === storyId && !comment.parentId);
    };

    const getRatingByUser = (storyId: string, userId: string): number | undefined => {
        const rating = ratings.find(r => r.storyId === storyId && r.userId === userId);
        return rating ? rating.rating : undefined;
    };

    const getBookmarkedStories = (): Story[] => {
        return stories.filter(story => bookmarkedStories.includes(story.id));
    };

    const getLikedStories = (): Story[] => {
        return stories.filter(story => likedStories.includes(story.id));
    };

    const getUnreadNotifications = (): StoryNotification[] => {
        return notifications.filter(notification => !notification.isRead);
    };

    const markNotificationRead = async (notificationId: string): Promise<void> => {
        setNotifications(prev => prev.map(notification =>
            notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
        ));
    };

    const markAllNotificationsRead = async (): Promise<void> => {
        setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
    };

    const value: StoriesContextType = {
        stories,
        comments,
        ratings,
        notifications,
        bookmarkedStories,
        likedStories,
        userRatings,
        addStory,
        updateStory,
        deleteStory,
        likeStory,
        unlikeStory,
        bookmarkStory,
        unbookmarkStory,
        reportStory,
        viewStory,
        addComment,
        updateComment,
        deleteComment,
        likeComment,
        unlikeComment,
        markCommentHelpful,
        rateStory,
        updateRating,
        deleteRating,
        getStoryById,
        getCommentsByStoryId,
        getRatingByUser,
        getBookmarkedStories,
        getLikedStories,
        getUnreadNotifications,
        markNotificationRead,
        markAllNotificationsRead
    };

    return (
        <StoriesContext.Provider value={value}>
            {children}
        </StoriesContext.Provider>
    );
};

export const useStories = () => {
    const context = useContext(StoriesContext);
    if (context === undefined) {
        throw new Error('useStories must be used within a StoriesProvider');
    }
    return context;
};
