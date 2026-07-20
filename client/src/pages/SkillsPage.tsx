import React, { useState, useMemo, memo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserData } from '../context/UserDataContext';
import { VirtualList, DebouncedInput, SkeletonCard } from '../components/PerformanceOptimizer';
import { useToast } from '../context/ToastContext';
import { getApiUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
    FiSearch,
    FiBookOpen,
    FiTrendingUp,
    FiStar,
    FiClock,
    FiCheckCircle,
    FiX,
    FiFilter,
    FiChevronLeft,
    FiChevronRight,
    FiBookmark,
    FiUser,
    FiTarget,
    FiMessageCircle,
    FiDollarSign,
    FiMonitor,
    FiPlay,
    FiAward,
    FiUsers,
    FiHeart,
    FiEye,
    FiZap
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

// Skill Categories with modern icons and gradients
const skillCategories = [
    {
        id: 'all',
        name: 'All Skills',
        icon: FiZap,
        color: 'from-secondary-green to-emerald-500',
        gradient: 'bg-gradient-to-br from-secondary-green/20 to-emerald-500/20',
        borderColor: 'border-secondary-green/30'
    },
    {
        id: 'communication',
        name: 'Communication',
        icon: FiMessageCircle,
        color: 'from-blue-500 to-blue-600',
        gradient: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20',
        borderColor: 'border-blue-500/30'
    },
    {
        id: 'cooking',
        name: 'Cooking',
        icon: FiStar,
        color: 'from-orange-500 to-red-500',
        gradient: 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
        borderColor: 'border-orange-500/30'
    },
    {
        id: 'finance',
        name: 'Finance',
        icon: FiDollarSign,
        color: 'from-green-500 to-green-600',
        gradient: 'bg-gradient-to-br from-green-500/20 to-green-600/20',
        borderColor: 'border-green-500/30'
    },
    {
        id: 'digital',
        name: 'Digital Skills',
        icon: FiMonitor,
        color: 'from-purple-500 to-purple-600',
        gradient: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20',
        borderColor: 'border-purple-500/30'
    },
    {
        id: 'art',
        name: 'Art & Creativity',
        icon: FiBookOpen,
        color: 'from-pink-500 to-pink-600',
        gradient: 'bg-gradient-to-br from-pink-500/20 to-pink-600/20',
        borderColor: 'border-pink-500/30'
    },
    {
        id: 'mental-health',
        name: 'Mental Health',
        icon: FiHeart,
        color: 'from-teal-500 to-emerald-500',
        gradient: 'bg-gradient-to-br from-teal-500/20 to-emerald-500/20',
        borderColor: 'border-teal-500/30'
    },
    {
        id: 'relationships',
        name: 'Relationships',
        icon: FiUsers,
        color: 'from-rose-500 to-pink-500',
        gradient: 'bg-gradient-to-br from-rose-500/20 to-pink-500/20',
        borderColor: 'border-rose-500/30'
    },
    {
        id: 'life-skills',
        name: 'Life Skills',
        icon: FiZap,
        color: 'from-amber-500 to-yellow-500',
        gradient: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20',
        borderColor: 'border-amber-500/30'
    }
];

// Enhanced Skill Data with modern metrics
const skillsData = [
    {
        id: 1,
        title: "How to Create a Budget",
        description: "Learn the basics of budgeting and managing your money effectively. Perfect for students starting their financial journey.",
        category: "finance",
        icon: FiDollarSign,
        duration: "15 min",
        difficulty: "Beginner",
        completed: false,
        bookmarked: false,
        videoUrl: "https://www.youtube.com/embed/4vGcH0Bk3hg",
        content: "Budgeting is a fundamental skill that helps you track your income and expenses. In this lesson, you'll learn how to create a simple budget, track your spending, and save money for your goals.",
        rating: 4.8,
        lessons: 5,
        certificate: true
    },
    {
        id: 2,
        title: "Public Speaking Basics",
        description: "Overcome stage fright and deliver confident presentations. Essential for school projects and future career success.",
        category: "communication",
        icon: FiMessageCircle,
        duration: "20 min",
        difficulty: "Beginner",
        completed: true,
        bookmarked: true,
        videoUrl: "https://www.youtube.com/embed/4vGcH0Bk3hg",
        content: "Public speaking is a valuable skill that can boost your confidence and help you express your ideas clearly. Learn techniques to overcome nervousness and engage your audience effectively.",
        rating: 4.9,
        lessons: 8,
        certificate: true
    },
    {
        id: 3,
        title: "Basic Cooking Skills",
        description: "Master essential cooking techniques and learn to prepare simple, healthy meals. Never go hungry again!",
        category: "cooking",
        icon: FiStar,
        duration: "25 min",
        difficulty: "Beginner",
        completed: false,
        bookmarked: false,
        videoUrl: "https://www.youtube.com/embed/4vGcH0Bk3hg",
        content: "Cooking is a life skill that everyone should learn. Discover how to chop vegetables, cook pasta, make simple sauces, and create delicious meals from scratch.",
        rating: 4.7,
        lessons: 6,
        certificate: true
    },
    {
        id: 4,
        title: "Digital Photography",
        description: "Take amazing photos with your phone or camera. Learn composition, lighting, and editing basics.",
        category: "art",
        icon: FiBookOpen,
        duration: "30 min",
        difficulty: "Intermediate",
        completed: false,
        bookmarked: true,
        videoUrl: "https://www.youtube.com/embed/4vGcH0Bk3hg",
        content: "Photography is both an art and a skill. Learn the rule of thirds, how to use natural light, and basic editing techniques to make your photos stand out.",
        rating: 4.6,
        lessons: 10,
        certificate: true
    },
    {
        id: 5,
        title: "Social Media Safety",
        description: "Stay safe online and protect your privacy. Essential digital citizenship for the modern world.",
        category: "digital",
        icon: FiMonitor,
        duration: "18 min",
        difficulty: "Beginner",
        completed: true,
        bookmarked: false,
        videoUrl: "https://www.youtube.com/embed/4vGcH0Bk3hg",
        content: "In today's digital world, understanding online safety is crucial. Learn about privacy settings, recognizing scams, and maintaining a positive digital footprint.",
        rating: 4.9,
        lessons: 4,
        certificate: true
    },
    {
        id: 6,
        title: "Creative Writing",
        description: "Unlock your imagination and express yourself through writing. Perfect for school essays and personal projects.",
        category: "art",
        icon: FiBookOpen,
        duration: "22 min",
        difficulty: "Intermediate",
        completed: false,
        bookmarked: false,
        videoUrl: "https://www.youtube.com/embed/4vGcH0Bk3hg",
        content: "Creative writing helps you develop your voice and express your ideas clearly. Learn storytelling techniques, character development, and how to overcome writer's block.",
        rating: 4.5,
        lessons: 7,
        certificate: true
    },
    {
        id: 7,
        title: "Time Management",
        description: "Master your schedule and boost productivity. Essential for balancing school, activities, and personal time.",
        category: "communication",
        icon: FiClock,
        duration: "16 min",
        difficulty: "Beginner",
        completed: false,
        bookmarked: true,
        videoUrl: "https://www.youtube.com/embed/4vGcH0Bk3hg",
        content: "Time management is key to success in school and life. Learn how to prioritize tasks, avoid procrastination, and create effective study schedules.",
        rating: 4.8,
        lessons: 5,
        certificate: true
    },
    {
        id: 8,
        title: "Basic Coding",
        description: "Start your programming journey with HTML and CSS. Build your first website from scratch!",
        category: "digital",
        icon: FiMonitor,
        duration: "35 min",
        difficulty: "Intermediate",
        completed: false,
        bookmarked: false,
        videoUrl: "https://www.youtube.com/embed/4vGcH0Bk3hg",
        content: "Coding is a valuable skill in today's digital economy. Learn the basics of HTML and CSS to create simple websites and understand how the web works.",
        rating: 4.7,
        lessons: 12,
        certificate: true
    }
];

const SkillsPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [favoriteSkills, setFavoriteSkills] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'name' | 'difficulty' | 'rating' | 'duration'>('name');
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
    const [restrictedCategories, setRestrictedCategories] = useState<string[]>([]);
    const [apiSkills, setApiSkills] = useState<any[] | null>(null);
    const [apiCategories, setApiCategories] = useState<any[] | null>(null);
    const [loadingSkills, setLoadingSkills] = useState(true);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSkillIds, setRecentSkillIds] = useState<string[]>(() => {
        try { return JSON.parse(localStorage.getItem('recent_skills') || '[]'); } catch { return []; }
    });
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        localStorage.setItem('recent_skills', JSON.stringify(recentSkillIds));
    }, [recentSkillIds]);

    const trackSkillVisit = (skillId: string) => {
        setRecentSkillIds(prev => {
            const filtered = prev.filter(id => id !== skillId);
            return [skillId, ...filtered].slice(0, 10);
        });
    };

    // Fetch autocomplete suggestions
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.trim().length < 2) {
            setSuggestions([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const token = localStorage.getItem('afterbell_token');
                const headers: HeadersInit = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;
                const res = await fetch(`${getApiUrl()}/api/v1/skills/search/suggest?q=${encodeURIComponent(searchQuery)}`, { headers });
                const data = await res.json();
                if (data.success) setSuggestions(data.suggestions || []);
            } catch { setSuggestions([]); }
        }, 250);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close suggestions on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Fetch skills and categories from backend API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('afterbell_token');
                const headers: HeadersInit = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const [catRes, skillRes] = await Promise.all([
                    fetch(`${getApiUrl()}/api/v1/skilldomains`, { headers }),
                    fetch(`${getApiUrl()}/api/v1/skills`, { headers }),
                ]);

                if (catRes.ok) {
                    const catData = await catRes.json();
                    if (catData.success) setApiCategories(catData.data);
                }
                if (skillRes.ok) {
                    const skillData = await skillRes.json();
                    if (skillData.success) setApiSkills(skillData.data);
                }
            } catch (err) {
                console.warn('Failed to fetch skills from API, using fallback data');
            } finally {
                setLoadingSkills(false);
            }
        };
        fetchData();
    }, []);
    const {
        stats,
        bookmarkSkill,
        unbookmarkSkill,
        isSkillBookmarked,
        isSkillCompleted,
        completedSkills: completedSkillsData,
        getSkillProgress,
        addActivity
    } = useUserData();

    // Load user preferences from localStorage
    useEffect(() => {
        const savedRecentSearches = localStorage.getItem('recent_searches');
        const savedFavoriteSkills = localStorage.getItem('favorite_skills');
        const savedViewMode = localStorage.getItem('skills_view_mode');
        const savedSortBy = localStorage.getItem('skills_sort_by');

        if (savedRecentSearches) {
            setRecentSearches(JSON.parse(savedRecentSearches));
        }
        if (savedFavoriteSkills) {
            setFavoriteSkills(JSON.parse(savedFavoriteSkills));
        }
        if (savedViewMode) {
            setViewMode(savedViewMode as 'grid' | 'list');
        }
        if (savedSortBy) {
            setSortBy(savedSortBy as 'name' | 'difficulty' | 'rating' | 'duration');
        }
    }, []);

    // Fetch parent restrictions for teen users
    useEffect(() => {
        if (user?.role === 'teen') {
            const token = localStorage.getItem('afterbell_token');
            if (!token) return;
            fetch(`${getApiUrl()}/api/v1/parent/restrictions`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.json()).then(data => {
                if (data.success) setRestrictedCategories(data.restrictedCategories || []);
            }).catch(() => {});
        }
    }, [user]);

    // Save user preferences to localStorage
    useEffect(() => {
        localStorage.setItem('skills_view_mode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        localStorage.setItem('skills_sort_by', sortBy);
    }, [sortBy]);

    useEffect(() => {
        localStorage.setItem('recent_searches', JSON.stringify(recentSearches));
    }, [recentSearches]);

    useEffect(() => {
        localStorage.setItem('favorite_skills', JSON.stringify(favoriteSkills));
    }, [favoriteSkills]);

    // Enhanced search functionality
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        if (query.trim() && !recentSearches.includes(query.trim())) {
            setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]); // Keep last 5 searches
        }
    }, [recentSearches]);

    // Toggle favorite skill
    const toggleFavorite = useCallback((skillId: string) => {
        setFavoriteSkills(prev => {
            const isFavorite = prev.includes(skillId);
            const newFavorites = isFavorite
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId];

            showToast(
                isFavorite ? 'Removed from favorites' : 'Added to favorites',
                'success'
            );
            return newFavorites;
        });
    }, [showToast]);

    // Filter and sort skills
    const effectiveSkills = useMemo(() => {
        if (apiSkills && apiSkills.length > 0) {
            return apiSkills.map((s: any) => {
                const cat = skillCategories.find(c => c.id === s.category);
                return {
                    id: s._id,
                    title: s.title,
                    description: s.description,
                    category: s.category,
                    icon: cat?.icon || FiZap,
                    duration: `${s.durationMinutes} min`,
                    durationMinutes: s.durationMinutes,
                    difficulty: s.difficulty.charAt(0).toUpperCase() + s.difficulty.slice(1),
                    completed: isSkillCompleted(s._id),
                    bookmarked: isSkillBookmarked(s._id),
                    videoUrl: s.videoUrl,
                    content: s.content,
                    rating: s.rating || 4.5,
                    lessons: s.steps?.length || s.lessons || 0,
                    certificate: s.certificate || false,
                    tags: s.tags || [],
                };
            });
        }
        return skillsData;
    }, [apiSkills, skillCategories, isSkillCompleted, isSkillBookmarked]);

    const resumeSkills = useMemo(() => {
        const completed = completedSkillsData || [];
        const completedIds = new Set(completed.map(c => c.skillId));
        const recent = recentSkillIds
            .filter(id => !completedIds.has(id))
            .map(id => effectiveSkills.find(s => String(s.id) === id))
            .filter(Boolean)
            .slice(0, 3);
        const recentCompleted = effectiveSkills
            .filter(s => completedIds.has(String(s.id)))
            .slice(0, 3);
        return { inProgress: recent, completed: recentCompleted };
    }, [recentSkillIds, effectiveSkills, completedSkillsData]);

    const hasResume = resumeSkills.inProgress.length > 0 || resumeSkills.completed.length > 0;

    const filteredSkills = useMemo(() => {
        let filtered = effectiveSkills.filter(skill => {
            const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
            const matchesSearch = searchQuery === '' ||
                skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (skill.tags && skill.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
            const matchesDifficulty = difficultyFilter === 'all' || (skill.difficulty || '').toLowerCase() === difficultyFilter;
            const notRestricted = !restrictedCategories.includes(skill.category);
            return matchesCategory && matchesSearch && matchesDifficulty && notRestricted;
        });

        // Sort skills
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'difficulty':
                    const difficultyOrder: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
                    return (difficultyOrder[(a.difficulty || '').toLowerCase()] || 0) - (difficultyOrder[(b.difficulty || '').toLowerCase()] || 0);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'duration': {
                    const aMin = a.durationMinutes || parseInt(a.duration) || 0;
                    const bMin = b.durationMinutes || parseInt(b.duration) || 0;
                    return aMin - bMin;
                }
                default:
                    return 0;
            }
        });

        return filtered;
    }, [selectedCategory, searchQuery, difficultyFilter, sortBy, restrictedCategories, effectiveSkills]);

    // Calculate progress using real data
    const completedSkills = stats.completedSkills;
    const totalSkills = stats.totalSkills;
    const progressPercentage = (completedSkills / totalSkills) * 100;

    // Handle skill completion toggle
    const toggleSkillCompletion = (skillId: number) => {
        // This is now handled by the UserDataContext
        // Skills completion is tracked through the skill detail page
    };

    // Handle bookmark toggle
    const toggleBookmark = (skillId: number | string) => {
        const skill = effectiveSkills.find(s => s.id === skillId);
        if (!skill) return;

        if (isSkillBookmarked(skillId.toString())) {
            unbookmarkSkill(skillId.toString());
        } else {
            bookmarkSkill(skillId.toString());
        }
    };

    // Navigate to skill detail page
    const openSkillDetail = (skill: any) => {
        trackSkillVisit(String(skill.id));
        navigate(`/skills/${skill.id}`);
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
            <div className="relative z-10 pt-20 pb-8">
                {/* Hero Section */}
                <motion.div
                    className="relative overflow-hidden bg-transparent min-h-fit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Hero Background Elements */}
                    <div className="absolute inset-0">
                        <motion.div
                            className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-secondary-green/10 to-blue-500/10 rounded-full blur-3xl"
                            animate={{
                                x: [0, 100, 0],
                                y: [0, -50, 0],
                                scale: [1, 0.8, 1],
                                rotate: [0, 180, 360]
                            }}
                            transition={{
                                duration: 25,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <motion.div
                            className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"
                            animate={{
                                x: [0, -80, 0],
                                y: [0, 40, 0],
                                scale: [1, 1.2, 1],
                                rotate: [0, -180, -360]
                            }}
                            transition={{
                                duration: 30,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 5
                            }}
                        />
                    </div>

                    {/* Hero Content */}
                    <div className="container mx-auto px-4 pt-2 pb-4 md:pt-4 md:pb-8">
                        <motion.div
                            className="text-center max-w-4xl mx-auto"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <motion.div
                                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-green/10 border border-secondary-green/30 rounded-full text-secondary-green text-sm font-medium mb-6"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <FiAward className="w-4 h-4" />
                                <span>Student Project - AfterBell</span>
                            </motion.div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-secondary-green via-blue-400 to-purple-500 drop-shadow-2xl leading-tight">
                                Master Life Skills
                                <br />
                                <span className="text-white">That Matter</span>
                            </h1>

                            <p className="text-slate-400 text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
                                A college project showcasing essential life skills for students.
                                Explore interactive lessons and practical knowledge for academic and personal growth.
                            </p>

                            {/* Hero Stats */}
                            <motion.div
                                className="flex flex-wrap justify-center gap-6 md:gap-8 mb-8 md:mb-12"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            >
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">{totalSkills}</div>
                                    <div className="text-slate-400 text-xs md:text-sm">Skills Available</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">{completedSkills}</div>
                                    <div className="text-slate-400 text-xs md:text-sm">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">Free</div>
                                    <div className="text-slate-400 text-xs md:text-sm">Access</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Resume Learning Section */}
                {hasResume && (
                    <div className="container mx-auto px-4 pb-4 md:pb-6">
                        <motion.div
                            className="max-w-4xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.75 }}
                        >
                            {resumeSkills.inProgress.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                        <FiPlay className="w-4 h-4 text-secondary-green" />
                                        Continue Learning
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {resumeSkills.inProgress.map((skill: any) => {
                                            const cat = skillCategories.find(c => c.id === skill.category);
                                            const IconComp = cat?.icon || FiStar;
                                            return (
                                                <motion.button
                                                    key={skill.id}
                                                    onClick={() => { trackSkillVisit(String(skill.id)); navigate(`/skills/${skill.id}`); }}
                                                    className="flex items-center gap-3 p-3 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/40 hover:border-secondary-green/40 transition-all text-left"
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat?.color || 'from-blue-500 to-purple-500'} flex items-center justify-center text-white flex-shrink-0`}>
                                                        <IconComp className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-white truncate">{skill.title}</p>
                                                        <p className="text-xs text-slate-400">{skill.duration}</p>
                                                    </div>
                                                    <FiPlay className="w-4 h-4 text-secondary-green flex-shrink-0" />
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {resumeSkills.completed.length > 0 && (
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                        <FiCheckCircle className="w-4 h-4 text-green-400" />
                                        Recently Completed
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {resumeSkills.completed.map((skill: any) => {
                                            const cat = skillCategories.find(c => c.id === skill.category);
                                            const IconComp = cat?.icon || FiStar;
                                            return (
                                                <motion.button
                                                    key={skill.id}
                                                    onClick={() => navigate(`/skills/${skill.id}`)}
                                                    className="flex items-center gap-3 p-3 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all text-left"
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat?.color || 'from-green-500 to-emerald-500'} flex items-center justify-center text-white flex-shrink-0`}>
                                                        <IconComp className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-white truncate">{skill.title}</p>
                                                        <p className="text-xs text-green-400">Completed ✓</p>
                                                    </div>
                                                    <FiEye className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}

                {/* Search and Filter Section */}
                <div className="container mx-auto px-4 pb-4 md:pb-6">
                    <motion.div
                        className="max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        {/* Search Bar */}
                        <div className="relative mb-4 md:mb-6" ref={searchRef}>
                            <FiSearch className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-slate-400 z-10" />
                            <DebouncedInput
                                value={searchQuery}
                                onChange={(val) => { setSearchQuery(val); setShowSuggestions(true); }}
                                placeholder="Search for skills, topics, or keywords..."
                                className="w-full pl-12 md:pl-16 pr-4 md:pr-6 py-4 md:py-5 bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-secondary-green focus:ring-2 focus:ring-secondary-green/20 transition-all duration-300 text-base md:text-lg"
                                delay={300}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                                    className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            )}
                            {/* Autocomplete dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute z-50 top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl"
                                >
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={`${s.type}-${i}`}
                                            onClick={() => {
                                                if (s.type === 'skill' && s._id) {
                                                    trackSkillVisit(s._id);
                                                    navigate(`/skills/${s._id}`);
                                                } else {
                                                    setSearchQuery(s.text);
                                                }
                                                setShowSuggestions(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 md:px-6 py-3 text-left hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 last:border-b-0"
                                        >
                                            <div className={`p-1.5 rounded-lg ${s.type === 'skill' ? 'bg-secondary-green/20' : 'bg-blue-500/20'}`}>
                                                {s.type === 'skill' ? <FiPlay className="w-3 h-3 text-secondary-green" /> : <FiSearch className="w-3 h-3 text-blue-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white text-sm font-medium truncate">{s.text}</div>
                                                {s.type === 'skill' && (
                                                    <div className="text-slate-400 text-xs">{s.category} · {s.difficulty} · {s.durationMinutes}min</div>
                                                )}
                                                {s.type === 'tag' && (
                                                    <div className="text-slate-400 text-xs">Search by tag</div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                            {/* Recent searches */}
                            {recentSearches.length > 0 && !searchQuery && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {recentSearches.map((term, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setSearchQuery(term); setShowSuggestions(true); }}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/30 border border-slate-600/30 rounded-full text-xs text-slate-300 hover:bg-slate-600/30 hover:text-white transition-colors"
                                        >
                                            <FiSearch className="w-3 h-3" />
                                            {term}
                                            <FiX
                                                className="w-3 h-3 ml-1 text-slate-500 hover:text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRecentSearches(prev => prev.filter((_, j) => j !== i));
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Category Filters */}
                        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6 md:mb-8">
                            {skillCategories.map((category) => {
                                const IconComponent = category.icon;
                                const isSelected = selectedCategory === category.id;
                                return (
                                    <motion.button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-secondary-green/50 text-sm md:text-base ${isSelected
                                            ? `bg-gradient-to-r ${category.color} text-white shadow-lg shadow-secondary-green/30 border-2 border-transparent`
                                            : 'bg-slate-800/50 backdrop-blur-lg border-2 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600/50'
                                            }`}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
                                        {category.name}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex justify-between items-center mb-6 md:mb-8">
                            <div className="text-slate-400 text-sm md:text-base">
                                {filteredSkills.length} skills found
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-lg rounded-xl p-1 border border-slate-700/50">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                                        ? 'bg-secondary-green text-white'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list'
                                        ? 'bg-secondary-green text-white'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Skills Grid/List */}
                    <div className="max-w-7xl mx-auto">
                        {loadingSkills ? (
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <SkeletonCard count={6} />
                            </motion.div>
                        ) : viewMode === 'grid' ? (
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 1 }}
                            >
                                <AnimatePresence>
                                    {filteredSkills.map((skill) => {
                                        const IconComponent = skill.icon;
                                        const category = skillCategories.find(cat => cat.id === skill.category);

                                        return (
                                            <motion.div
                                                key={skill.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.3 }}
                                                className="group relative"
                                            >
                                                <motion.div
                                                    className="bg-slate-800/50 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-slate-700/50 hover:border-secondary-green/30 transition-all duration-500 h-full relative overflow-hidden"
                                                    whileHover={{
                                                        y: -8,
                                                        boxShadow: "0 25px 50px -12px rgba(80, 200, 120, 0.25)"
                                                    }}
                                                >
                                                    {/* Background Gradient */}
                                                    <div className={`absolute inset-0 ${category?.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                                    {/* Content */}
                                                    <div className="relative z-10">
                                                        {/* Skill Header */}
                                                        <div className="flex items-start justify-between mb-4 md:mb-6">
                                                            <div className="flex items-center gap-3 md:gap-4">
                                                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${category?.color} flex items-center justify-center text-white shadow-lg`}>
                                                                    <IconComponent className="w-6 h-6 md:w-8 md:h-8" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-white text-lg md:text-xl group-hover:text-secondary-green transition-colors duration-300 mb-2">
                                                                        {skill.title}
                                                                    </h3>
                                                                    <div className="flex items-center gap-2 md:gap-3">
                                                                        <span className="text-xs bg-slate-700/50 text-slate-300 px-2 md:px-3 py-1 rounded-full">
                                                                            {skill.difficulty}
                                                                        </span>
                                                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                            <FiClock className="w-3 h-3" />
                                                                            {skill.duration}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Bookmark Button */}
                                                            <button
                                                                onClick={() => toggleBookmark(skill.id)}
                                                                className={`p-2 md:p-3 rounded-xl transition-all duration-300 ${isSkillBookmarked(skill.id.toString())
                                                                    ? 'text-blue-400 bg-blue-400/10'
                                                                    : 'text-slate-400 hover:text-blue-400 hover:bg-blue-400/10'
                                                                    }`}
                                                            >
                                                                <FiBookmark className={`w-4 h-4 md:w-5 md:h-5 ${isSkillBookmarked(skill.id.toString()) ? 'fill-current' : ''}`} />
                                                            </button>
                                                        </div>

                                                        {/* Description */}
                                                        <p className="text-slate-400 text-sm leading-relaxed mb-4 md:mb-6">
                                                            {skill.description}
                                                        </p>

                                                        {/* Stats Row */}
                                                        <div className="flex items-center justify-between mb-4 md:mb-6">
                                                            <div className="flex items-center gap-3 md:gap-4">
                                                                <div className="flex items-center gap-1">
                                                                    <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                                                    <span className="text-sm text-white font-medium">{skill.rating}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <FiBookOpen className="w-4 h-4 text-slate-400" />
                                                                    <span className="text-sm text-slate-400">{skill.lessons} lessons</span>
                                                                </div>
                                                            </div>
                                                            {skill.certificate && (
                                                                <div className="flex items-center gap-1 text-secondary-green text-sm">
                                                                    <FiAward className="w-4 h-4" />
                                                                    <span>Certificate</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Category Tag */}
                                                        <div className="flex items-center justify-between mb-4 md:mb-6">
                                                            <span className="text-xs bg-slate-700/50 text-slate-300 px-2 md:px-3 py-1 rounded-full">
                                                                {category?.name}
                                                            </span>
                                                            {skill.completed && (
                                                                <div className="flex items-center gap-1 text-secondary-green text-sm">
                                                                    <FiCheckCircle className="w-4 h-4" />
                                                                    <span>Completed</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex gap-2 md:gap-3">
                                                            <motion.button
                                                                onClick={() => openSkillDetail(skill)}
                                                                className="flex-1 bg-gradient-to-r from-secondary-green to-emerald-500 text-white font-semibold py-3 md:py-4 px-4 md:px-6 rounded-2xl hover:shadow-lg hover:shadow-secondary-green/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <FiPlay className="w-4 h-4 md:w-5 md:h-5" />
                                                                Start Learning
                                                            </motion.button>

                                                            <motion.button
                                                                onClick={() => toggleSkillCompletion(skill.id)}
                                                                className={`px-4 md:px-6 py-3 md:py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm md:text-base ${skill.completed
                                                                    ? 'bg-secondary-green/20 text-secondary-green border-2 border-secondary-green/30'
                                                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border-2 border-slate-600/50'
                                                                    }`}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                {skill.completed ? (
                                                                    <FiCheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                                                                ) : (
                                                                    <FiTarget className="w-4 h-4 md:w-5 md:h-5" />
                                                                )}
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            // List View
                            <motion.div
                                className="space-y-4 md:space-y-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 1 }}
                            >
                                <AnimatePresence>
                                    {filteredSkills.map((skill) => {
                                        const IconComponent = skill.icon;
                                        const category = skillCategories.find(cat => cat.id === skill.category);

                                        return (
                                            <motion.div
                                                key={skill.id}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ duration: 0.3 }}
                                                className="group"
                                            >
                                                <motion.div
                                                    className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-slate-700/50 hover:border-secondary-green/30 transition-all duration-300"
                                                    whileHover={{ x: 4 }}
                                                >
                                                    <div className="flex items-center gap-4 md:gap-6">
                                                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${category?.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                                                            <IconComponent className="w-6 h-6 md:w-8 md:h-8" />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <h3 className="font-bold text-white text-lg md:text-xl group-hover:text-secondary-green transition-colors duration-300">
                                                                    {skill.title}
                                                                </h3>
                                                                <button
                                                                    onClick={() => toggleBookmark(skill.id)}
                                                                    className={`p-2 rounded-lg transition-all duration-300 ${isSkillBookmarked(skill.id.toString())
                                                                        ? 'text-blue-400 bg-blue-400/10'
                                                                        : 'text-slate-400 hover:text-blue-400 hover:bg-blue-400/10'
                                                                        }`}
                                                                >
                                                                    <FiBookmark className={`w-4 h-4 ${isSkillBookmarked(skill.id.toString()) ? 'fill-current' : ''}`} />
                                                                </button>
                                                            </div>

                                                            <p className="text-slate-400 text-sm mb-3">
                                                                {skill.description}
                                                            </p>

                                                            <div className="flex items-center gap-3 md:gap-4 text-sm">
                                                                <span className="text-slate-300">{skill.duration}</span>
                                                                <span className="text-slate-400">•</span>
                                                                <span className="text-slate-300">{skill.difficulty}</span>
                                                                <span className="text-slate-400">•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                                                                    <span className="text-slate-300">{skill.rating}</span>
                                                                </div>
                                                                <span className="text-slate-400">•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <FiBookOpen className="w-3 h-3 text-slate-400" />
                                                                    <span className="text-slate-300">{skill.lessons} lessons</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                                                            <motion.button
                                                                onClick={() => openSkillDetail(skill)}
                                                                className="bg-gradient-to-r from-secondary-green to-emerald-500 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-xl hover:shadow-lg hover:shadow-secondary-green/30 transition-all duration-300 flex items-center gap-2 text-sm"
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <FiPlay className="w-4 h-4" />
                                                                Learn
                                                            </motion.button>

                                                            <motion.button
                                                                onClick={() => toggleSkillCompletion(skill.id)}
                                                                className={`p-2 md:p-3 rounded-xl font-semibold transition-all duration-300 ${skill.completed
                                                                    ? 'bg-secondary-green/20 text-secondary-green border border-secondary-green/30'
                                                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
                                                                    }`}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                {skill.completed ? (
                                                                    <FiCheckCircle className="w-4 h-4" />
                                                                ) : (
                                                                    <FiTarget className="w-4 h-4" />
                                                                )}
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* No Results */}
                        {filteredSkills.length === 0 && (
                            <motion.div
                                className="text-center py-12 md:py-16"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FiSearch className="w-12 h-12 md:w-16 md:h-16 text-slate-400" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">No skills found</h3>
                                <p className="text-slate-400 text-base md:text-lg mb-6">
                                    Try adjusting your search or category filter
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory('all');
                                    }}
                                    className="bg-secondary-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-500 transition-colors duration-300"
                                >
                                    Clear Filters
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SkillsPage;
