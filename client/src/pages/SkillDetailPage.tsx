import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
import {
    FiArrowLeft,
    FiPlay,
    FiCheckCircle,
    FiTarget,
    FiStar,
    FiClock,
    FiBookOpen,
    FiAward,
    FiBookmark,
    FiShare2,
    FiDownload,
    FiHeart,
    FiChevronRight,
    FiChevronLeft,
    FiPlayCircle,
    FiFileText,
    FiVideo,
    FiUsers,
    FiTrendingUp
} from 'react-icons/fi';
import MiniGame from '../components/MiniGames';

// Enhanced skill data with step-based learning
const skillsData = [
    {
        id: 1,
        title: "How to Create a Budget",
        description: "Master the art of budgeting and take control of your finances. Learn to track income, manage expenses, and build healthy money habits.",
        category: "finance",
        icon: "FiDollarSign",
        duration: "45 min",
        difficulty: "Beginner",
        completed: false,
        bookmarked: false,
        rating: 4.8,
        lessons: 5,
        certificate: true,
        steps: [
            {
                id: 1,
                title: "Understanding Money Basics",
                description: "Learn the fundamentals of personal finance and why budgeting matters",
                duration: "8 min",
                type: "video",
                content: "https://www.youtube.com/embed/-Of_WRjDrx0",
                completed: false,
                resources: [
                    "Income vs Expenses worksheet",
                    "Financial goal setting template",
                    "Money tracking app recommendations"
                ]
            },
            {
                id: 2,
                title: "Budget Master Challenge",
                description: "Test your budgeting knowledge with an interactive quiz game",
                duration: "5 min",
                type: "game",
                gameType: "budget",
                content: "Complete the Budget Master Challenge to test your understanding of budgeting basics!",
                completed: false,
                resources: [
                    "Budget quiz questions",
                    "Score tracking",
                    "Achievement badges"
                ]
            },
            {
                id: 3,
                title: "Tracking Your Income",
                description: "Identify all your income sources and learn to track them effectively",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/95-b1JFSq4M",
                completed: false,
                resources: [
                    "Income tracking spreadsheet",
                    "Side hustle ideas for students",
                    "Allowance management tips"
                ]
            },
            {
                id: 4,
                title: "Categorizing Your Expenses",
                description: "Learn to organize your spending into clear categories",
                duration: "12 min",
                type: "video",
                content: "https://www.youtube.com/embed/yxjZ5aWbfcc",
                completed: false,
                resources: [
                    "Expense category worksheet",
                    "Spending tracker template",
                    "Needs vs Wants guide"
                ]
            },
            {
                id: 5,
                title: "Creating Your First Budget",
                description: "Build your personalized budget using the 50/30/20 rule",
                duration: "10 min",
                type: "interactive",
                content: "Create your budget using our interactive tool. Allocate your income across needs (50%), wants (30%), and savings (20%).",
                completed: false,
                resources: [
                    "Budget calculator tool",
                    "50/30/20 rule worksheet",
                    "Budget template download"
                ]
            },
            {
                id: 6,
                title: "Sticking to Your Budget",
                description: "Learn strategies to maintain your budget and achieve your financial goals",
                duration: "5 min",
                type: "video",
                content: "https://www.youtube.com/embed/-cOjBanoNP0",
                completed: false,
                resources: [
                    "Weekly budget review checklist",
                    "Money-saving tips guide",
                    "Goal achievement tracker"
                ]
            }
        ]
    },
    {
        id: 2,
        title: "Public Speaking Basics",
        description: "Transform from nervous speaker to confident presenter. Master the art of public speaking with proven techniques and practice exercises.",
        category: "communication",
        icon: "FiMessageCircle",
        duration: "60 min",
        difficulty: "Beginner",
        completed: true,
        bookmarked: true,
        rating: 4.9,
        lessons: 6,
        certificate: true,
        steps: [
            {
                id: 1,
                title: "Overcoming Stage Fright",
                description: "Learn techniques to manage nervousness and build confidence",
                duration: "12 min",
                type: "video",
                content: "https://www.youtube.com/embed/i5mYphUoOCs",
                completed: false,
                resources: [
                    "Breathing exercise guide",
                    "Confidence building checklist",
                    "Pre-speech preparation routine"
                ]
            },
            {
                id: 2,
                title: "Confidence Builder Game",
                description: "Practice speaking with confidence through interactive exercises",
                duration: "5 min",
                type: "game",
                gameType: "speaking",
                content: "Build your confidence by practicing common presentation phrases!",
                completed: false,
                resources: [
                    "Speaking practice phrases",
                    "Confidence building exercises",
                    "Progress tracking"
                ]
            },
            {
                id: 3,
                title: "Speech Structure & Organization",
                description: "Learn how to organize your thoughts into a compelling presentation",
                duration: "15 min",
                type: "video",
                content: "https://www.youtube.com/embed/Ns_z4wEtdRM",
                completed: false,
                resources: [
                    "Speech outline template",
                    "Hook and conclusion examples",
                    "Transition phrases guide"
                ]
            },
            {
                id: 4,
                title: "Body Language & Voice",
                description: "Master non-verbal communication and vocal techniques",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/e3FOFu79M3U",
                completed: false,
                resources: [
                    "Body language checklist",
                    "Voice projection exercises",
                    "Gesture practice guide"
                ]
            },
            {
                id: 5,
                title: "Engaging Your Audience",
                description: "Learn to connect with your audience and keep them interested",
                duration: "8 min",
                type: "video",
                content: "https://www.youtube.com/embed/xSp78RwcAS4",
                completed: false,
                resources: [
                    "Audience analysis worksheet",
                    "Interactive presentation ideas",
                    "Q&A handling techniques"
                ]
            },
            {
                id: 6,
                title: "Practice & Rehearsal",
                description: "Develop a practice routine that builds confidence and skill",
                duration: "10 min",
                type: "interactive",
                content: "Practice your speech using our interactive rehearsal tool. Record yourself and get feedback on your delivery.",
                completed: false,
                resources: [
                    "Practice schedule template",
                    "Self-evaluation checklist",
                    "Peer feedback form"
                ]
            },
            {
                id: 7,
                title: "Handling Questions & Challenges",
                description: "Learn to manage Q&A sessions and unexpected situations",
                duration: "5 min",
                type: "video",
                content: "https://www.youtube.com/embed/plLU7RlkMP8",
                completed: false,
                resources: [
                    "Common questions preparation",
                    "Difficult audience scenarios",
                    "Graceful recovery techniques"
                ]
            }
        ]
    },
    {
        id: 3,
        title: "Basic Cooking Skills",
        description: "Master essential cooking techniques and learn to prepare simple, healthy meals. Build confidence in the kitchen!",
        category: "cooking",
        icon: "FiStar",
        duration: "50 min",
        difficulty: "Beginner",
        completed: false,
        bookmarked: false,
        rating: 4.7,
        lessons: 5,
        certificate: true,
        steps: [
            {
                id: 1,
                title: "Kitchen Safety & Setup",
                description: "Learn essential safety rules and how to organize your cooking space",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/G-Fg7l7G1zw",
                completed: false,
                resources: [
                    "Kitchen safety checklist",
                    "Essential cooking tools list",
                    "Workspace organization guide"
                ]
            },
            {
                id: 2,
                title: "Basic Knife Skills",
                description: "Master safe and efficient cutting techniques",
                duration: "15 min",
                type: "video",
                content: "https://www.youtube.com/embed/YrHpeEwk_-U",
                completed: false,
                resources: [
                    "Knife handling safety guide",
                    "Cutting technique practice sheet",
                    "Vegetable prep worksheet"
                ]
            },
            {
                id: 3,
                title: "Recipe Challenge Game",
                description: "Test your cooking knowledge by selecting the right ingredients",
                duration: "5 min",
                type: "game",
                gameType: "cooking",
                content: "Choose the correct ingredients for different recipes and become a recipe master!",
                completed: false,
                resources: [
                    "Recipe ingredient lists",
                    "Cooking knowledge quiz",
                    "Achievement badges"
                ]
            },
            {
                id: 4,
                title: "Cooking Methods",
                description: "Learn fundamental cooking techniques: boiling, frying, and baking",
                duration: "12 min",
                type: "video",
                content: "https://www.youtube.com/embed/30B29xZI9BI",
                completed: false,
                resources: [
                    "Cooking methods comparison chart",
                    "Temperature guide for different foods",
                    "Timing reference sheet"
                ]
            },
            {
                id: 5,
                title: "Your First Recipe",
                description: "Cook a simple pasta dish from start to finish",
                duration: "8 min",
                type: "interactive",
                content: "Follow along with our step-by-step pasta recipe. Learn to boil pasta, make a simple sauce, and combine everything perfectly.",
                completed: false,
                resources: [
                    "Simple pasta recipe card",
                    "Cooking timer app",
                    "Taste testing guide"
                ]
            },
            {
                id: 6,
                title: "Meal Planning Basics",
                description: "Learn to plan simple, balanced meals for the week",
                duration: "5 min",
                type: "video",
                content: "https://www.youtube.com/embed/-al-bs737fw",
                completed: false,
                resources: [
                    "Weekly meal planning template",
                    "Grocery shopping list",
                    "Leftover storage guide"
                ]
            }
        ]
    },
    {
        id: 4,
        title: "Digital Photography",
        description: "Take stunning photos with any camera. Master composition, lighting, and basic editing to create professional-looking images.",
        category: "art",
        icon: "FiBookOpen",
        duration: "75 min",
        difficulty: "Intermediate",
        completed: false,
        bookmarked: true,
        rating: 4.6,
        lessons: 6,
        certificate: true,
        steps: [
            {
                id: 1,
                title: "Understanding Your Camera",
                description: "Learn the basics of camera settings and modes",
                duration: "15 min",
                type: "video",
                content: "https://www.youtube.com/embed/?list=PLyBjgg0NvOrMAVzsniVBCRBaZ0wAWORow",
                completed: false,
                resources: [
                    "Camera settings cheat sheet",
                    "Phone vs DSLR comparison",
                    "Essential photography apps"
                ]
            },
            {
                id: 2,
                title: "Composition Rules",
                description: "Master the rule of thirds and other composition techniques",
                duration: "12 min",
                type: "video",
                content: "https://www.youtube.com/embed/?list=PLBE338967F8DB7F2A",
                completed: false,
                resources: [
                    "Composition rules guide",
                    "Grid overlay templates",
                    "Practice exercise worksheets"
                ]
            },
            {
                id: 3,
                title: "Lighting Fundamentals",
                description: "Understand natural and artificial lighting for better photos",
                duration: "18 min",
                type: "video",
                content: "https://www.youtube.com/embed/?list=PLNOd0dfnA4SXPqk8uOSMKEEhkBkaxd9fP",
                completed: false,
                resources: [
                    "Lighting conditions guide",
                    "Golden hour calculator",
                    "Reflector DIY instructions"
                ]
            },
            {
                id: 4,
                title: "Portrait Photography",
                description: "Learn to take flattering portraits of people",
                duration: "15 min",
                type: "video",
                content: "https://www.youtube.com/embed/?list=PL2FsS8NtBTy4-qnbEV1-pwfj8sHo5te5w",
                completed: false,
                resources: [
                    "Portrait posing guide",
                    "Background selection tips",
                    "Portrait lighting setups"
                ]
            },
            {
                id: 5,
                title: "Basic Photo Editing",
                description: "Enhance your photos with simple editing techniques",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/?list=PL6ACMBw4cmSAsNs2YNsEJQNTBgSThh6er",
                completed: false,
                resources: [
                    "Free editing software list",
                    "Basic editing workflow",
                    "Before/after comparison tool"
                ]
            },
            {
                id: 6,
                title: "Building Your Portfolio",
                description: "Organize and showcase your best work",
                duration: "5 min",
                type: "interactive",
                content: "Create your first photography portfolio. Learn to select your best shots and present them professionally.",
                completed: false,
                resources: [
                    "Portfolio template",
                    "Photo selection criteria",
                    "Online portfolio platforms"
                ]
            }
        ]
    },
    {
        id: 5,
        title: "Social Media Safety",
        description: "Navigate the digital world safely. Learn to protect your privacy, recognize scams, and build a positive online presence.",
        category: "digital",
        icon: "FiMonitor",
        duration: "40 min",
        difficulty: "Beginner",
        completed: true,
        bookmarked: false,
        rating: 4.9,
        lessons: 4,
        certificate: true,
        steps: [
            {
                id: 1,
                title: "Privacy Settings Mastery",
                description: "Learn to control who sees your information and posts",
                duration: "12 min",
                type: "video",
                content: "https://www.youtube.com/embed/tpiMROF4FUY",
                completed: false,
                resources: [
                    "Platform privacy checklists",
                    "Location sharing safety guide",
                    "Data sharing audit worksheet"
                ]
            },
            {
                id: 2,
                title: "Recognizing Online Scams",
                description: "Identify and avoid common online scams and phishing attempts",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/tpiMROF4FUY",
                completed: false,
                resources: [
                    "Scam red flags checklist",
                    "Phishing email examples",
                    "Reporting tools guide"
                ]
            },
            {
                id: 3,
                title: "Digital Footprint Management",
                description: "Understand and control your online reputation",
                duration: "8 min",
                type: "video",
                content: "https://www.youtube.com/embed/tpiMROF4FUY",
                completed: false,
                resources: [
                    "Digital footprint audit",
                    "Online reputation monitoring",
                    "Content posting guidelines"
                ]
            },
            {
                id: 4,
                title: "Safe Social Media Practices",
                description: "Develop healthy social media habits and boundaries",
                duration: "10 min",
                type: "interactive",
                content: "Create your personal social media safety plan. Set boundaries, establish posting guidelines, and learn when to take breaks.",
                completed: false,
                resources: [
                    "Social media safety plan template",
                    "Screen time tracking tools",
                    "Digital wellness checklist"
                ]
            }
        ]
    },
    {
        id: 6,
        title: "Creative Writing",
        description: "Unleash your creativity and develop your unique writing voice. Master storytelling techniques and overcome writer's block.",
        category: "art",
        icon: "FiBookOpen",
        duration: "55 min",
        difficulty: "Intermediate",
        completed: false,
        bookmarked: false,
        rating: 4.5,
        lessons: 5,
        certificate: true,
        steps: [
            {
                id: 1,
                title: "Finding Your Voice",
                description: "Discover your unique writing style and overcome writer's block",
                duration: "12 min",
                type: "video",
                content: "https://www.youtube.com/embed/T351Fgh27sA",
                completed: false,
                resources: [
                    "Voice development exercises",
                    "Writer's block solutions",
                    "Daily writing prompts"
                ]
            },
            {
                id: 2,
                title: "Character Development",
                description: "Create compelling, believable characters that readers will love",
                duration: "15 min",
                type: "video",
                content: "https://www.youtube.com/embed/53-G7VqmN74",
                completed: false,
                resources: [
                    "Character profile template",
                    "Character motivation worksheet",
                    "Dialogue writing guide"
                ]
            },
            {
                id: 3,
                title: "Plot Structure & Storytelling",
                description: "Learn to structure engaging stories with compelling plots",
                duration: "13 min",
                type: "video",
                content: "https://www.youtube.com/embed/8PhBepNWxGc",
                completed: false,
                resources: [
                    "Story structure templates",
                    "Plot development worksheet",
                    "Conflict creation guide"
                ]
            },
            {
                id: 4,
                title: "Writing Techniques",
                description: "Master 'show don't tell' and other essential writing techniques",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/t9omLgZs9w4",
                completed: false,
                resources: [
                    "Show vs tell examples",
                    "Sensory writing exercises",
                    "Editing checklist"
                ]
            },
            {
                id: 5,
                title: "Your First Short Story",
                description: "Write and revise your first complete short story",
                duration: "5 min",
                type: "interactive",
                content: "Apply everything you've learned to write your first short story. Use our guided writing process and get feedback on your work.",
                completed: false,
                resources: [
                    "Short story template",
                    "Peer review guidelines",
                    "Publishing options guide"
                ]
            }
        ]
    },
    {
        id: 7,
        title: "Time Management",
        description: "Master productivity and achieve your goals. Learn proven techniques to organize your time and eliminate procrastination.",
        category: "communication",
        icon: "FiClock",
        duration: "45 min",
        difficulty: "Beginner",
        completed: false,
        bookmarked: true,
        rating: 4.8,
        lessons: 5,
        certificate: true,
        steps: [
            {
                id: 1,
                title: "Understanding Time & Priorities",
                description: "Learn to identify what's truly important and urgent",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/PJOH-vhn3NE",
                completed: false,
                resources: [
                    "Priority matrix worksheet",
                    "Time audit template",
                    "Goal setting framework"
                ]
            },
            {
                id: 2,
                title: "Planning & Scheduling",
                description: "Master the art of effective planning and time blocking",
                duration: "12 min",
                type: "video",
                content: "https://www.youtube.com/embed/tpB3BMlNrno",
                completed: false,
                resources: [
                    "Weekly planning template",
                    "Time blocking guide",
                    "Calendar management tips"
                ]
            },
            {
                id: 3,
                title: "Overcoming Procrastination",
                description: "Learn proven strategies to stop delaying and start doing",
                duration: "8 min",
                type: "video",
                content: "https://www.youtube.com/embed/8x6InFh0BzM",
                completed: false,
                resources: [
                    "Procrastination triggers worksheet",
                    "2-minute rule guide",
                    "Motivation techniques"
                ]
            },
            {
                id: 4,
                title: "Productivity Systems",
                description: "Implement systems that work for your lifestyle",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/1SczF1xfg5I",
                completed: false,
                resources: [
                    "Productivity system comparison",
                    "Habit tracking template",
                    "Energy management guide"
                ]
            },
            {
                id: 5,
                title: "Building Your System",
                description: "Create a personalized time management system",
                duration: "5 min",
                type: "interactive",
                content: "Design your own time management system. Choose the tools and techniques that work best for your schedule and goals.",
                completed: false,
                resources: [
                    "System design worksheet",
                    "Tool recommendations",
                    "Implementation timeline"
                ]
            }
        ]
    },
    {
        id: 8,
        title: "Basic Coding",
        description: "Start your programming journey with HTML and CSS. Build your first website and understand how the web works.",
        category: "digital",
        icon: "FiMonitor",
        duration: "90 min",
        difficulty: "Intermediate",
        completed: false,
        bookmarked: false,
        rating: 4.7,
        lessons: 6,
        certificate: true,
        steps: [
            {
                id: 1,
                title: "Understanding the Web",
                description: "Learn how websites work and the role of HTML and CSS",
                duration: "15 min",
                type: "video",
                content: "https://www.youtube.com/embed/qz0aGYrrlhU",
                completed: false,
                resources: [
                    "Web architecture diagram",
                    "Browser developer tools guide",
                    "HTML/CSS reference sheet"
                ]
            },
            {
                id: 2,
                title: "HTML Fundamentals",
                description: "Master the building blocks of web pages",
                duration: "20 min",
                type: "video",
                content: "https://www.youtube.com/embed/ZGAU7bLxO1I",
                completed: false,
                resources: [
                    "HTML tag reference",
                    "Semantic HTML guide",
                    "Practice exercises"
                ]
            },
            {
                id: 3,
                title: "CSS Styling Basics",
                description: "Learn to make your web pages look beautiful",
                duration: "25 min",
                type: "video",
                content: "https://www.youtube.com/embed/G3e-cpL7ofc",
                completed: false,
                resources: [
                    "CSS property reference",
                    "Color palette tools",
                    "Layout practice exercises"
                ]
            },
            {
                id: 4,
                title: "Responsive Design",
                description: "Make your websites work on all devices",
                duration: "15 min",
                type: "video",
                content: "https://www.youtube.com/embed/hu-q2zYwEYs",
                completed: false,
                resources: [
                    "Media queries guide",
                    "Flexbox cheat sheet",
                    "Mobile-first design principles"
                ]
            },
            {
                id: 5,
                title: "Your First Website",
                description: "Build a complete website from scratch",
                duration: "10 min",
                type: "interactive",
                content: "Create your first website using HTML and CSS. Follow our step-by-step tutorial to build a personal portfolio page.",
                completed: false,
                resources: [
                    "Website template",
                    "Code editor setup guide",
                    "Hosting options comparison"
                ]
            },
            {
                id: 6,
                title: "Next Steps in Coding",
                description: "Explore advanced topics and programming languages",
                duration: "5 min",
                type: "video",
                content: "https://www.youtube.com/embed/7Zct6QfJhKY",
                completed: false,
                resources: [
                    "Programming language comparison",
                    "Learning path recommendations",
                    "Coding community resources"
                ]
            }
        ]
    },
    // Mental Health & Life Preparation Skills
    {
        id: 9,
        title: "Stress Management & Mental Wellness",
        description: "Learn essential techniques to manage stress, build resilience, and maintain mental wellness during challenging times.",
        category: "mental-health",
        icon: "FiHeart",
        duration: "60 min",
        difficulty: "Beginner",
        completed: false,
        bookmarked: false,
        rating: 4.9,
        lessons: 6,
        certificate: true,
        steps: [
            {
                id: 1,
                title: "Understanding Stress & Its Impact",
                description: "Learn what stress is, how it affects your body and mind, and why managing it is crucial for your wellbeing",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/4vGcH0Bk3hg",
                completed: false,
                resources: [
                    "Stress symptoms checklist",
                    "Stress diary template",
                    "Understanding fight-or-flight response"
                ]
            },
            {
                id: 2,
                title: "Breathing & Relaxation Techniques",
                description: "Master simple breathing exercises and relaxation techniques you can use anywhere, anytime",
                duration: "15 min",
                type: "interactive",
                content: "Practice guided breathing exercises, progressive muscle relaxation, and mindfulness techniques. Learn the 4-7-8 breathing method and box breathing for instant stress relief.",
                completed: false,
                resources: [
                    "Breathing exercise audio guides",
                    "Relaxation technique cards",
                    "Quick stress relief toolkit"
                ]
            },
            {
                id: 3,
                title: "Building Emotional Resilience",
                description: "Develop the mental strength to bounce back from setbacks and challenges",
                duration: "12 min",
                type: "video",
                content: "https://www.youtube.com/embed/4vGcH0Bk3hg",
                completed: false,
                resources: [
                    "Resilience building worksheet",
                    "Positive self-talk examples",
                    "Growth mindset exercises"
                ]
            },
            {
                id: 4,
                title: "Time Management for Mental Health",
                description: "Learn to balance responsibilities while protecting your mental wellbeing",
                duration: "8 min",
                type: "video",
                content: "https://www.youtube.com/embed/4vGcH0Bk3hg",
                completed: false,
                resources: [
                    "Healthy schedule template",
                    "Boundary setting guide",
                    "Self-care planning worksheet"
                ]
            },
            {
                id: 5,
                title: "Stress Management Game",
                description: "Practice stress management techniques through interactive scenarios",
                duration: "10 min",
                type: "game",
                gameType: "stress",
                completed: false,
                resources: [
                    "Stress scenario cards",
                    "Coping strategy toolkit",
                    "Progress tracking sheet"
                ]
            },
            {
                id: 6,
                title: "Creating Your Wellness Plan",
                description: "Develop a personalized plan for maintaining mental wellness",
                duration: "5 min",
                type: "interactive",
                content: "Create your personal mental wellness plan including daily self-care routines, stress warning signs, and emergency coping strategies.",
                completed: false,
                resources: [
                    "Wellness plan template",
                    "Self-care activity ideas",
                    "Emergency contact list"
                ]
            }
        ]
    },
    {
        id: 10,
        title: "Building Confidence & Self-Esteem",
        description: "Develop unshakeable confidence and healthy self-esteem. Learn to overcome self-doubt and embrace your unique strengths.",
        category: "mental-health",
        icon: "FiTarget",
        duration: "50 min",
        difficulty: "Beginner",
        completed: false,
        bookmarked: false,
        rating: 4.7,
        lessons: 5,
        certificate: true,
        steps: [
            {
                id: 1,
                title: "Understanding Self-Esteem",
                description: "Learn what self-esteem really means and how it affects every aspect of your life",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/4vGcH0Bk3hg",
                completed: false,
                resources: [
                    "Self-esteem assessment",
                    "Common self-esteem myths",
                    "Healthy vs unhealthy self-esteem"
                ]
            },
            {
                id: 2,
                title: "Identifying Your Strengths",
                description: "Discover and celebrate your unique talents, skills, and positive qualities",
                duration: "12 min",
                type: "interactive",
                content: "Complete strength identification exercises, create a personal strengths inventory, and learn to reframe perceived weaknesses as growth opportunities.",
                completed: false,
                resources: [
                    "Strengths identification worksheet",
                    "Personal values assessment",
                    "Achievement celebration tracker"
                ]
            },
            {
                id: 3,
                title: "Overcoming Self-Doubt",
                description: "Learn practical strategies to silence your inner critic and build self-confidence",
                duration: "15 min",
                type: "video",
                content: "https://www.youtube.com/embed/4vGcH0Bk3hg",
                completed: false,
                resources: [
                    "Self-doubt challenge exercises",
                    "Positive affirmation toolkit",
                    "Confidence building activities"
                ]
            },
            {
                id: 4,
                title: "Confidence Building Game",
                description: "Practice confidence-building techniques through interactive scenarios",
                duration: "8 min",
                type: "game",
                gameType: "confidence",
                completed: false,
                resources: [
                    "Confidence scenario practice",
                    "Body language improvement guide",
                    "Public speaking confidence tips"
                ]
            },
            {
                id: 5,
                title: "Maintaining Healthy Self-Esteem",
                description: "Learn daily practices to maintain and protect your self-esteem",
                duration: "5 min",
                type: "interactive",
                content: "Develop daily self-esteem maintenance routines, learn to set healthy boundaries, and create a support system for ongoing confidence building.",
                completed: false,
                resources: [
                    "Daily confidence checklist",
                    "Boundary setting worksheet",
                    "Support system planning guide"
                ]
            }
        ]
    },
    {
        id: 11,
        title: "Handling Heartbreak & Relationships",
        description: "Navigate the emotional challenges of breakups, friendships, and relationships with grace and resilience.",
        category: "relationships",
        icon: "FiHeart",
        duration: "45 min",
        difficulty: "Beginner",
        completed: false,
        bookmarked: false,
        rating: 4.8,
        lessons: 5,
        certificate: true,
        steps: [
            {
                id: 1,
                title: "Understanding Grief & Loss",
                description: "Learn about the emotional process of heartbreak and how to honor your feelings",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/4vGcH0Bk3hg",
                completed: false,
                resources: [
                    "Grief stages guide",
                    "Emotional processing journal",
                    "Healing timeline template"
                ]
            },
            {
                id: 2,
                title: "Healthy Coping Strategies",
                description: "Discover constructive ways to process emotions and move forward",
                duration: "12 min",
                type: "interactive",
                content: "Learn healthy coping mechanisms, create a healing toolkit, and develop emotional processing skills for dealing with relationship endings.",
                completed: false,
                resources: [
                    "Coping strategy menu",
                    "Emotional regulation techniques",
                    "Self-care during heartbreak guide"
                ]
            },
            {
                id: 3,
                title: "Building Healthy Relationships",
                description: "Learn the foundations of healthy relationships and red flags to watch for",
                duration: "15 min",
                type: "video",
                content: "https://www.youtube.com/embed/4vGcH0Bk3hg",
                completed: false,
                resources: [
                    "Healthy relationship checklist",
                    "Communication skills guide",
                    "Boundary setting in relationships"
                ]
            },
            {
                id: 4,
                title: "Friendship & Social Skills",
                description: "Develop skills for maintaining healthy friendships and social connections",
                duration: "8 min",
                type: "video",
                content: "https://www.youtube.com/embed/4vGcH0Bk3hg",
                completed: false,
                resources: [
                    "Friendship maintenance tips",
                    "Social skills practice exercises",
                    "Conflict resolution in friendships"
                ]
            },
            {
                id: 5,
                title: "Moving Forward with Hope",
                description: "Learn to embrace new beginnings and build hope for future relationships",
                duration: "10 min",
                type: "interactive",
                content: "Create a vision for healthy future relationships, develop self-love practices, and learn to trust again while protecting your heart.",
                completed: false,
                resources: [
                    "Future relationship vision board",
                    "Self-love daily practices",
                    "Trust rebuilding exercises"
                ]
            }
        ]
    },
    {
        id: 12,
        title: "Anxiety Management & Coping",
        description: "Learn practical techniques to manage anxiety, panic attacks, and overwhelming emotions in daily life.",
        category: "mental-health",
        icon: "FiShield",
        duration: "55 min",
        difficulty: "Beginner",
        completed: false,
        bookmarked: false,
        rating: 4.9,
        lessons: 6,
        certificate: true,
        steps: [
            {
                id: 1,
                title: "Understanding Anxiety",
                description: "Learn what anxiety is, its common symptoms, and when it becomes a concern",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/4vGcH0Bk3hg",
                completed: false,
                resources: [
                    "Anxiety symptoms checklist",
                    "Anxiety vs normal worry guide",
                    "When to seek professional help"
                ]
            },
            {
                id: 2,
                title: "Grounding Techniques",
                description: "Master immediate techniques to calm anxiety and panic attacks",
                duration: "12 min",
                type: "interactive",
                content: "Learn the 5-4-3-2-1 grounding technique, box breathing, and other immediate anxiety relief methods you can use anywhere.",
                completed: false,
                resources: [
                    "Grounding technique cards",
                    "Anxiety relief toolkit",
                    "Quick calm strategies"
                ]
            },
            {
                id: 3,
                title: "Cognitive Behavioral Techniques",
                description: "Learn to identify and challenge anxious thoughts and beliefs",
                duration: "15 min",
                type: "video",
                content: "https://www.youtube.com/embed/4vGcH0Bk3hg",
                completed: false,
                resources: [
                    "Thought challenging worksheet",
                    "Cognitive distortion guide",
                    "Anxiety thought record"
                ]
            },
            {
                id: 4,
                title: "Lifestyle Changes for Anxiety",
                description: "Discover how sleep, exercise, and nutrition affect anxiety levels",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/4vGcH0Bk3hg",
                completed: false,
                resources: [
                    "Anxiety-friendly lifestyle guide",
                    "Sleep hygiene checklist",
                    "Exercise for anxiety relief"
                ]
            },
            {
                id: 5,
                title: "Anxiety Management Game",
                description: "Practice anxiety management techniques through interactive scenarios",
                duration: "8 min",
                type: "game",
                gameType: "anxiety",
                completed: false,
                resources: [
                    "Anxiety scenario practice",
                    "Coping strategy selection",
                    "Progress tracking sheet"
                ]
            },
            {
                id: 6,
                title: "Building Long-term Resilience",
                description: "Develop ongoing strategies to prevent and manage anxiety",
                duration: "10 min",
                type: "interactive",
                content: "Create a personalized anxiety management plan, build a support network, and develop long-term coping strategies.",
                completed: false,
                resources: [
                    "Anxiety management plan template",
                    "Support network worksheet",
                    "Long-term coping strategies"
                ]
            }
        ]
    },
    {
        id: 13,
        title: "Decision Making & Life Choices",
        description: "Develop critical thinking skills and learn to make confident decisions about your future and daily life.",
        category: "life-skills",
        icon: "FiNavigation",
        duration: "40 min",
        difficulty: "Beginner",
        completed: false,
        bookmarked: false,
        rating: 4.6,
        lessons: 4,
        certificate: true,
        steps: [
            {
                id: 1,
                title: "Understanding Decision Making",
                description: "Learn about different types of decisions and the decision-making process",
                duration: "10 min",
                type: "video",
                content: "https://www.youtube.com/embed/4vGcH0Bk3hg",
                completed: false,
                resources: [
                    "Decision types guide",
                    "Decision-making process map",
                    "Common decision-making biases"
                ]
            },
            {
                id: 2,
                title: "The PROS and CONS Method",
                description: "Master a systematic approach to weighing options and making informed choices",
                duration: "12 min",
                type: "interactive",
                content: "Learn to use the PROS and CONS method, create decision matrices, and practice with real-life scenarios like choosing colleges or career paths.",
                completed: false,
                resources: [
                    "PROS and CONS worksheet",
                    "Decision matrix template",
                    "Scenario practice exercises"
                ]
            },
            {
                id: 3,
                title: "Values-Based Decision Making",
                description: "Learn to make decisions aligned with your core values and long-term goals",
                duration: "15 min",
                type: "video",
                content: "https://www.youtube.com/embed/4vGcH0Bk3hg",
                completed: false,
                resources: [
                    "Values identification exercise",
                    "Values-based decision framework",
                    "Goal alignment worksheet"
                ]
            },
            {
                id: 4,
                title: "Handling Regret & Moving Forward",
                description: "Learn to accept decisions, learn from mistakes, and move forward with confidence",
                duration: "8 min",
                type: "interactive",
                content: "Develop skills for accepting decisions, learning from outcomes, and building confidence in your decision-making abilities.",
                completed: false,
                resources: [
                    "Decision reflection journal",
                    "Learning from outcomes guide",
                    "Confidence building exercises"
                ]
            }
        ]
    }
];

const SkillDetailPage: React.FC = () => {
    const { skillId } = useParams<{ skillId: string }>();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [gameScores, setGameScores] = useState<{ [key: number]: { score: number, time: number } }>({});
    const [showSteps, setShowSteps] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);

    const {
        isSkillCompleted,
        isSkillBookmarked,
        bookmarkSkill,
        unbookmarkSkill,
        completeSkill,
        getSkillProgress,
        addActivity
    } = useUserData();

    // Find the skill data
    const skill = skillsData.find(s => s.id === parseInt(skillId || '0'));

    // Load existing progress when skill changes
    useEffect(() => {
        if (skillId) {
            const progress = getSkillProgress(skillId);
            setCompletedSteps(Array.from({ length: progress.completed }, (_, i) => i));
        }
    }, [skillId, getSkillProgress]);

    // Ensure page starts at the top when component mounts or skillId changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [skillId]);

    // Track time spent on skill
    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000); // Update every second

        return () => {
            clearInterval(interval);
            // Save time spent when leaving the page
            const totalTime = Math.floor((Date.now() - startTime) / 1000);
            if (totalTime > 0 && skillId) {
                // You could save this to localStorage or send to backend
                localStorage.setItem(`time_${skillId}`, totalTime.toString());
            }
        };
    }, [skillId]);

    // Also scroll to top when switching between overview and steps
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [showSteps]);

    // Calculate progress
    const progressPercentage = skill ? (completedSteps.length / skill.steps.length) * 100 : 0;

    if (!skill) {
        return (
            <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Skill Not Found</h1>
                    <button
                        onClick={() => navigate('/skills')}
                        className="bg-secondary-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-500 transition-colors duration-300"
                    >
                        Back to Skills
                    </button>
                </div>
            </div>
        );
    }

    const handleComplete = () => {
        if (!skillId || !skill) return;

        const totalSteps = skill.steps.length;
        const allStepsCompleted = completedSteps.length === totalSteps;

        if (allStepsCompleted) {
            // Mark skill as completed
            completeSkill(skillId, completedSteps, timeSpent, undefined, skill.title);
            addActivity('Completed', skill.title, skillId);
        }
    };

    const handleBookmark = () => {
        if (!skillId) return;

        if (isSkillBookmarked(skillId)) {
            unbookmarkSkill(skillId);
        } else {
            bookmarkSkill(skillId);
        }
    };

    const handleStepComplete = (stepId: number) => {
        if (completedSteps.includes(stepId)) {
            setCompletedSteps(prev => prev.filter(id => id !== stepId));
        } else {
            setCompletedSteps(prev => [...prev, stepId]);
        }
    };

    const nextStep = () => {
        if (skill && currentStep < skill.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleGameComplete = (score: number, time: number) => {
        setGameScores(prev => ({
            ...prev,
            [currentStep]: { score, time }
        }));
        // Mark the current step as completed
        handleStepComplete(skill?.steps[currentStep]?.id || 0);
        // Move to next step
        if (skill && currentStep < skill.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleGameSkip = () => {
        // Mark the current step as completed even if skipped
        handleStepComplete(skill?.steps[currentStep]?.id || 0);
        // Move to next step
        if (skill && currentStep < skill.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const getGameType = (): 'budget' | 'speaking' | 'cooking' | 'photography' | 'safety' | 'writing' | 'time' | 'coding' => {
        if (!skill) return 'budget';
        switch (skill.category) {
            case 'finance': return 'budget';
            case 'communication': return 'speaking';
            case 'cooking': return 'cooking';
            case 'art': return 'photography';
            case 'digital': return 'coding';
            default: return 'budget';
        }
    };

    return (
        <div className="min-h-screen bg-[#0D1117] relative overflow-hidden">
            {/* Video Background */}
            <video
                autoPlay loop muted playsInline
                className="fixed inset-0 w-full h-full object-cover opacity-20 z-0"
            >
                <source src="/Afterbell-bg.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Background overlay */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 z-0" />

            {/* Main Content */}
            <div className="relative z-10 pt-20">
                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <motion.button
                        onClick={() => navigate('/skills')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-300 mb-8"
                        whileHover={{ x: -4 }}
                    >
                        <FiArrowLeft className="w-5 h-5" />
                        <span>Back to Skills</span>
                    </motion.button>

                    {/* Skill Header */}
                    <motion.div
                        className="bg-slate-800/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-700/50 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Side - Progress & Info */}
                            <div className="lg:w-1/3">
                                <div className="mb-6">
                                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">{skill.title}</h1>
                                    <div className="flex items-center gap-4 text-slate-400 mb-4">
                                        <span className="flex items-center gap-1">
                                            <FiClock className="w-4 h-4" />
                                            {skill.duration}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                            {skill.rating}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FiBookOpen className="w-4 h-4" />
                                            {skill.lessons} lessons
                                        </span>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed mb-6">{skill.description}</p>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-300">Course Progress</span>
                                        <span className="text-sm text-slate-400">{Math.round(progressPercentage)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <motion.div
                                            className="bg-gradient-to-r from-secondary-green to-emerald-500 h-2 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercentage}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {completedSteps.length} of {skill.steps.length} steps completed
                                    </p>
                                </div>

                                {/* Game Scores */}
                                {Object.keys(gameScores).length > 0 && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiAward className="w-4 h-4 text-yellow-400" />
                                            <span className="text-sm font-semibold text-white">Game Scores</span>
                                        </div>
                                        <div className="space-y-1">
                                            {Object.entries(gameScores).map(([stepIndex, score]) => (
                                                <div key={stepIndex} className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-300">Game {parseInt(stepIndex) + 1}</span>
                                                    <span className="text-yellow-400 font-semibold">{score.score} points</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-4">
                                    {!showSteps ? (
                                        <motion.button
                                            onClick={() => setShowSteps(true)}
                                            className="w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-secondary-green to-emerald-500 text-white hover:shadow-lg hover:shadow-secondary-green/30"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiPlay className="w-5 h-5" />
                                            Start Learning
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            onClick={handleComplete}
                                            className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${isSkillCompleted(skillId || '')
                                                ? 'bg-secondary-green/20 text-secondary-green border-2 border-secondary-green/30'
                                                : 'bg-gradient-to-r from-secondary-green to-emerald-500 text-white hover:shadow-lg hover:shadow-secondary-green/30'
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {isSkillCompleted(skillId || '') ? (
                                                <>
                                                    <FiCheckCircle className="w-5 h-5" />
                                                    Completed
                                                </>
                                            ) : (
                                                <>
                                                    <FiTarget className="w-5 h-5" />
                                                    Mark as Completed
                                                </>
                                            )}
                                        </motion.button>
                                    )}

                                    <div className="flex gap-3">
                                        <motion.button
                                            onClick={handleBookmark}
                                            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isSkillBookmarked(skillId || '')
                                                ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiBookmark className={`w-4 h-4 ${isSkillBookmarked(skillId || '') ? 'fill-current' : ''}`} />
                                            {isSkillBookmarked(skillId || '') ? 'Bookmarked' : 'Bookmark'}
                                        </motion.button>

                                        <motion.button
                                            onClick={() => {
                                                if (navigator.share) {
                                                    navigator.share({
                                                        title: skill?.title || 'Skill',
                                                        text: `Check out this skill: ${skill?.title}`,
                                                        url: window.location.href
                                                    });
                                                } else {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    // You could add a toast notification here
                                                }
                                                if (skillId) {
                                                    addActivity('Shared', skill?.title || 'Skill', skillId);
                                                }
                                            }}
                                            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiShare2 className="w-4 h-4" />
                                            Share
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Certificate Badge */}
                                {skill.certificate && (
                                    <div className="mt-6 p-4 bg-gradient-to-r from-secondary-green/10 to-emerald-500/10 border border-secondary-green/30 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FiAward className="w-6 h-6 text-secondary-green" />
                                                <div>
                                                    <h4 className="font-semibold text-white">Certificate Available</h4>
                                                    <p className="text-sm text-slate-400">
                                                        {isSkillCompleted(skillId || '')
                                                            ? 'Congratulations! You can download your certificate.'
                                                            : 'Complete all steps to earn your certificate'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            {isSkillCompleted(skillId || '') && (
                                                <motion.button
                                                    onClick={() => {
                                                        // Generate and download certificate
                                                        const certificateData = {
                                                            skillName: skill?.title,
                                                            completedDate: new Date().toLocaleDateString(),
                                                            userName: 'Student', // You could get this from user context
                                                            certificateId: `CERT-${skillId}-${Date.now()}`
                                                        };

                                                        // Create a simple certificate as text file
                                                        const certificateText = `
AFTERBELL LEARNING PLATFORM
CERTIFICATE OF COMPLETION

This certifies that
${certificateData.userName}
has successfully completed the course
"${certificateData.skillName}"

Completed on: ${certificateData.completedDate}
Certificate ID: ${certificateData.certificateId}

Congratulations on your achievement!

AfterBell Learning Platform
                                                        `;

                                                        const blob = new Blob([certificateText], { type: 'text/plain' });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `${skill?.title}-Certificate.txt`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        document.body.removeChild(a);
                                                        URL.revokeObjectURL(url);
                                                    }}
                                                    className="px-4 py-2 bg-secondary-green text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <FiDownload className="w-4 h-4" />
                                                    Download
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Side - Content */}
                            <div className="lg:w-2/3">
                                {!showSteps ? (
                                    /* Overview Content */
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/50"
                                    >
                                        <h2 className="text-2xl font-bold text-white mb-4">What You'll Learn</h2>
                                        <div className="space-y-4 mb-6">
                                            {skill.steps.map((step, index) => (
                                                <div key={step.id} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-secondary-green/20 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-semibold text-secondary-green">{index + 1}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                                                        <p className="text-sm text-slate-400 mb-2">{step.description}</p>
                                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <FiClock className="w-3 h-3" />
                                                                {step.duration}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                {step.type === 'video' ? (
                                                                    <FiVideo className="w-3 h-3" />
                                                                ) : step.type === 'game' ? (
                                                                    <FiTarget className="w-3 h-3" />
                                                                ) : (
                                                                    <FiFileText className="w-3 h-3" />
                                                                )}
                                                                {step.type === 'video' ? 'Video' : step.type === 'game' ? 'Game' : 'Exercise'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
                                            <h3 className="font-semibold text-white mb-2">Ready to Start?</h3>
                                            <p className="text-sm text-slate-300">Click "Start Learning" to begin your journey with interactive lessons and games!</p>
                                        </div>
                                    </motion.div>
                                ) : skill && skill.steps && skill.steps[currentStep] ? (
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/50"
                                    >
                                        {/* Step Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h2 className="text-2xl font-bold text-white mb-2">
                                                    Step {currentStep + 1}: {skill.steps[currentStep].title}
                                                </h2>
                                                <p className="text-slate-300 mb-2">{skill.steps[currentStep].description}</p>
                                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <FiClock className="w-4 h-4" />
                                                        {skill.steps[currentStep].duration}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        {skill.steps[currentStep].type === 'video' ? (
                                                            <FiVideo className="w-4 h-4" />
                                                        ) : (
                                                            <FiFileText className="w-4 h-4" />
                                                        )}
                                                        {skill.steps[currentStep].type === 'video' ? 'Video Lesson' : 'Interactive Exercise'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleStepComplete(skill.steps[currentStep].id)}
                                                className={`p-3 rounded-xl transition-all duration-300 ${completedSteps.includes(skill.steps[currentStep].id)
                                                    ? 'bg-secondary-green/20 text-secondary-green border-2 border-secondary-green/30'
                                                    : 'bg-slate-600/50 text-slate-300 hover:bg-slate-500/50 border-2 border-slate-500/50'
                                                    }`}
                                            >
                                                <FiCheckCircle className="w-6 h-6" />
                                            </button>
                                        </div>

                                        {/* Step Content */}
                                        <div className="mb-6">
                                            {skill.steps[currentStep].type === 'video' ? (
                                                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg">
                                                    <iframe
                                                        src={skill.steps[currentStep].content}
                                                        title={skill.steps[currentStep].title}
                                                        className="w-full h-full"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            ) : skill.steps[currentStep].type === 'game' ? (
                                                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/30">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <FiTarget className="w-6 h-6 text-secondary-green" />
                                                        <h3 className="text-lg font-semibold text-white">Interactive Game</h3>
                                                    </div>
                                                    <p className="text-slate-300 leading-relaxed mb-4">{skill.steps[currentStep].content}</p>
                                                    <MiniGame
                                                        gameType={(skill.steps[currentStep].gameType as any) || 'budget'}
                                                        onComplete={handleGameComplete}
                                                        onSkip={handleGameSkip}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/30">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <FiPlayCircle className="w-6 h-6 text-secondary-green" />
                                                        <h3 className="text-lg font-semibold text-white">Interactive Exercise</h3>
                                                    </div>
                                                    <p className="text-slate-300 leading-relaxed">{skill.steps[currentStep].content}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Resources */}
                                        {skill.steps[currentStep].resources && (
                                            <div className="mb-6">
                                                <h4 className="text-lg font-semibold text-white mb-3">Resources & Materials</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {skill.steps[currentStep].resources.map((resource, index) => (
                                                        <div key={index} className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                                                            <FiDownload className="w-4 h-4 text-secondary-green" />
                                                            <span className="text-sm text-slate-300">{resource}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Navigation */}
                                        <div className="flex items-center justify-between">
                                            <motion.button
                                                onClick={currentStep === 0 ? () => setShowSteps(false) : prevStep}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <FiChevronLeft className="w-4 h-4" />
                                                {currentStep === 0 ? 'Back to Overview' : 'Previous'}
                                            </motion.button>

                                            <div className="flex items-center gap-2">
                                                {skill.steps.map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${index === currentStep
                                                            ? 'bg-secondary-green'
                                                            : completedSteps.includes(skill.steps[index].id)
                                                                ? 'bg-secondary-green/50'
                                                                : 'bg-slate-600'
                                                            }`}
                                                        onClick={() => setCurrentStep(index)}
                                                    />
                                                ))}
                                            </div>

                                            <motion.button
                                                onClick={nextStep}
                                                disabled={currentStep === skill.steps.length - 1}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${currentStep === skill.steps.length - 1
                                                    ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-secondary-green to-emerald-500 text-white hover:shadow-lg hover:shadow-secondary-green/30'
                                                    }`}
                                                whileHover={currentStep < skill.steps.length - 1 ? { scale: 1.02 } : {}}
                                                whileTap={currentStep < skill.steps.length - 1 ? { scale: 0.98 } : {}}
                                            >
                                                Next
                                                <FiChevronRight className="w-4 h-4" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/50 text-center"
                                    >
                                        <h2 className="text-2xl font-bold text-white mb-4">Skill Not Found</h2>
                                        <p className="text-slate-400 mb-6">The skill you're looking for doesn't exist or has been removed.</p>
                                        <motion.button
                                            onClick={() => navigate('/skills')}
                                            className="px-6 py-3 bg-secondary-green text-white rounded-lg hover:bg-emerald-600 transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Back to Skills
                                        </motion.button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Steps Overview */}
                    {skill && skill.steps && (
                        <motion.div
                            className="bg-slate-800/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-700/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Course Steps</h2>
                            <div className="space-y-4">
                                {skill.steps.map((step, index) => (
                                    <motion.div
                                        key={step.id}
                                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${index === currentStep
                                            ? 'bg-secondary-green/10 border-secondary-green/30'
                                            : completedSteps.includes(step.id)
                                                ? 'bg-slate-700/30 border-slate-600/50'
                                                : 'bg-slate-700/20 border-slate-600/30 hover:bg-slate-700/30'
                                            }`}
                                        onClick={() => setCurrentStep(index)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completedSteps.includes(step.id)
                                                    ? 'bg-secondary-green text-white'
                                                    : index === currentStep
                                                        ? 'bg-secondary-green/20 text-secondary-green border-2 border-secondary-green/30'
                                                        : 'bg-slate-600 text-slate-300'
                                                    }`}>
                                                    {completedSteps.includes(step.id) ? (
                                                        <FiCheckCircle className="w-4 h-4" />
                                                    ) : (
                                                        <span className="text-sm font-bold">{index + 1}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">{step.title}</h3>
                                                    <p className="text-sm text-slate-400">{step.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-slate-400">{step.duration}</span>
                                                {step.type === 'video' ? (
                                                    <FiVideo className="w-4 h-4 text-slate-400" />
                                                ) : step.type === 'game' ? (
                                                    <FiTarget className="w-4 h-4 text-slate-400" />
                                                ) : (
                                                    <FiFileText className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default SkillDetailPage;