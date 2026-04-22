import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'learning' | 'social' | 'achievement' | 'streak' | 'skill';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points: number;
    requirement: {
        type: 'skill_completed' | 'stories_shared' | 'comments_made' | 'days_streak' | 'points_earned' | 'stories_liked' | 'bookmarks_made';
        value: number;
        description: string;
    };
    unlockedAt?: string;
    progress?: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'learning' | 'social' | 'milestone' | 'special';
    points: number;
    requirement: {
        type: 'total_skills' | 'total_stories' | 'total_comments' | 'learning_streak' | 'total_points' | 'perfect_ratings' | 'helpful_comments';
        value: number;
        description: string;
    };
    unlockedAt?: string;
    progress?: number;
}

export interface LeaderboardEntry {
    userId: string;
    username: string;
    avatar?: string;
    points: number;
    badges: number;
    achievements: number;
    rank: number;
    level: number;
    streak: number;
}

export interface UserStats {
    totalPoints: number;
    level: number;
    experience: number;
    experienceToNext: number;
    badges: Badge[];
    achievements: Achievement[];
    currentStreak: number;
    longestStreak: number;
    totalSkillsCompleted: number;
    totalStoriesShared: number;
    totalCommentsMade: number;
    totalStoriesLiked: number;
    totalBookmarksMade: number;
    perfectRatings: number;
    helpfulComments: number;
    lastActivityDate: string;
    joinDate: string;
}

interface GamificationContextType {
    userStats: UserStats;
    leaderboard: LeaderboardEntry[];
    recentBadges: Badge[];
    recentAchievements: Achievement[];

    // Actions
    addPoints: (points: number, reason: string) => Promise<void>;
    checkBadges: (action: string, value?: number) => Promise<Badge[]>;
    checkAchievements: (action: string, value?: number) => Promise<Achievement[]>;
    unlockBadge: (badgeId: string) => Promise<void>;
    unlockAchievement: (achievementId: string) => Promise<void>;
    updateStreak: () => Promise<void>;
    getLevelProgress: () => { current: number; next: number; percentage: number };
    getLeaderboardPosition: () => number;

    // Utility functions
    getBadgeById: (badgeId: string) => Badge | undefined;
    getAchievementById: (achievementId: string) => Achievement | undefined;
    getUnlockedBadges: () => Badge[];
    getUnlockedAchievements: () => Achievement[];
    getLockedBadges: () => Badge[];
    getLockedAchievements: () => Achievement[];
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// Badge definitions
const BADGES: Badge[] = [
    {
        id: 'first_skill',
        name: 'First Steps',
        description: 'Complete your first skill',
        icon: '🎯',
        category: 'learning',
        rarity: 'common',
        points: 10,
        requirement: {
            type: 'skill_completed',
            value: 1,
            description: 'Complete 1 skill'
        }
    },
    {
        id: 'skill_master',
        name: 'Skill Master',
        description: 'Complete 10 skills',
        icon: '🏆',
        category: 'learning',
        rarity: 'rare',
        points: 50,
        requirement: {
            type: 'skill_completed',
            value: 10,
            description: 'Complete 10 skills'
        }
    },
    {
        id: 'storyteller',
        name: 'Storyteller',
        description: 'Share your first story',
        icon: '📖',
        category: 'social',
        rarity: 'common',
        points: 15,
        requirement: {
            type: 'stories_shared',
            value: 1,
            description: 'Share 1 story'
        }
    },
    {
        id: 'inspiring_author',
        name: 'Inspiring Author',
        description: 'Share 5 stories',
        icon: '✨',
        category: 'social',
        rarity: 'rare',
        points: 75,
        requirement: {
            type: 'stories_shared',
            value: 5,
            description: 'Share 5 stories'
        }
    },
    {
        id: 'helpful_commenter',
        name: 'Helpful Commenter',
        description: 'Make 10 helpful comments',
        icon: '💬',
        category: 'social',
        rarity: 'common',
        points: 25,
        requirement: {
            type: 'comments_made',
            value: 10,
            description: 'Make 10 comments'
        }
    },
    {
        id: 'streak_warrior',
        name: 'Streak Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'epic',
        points: 100,
        requirement: {
            type: 'days_streak',
            value: 7,
            description: 'Maintain a 7-day streak'
        }
    },
    {
        id: 'point_collector',
        name: 'Point Collector',
        description: 'Earn 500 points',
        icon: '💰',
        category: 'achievement',
        rarity: 'rare',
        points: 50,
        requirement: {
            type: 'points_earned',
            value: 500,
            description: 'Earn 500 points'
        }
    },
    {
        id: 'bookmark_enthusiast',
        name: 'Bookmark Enthusiast',
        description: 'Bookmark 20 stories',
        icon: '🔖',
        category: 'social',
        rarity: 'common',
        points: 30,
        requirement: {
            type: 'bookmarks_made',
            value: 20,
            description: 'Bookmark 20 stories'
        }
    }
];

// Achievement definitions
const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'learning_legend',
        name: 'Learning Legend',
        description: 'Complete 25 skills',
        icon: '👑',
        category: 'milestone',
        points: 200,
        requirement: {
            type: 'total_skills',
            value: 25,
            description: 'Complete 25 skills'
        }
    },
    {
        id: 'story_maestro',
        name: 'Story Maestro',
        description: 'Share 10 stories',
        icon: '📚',
        category: 'milestone',
        points: 150,
        requirement: {
            type: 'total_stories',
            value: 10,
            description: 'Share 10 stories'
        }
    },
    {
        id: 'community_champion',
        name: 'Community Champion',
        description: 'Make 50 helpful comments',
        icon: '🌟',
        category: 'social',
        points: 100,
        requirement: {
            type: 'helpful_comments',
            value: 50,
            description: 'Make 50 helpful comments'
        }
    },
    {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Give 20 perfect 5-star ratings',
        icon: '⭐',
        category: 'special',
        points: 75,
        requirement: {
            type: 'perfect_ratings',
            value: 20,
            description: 'Give 20 perfect ratings'
        }
    },
    {
        id: 'dedicated_learner',
        name: 'Dedicated Learner',
        description: 'Maintain a 30-day learning streak',
        icon: '💪',
        category: 'milestone',
        points: 300,
        requirement: {
            type: 'learning_streak',
            value: 30,
            description: 'Maintain a 30-day streak'
        }
    }
];

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userStats, setUserStats] = useState<UserStats>({
        totalPoints: 0,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        badges: [],
        achievements: [],
        currentStreak: 0,
        longestStreak: 0,
        totalSkillsCompleted: 0,
        totalStoriesShared: 0,
        totalCommentsMade: 0,
        totalStoriesLiked: 0,
        totalBookmarksMade: 0,
        perfectRatings: 0,
        helpfulComments: 0,
        lastActivityDate: new Date().toISOString(),
        joinDate: new Date().toISOString()
    });

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [recentBadges, setRecentBadges] = useState<Badge[]>([]);
    const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

    // Load data from localStorage
    useEffect(() => {
        const savedStats = localStorage.getItem('afterbell_gamification_stats');
        const savedLeaderboard = localStorage.getItem('afterbell_leaderboard');
        const savedRecentBadges = localStorage.getItem('afterbell_recent_badges');
        const savedRecentAchievements = localStorage.getItem('afterbell_recent_achievements');

        if (savedStats) {
            try {
                setUserStats(JSON.parse(savedStats));
            } catch (error) {
                console.error('Error loading gamification stats:', error);
            }
        } else {
            // Initialize with test data for demo purposes
            const testUserStats: UserStats = {
                totalPoints: 450,
                level: 5,
                experience: 50,
                experienceToNext: 50,
                totalSkillsCompleted: 5,
                totalStoriesShared: 3,
                totalCommentsMade: 12,
                totalBookmarks: 7,
                totalLikes: 25,
                currentStreak: 7,
                longestStreak: 12,
                badges: [
                    {
                        ...BADGES[0], // First Steps
                        unlockedAt: '2024-01-15T10:30:00Z',
                        progress: 1
                    },
                    {
                        ...BADGES[2], // Storyteller
                        unlockedAt: '2024-01-18T11:20:00Z',
                        progress: 1
                    },
                    {
                        ...BADGES[4], // Comment King
                        unlockedAt: '2024-01-20T14:15:00Z',
                        progress: 12
                    },
                    {
                        ...BADGES[6], // Streak Master
                        unlockedAt: '2024-01-22T16:45:00Z',
                        progress: 7
                    }
                ],
                achievements: [
                    {
                        ...ACHIEVEMENTS[0], // Learning Legend
                        unlockedAt: '2024-01-22T16:45:00Z',
                        progress: 5
                    },
                    {
                        ...ACHIEVEMENTS[1], // Story Maestro
                        unlockedAt: '2024-01-18T11:20:00Z',
                        progress: 3
                    }
                ]
            };
            setUserStats(testUserStats);
        }

        if (savedLeaderboard) {
            try {
                setLeaderboard(JSON.parse(savedLeaderboard));
            } catch (error) {
                console.error('Error loading leaderboard:', error);
            }
        }

        if (savedRecentBadges) {
            try {
                setRecentBadges(JSON.parse(savedRecentBadges));
            } catch (error) {
                console.error('Error loading recent badges:', error);
            }
        } else {
            // Set some recent badges for demo
            setRecentBadges([
                {
                    ...BADGES[6], // Streak Master
                    unlockedAt: '2024-01-22T16:45:00Z',
                    progress: 7
                },
                {
                    ...BADGES[4], // Comment King
                    unlockedAt: '2024-01-20T14:15:00Z',
                    progress: 12
                }
            ]);
        }

        if (savedRecentAchievements) {
            try {
                setRecentAchievements(JSON.parse(savedRecentAchievements));
            } catch (error) {
                console.error('Error loading recent achievements:', error);
            }
        } else {
            // Set some recent achievements for demo
            setRecentAchievements([
                {
                    ...ACHIEVEMENTS[0], // Learning Legend
                    unlockedAt: '2024-01-22T16:45:00Z',
                    progress: 5
                }
            ]);
        }
    }, []);

    // Save data to localStorage
    useEffect(() => {
        localStorage.setItem('afterbell_gamification_stats', JSON.stringify(userStats));
    }, [userStats]);

    useEffect(() => {
        localStorage.setItem('afterbell_leaderboard', JSON.stringify(leaderboard));
    }, [leaderboard]);

    useEffect(() => {
        localStorage.setItem('afterbell_recent_badges', JSON.stringify(recentBadges));
    }, [recentBadges]);

    useEffect(() => {
        localStorage.setItem('afterbell_recent_achievements', JSON.stringify(recentAchievements));
    }, [recentAchievements]);

    // Calculate level and experience
    const calculateLevel = (points: number) => {
        const level = Math.floor(points / 100) + 1;
        const experience = points % 100;
        const experienceToNext = 100 - experience;
        return { level, experience, experienceToNext };
    };

    // Add points and check for level up
    const addPoints = async (points: number, reason: string) => {
        const newTotalPoints = userStats.totalPoints + points;
        const { level, experience, experienceToNext } = calculateLevel(newTotalPoints);

        setUserStats(prev => ({
            ...prev,
            totalPoints: newTotalPoints,
            level,
            experience,
            experienceToNext,
            lastActivityDate: new Date().toISOString()
        }));

        // Check for badges and achievements
        await checkBadges('points_earned', newTotalPoints);
        await checkAchievements('total_points', newTotalPoints);
    };

    // Check and unlock badges
    const checkBadges = async (action: string, value?: number): Promise<Badge[]> => {
        const newBadges: Badge[] = [];

        for (const badge of BADGES) {
            if (userStats.badges.find(b => b.id === badge.id)) continue; // Already unlocked

            let shouldUnlock = false;
            let progress = 0;

            switch (badge.requirement.type) {
                case 'skill_completed':
                    progress = userStats.totalSkillsCompleted;
                    shouldUnlock = progress >= badge.requirement.value;
                    break;
                case 'stories_shared':
                    progress = userStats.totalStoriesShared;
                    shouldUnlock = progress >= badge.requirement.value;
                    break;
                case 'comments_made':
                    progress = userStats.totalCommentsMade;
                    shouldUnlock = progress >= badge.requirement.value;
                    break;
                case 'days_streak':
                    progress = userStats.currentStreak;
                    shouldUnlock = progress >= badge.requirement.value;
                    break;
                case 'points_earned':
                    progress = userStats.totalPoints;
                    shouldUnlock = progress >= badge.requirement.value;
                    break;
                case 'stories_liked':
                    progress = userStats.totalStoriesLiked;
                    shouldUnlock = progress >= badge.requirement.value;
                    break;
                case 'bookmarks_made':
                    progress = userStats.totalBookmarksMade;
                    shouldUnlock = progress >= badge.requirement.value;
                    break;
            }

            if (shouldUnlock) {
                const unlockedBadge = {
                    ...badge,
                    unlockedAt: new Date().toISOString(),
                    progress: badge.requirement.value
                };

                newBadges.push(unlockedBadge);
                setUserStats(prev => ({
                    ...prev,
                    badges: [...prev.badges, unlockedBadge]
                }));

                setRecentBadges(prev => [unlockedBadge, ...prev.slice(0, 4)]);

                // Add badge points
                await addPoints(badge.points, `Badge: ${badge.name}`);
            }
        }

        return newBadges;
    };

    // Check and unlock achievements
    const checkAchievements = async (action: string, value?: number): Promise<Achievement[]> => {
        const newAchievements: Achievement[] = [];

        for (const achievement of ACHIEVEMENTS) {
            if (userStats.achievements.find(a => a.id === achievement.id)) continue; // Already unlocked

            let shouldUnlock = false;
            let progress = 0;

            switch (achievement.requirement.type) {
                case 'total_skills':
                    progress = userStats.totalSkillsCompleted;
                    shouldUnlock = progress >= achievement.requirement.value;
                    break;
                case 'total_stories':
                    progress = userStats.totalStoriesShared;
                    shouldUnlock = progress >= achievement.requirement.value;
                    break;
                case 'total_comments':
                    progress = userStats.totalCommentsMade;
                    shouldUnlock = progress >= achievement.requirement.value;
                    break;
                case 'learning_streak':
                    progress = userStats.currentStreak;
                    shouldUnlock = progress >= achievement.requirement.value;
                    break;
                case 'total_points':
                    progress = userStats.totalPoints;
                    shouldUnlock = progress >= achievement.requirement.value;
                    break;
                case 'perfect_ratings':
                    progress = userStats.perfectRatings;
                    shouldUnlock = progress >= achievement.requirement.value;
                    break;
                case 'helpful_comments':
                    progress = userStats.helpfulComments;
                    shouldUnlock = progress >= achievement.requirement.value;
                    break;
            }

            if (shouldUnlock) {
                const unlockedAchievement = {
                    ...achievement,
                    unlockedAt: new Date().toISOString(),
                    progress: achievement.requirement.value
                };

                newAchievements.push(unlockedAchievement);
                setUserStats(prev => ({
                    ...prev,
                    achievements: [...prev.achievements, unlockedAchievement]
                }));

                setRecentAchievements(prev => [unlockedAchievement, ...prev.slice(0, 4)]);

                // Add achievement points
                await addPoints(achievement.points, `Achievement: ${achievement.name}`);
            }
        }

        return newAchievements;
    };

    // Unlock specific badge
    const unlockBadge = async (badgeId: string) => {
        const badge = BADGES.find(b => b.id === badgeId);
        if (!badge || userStats.badges.find(b => b.id === badgeId)) return;

        const unlockedBadge = {
            ...badge,
            unlockedAt: new Date().toISOString(),
            progress: badge.requirement.value
        };

        setUserStats(prev => ({
            ...prev,
            badges: [...prev.badges, unlockedBadge]
        }));

        setRecentBadges(prev => [unlockedBadge, ...prev.slice(0, 4)]);
        await addPoints(badge.points, `Badge: ${badge.name}`);
    };

    // Unlock specific achievement
    const unlockAchievement = async (achievementId: string) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement || userStats.achievements.find(a => a.id === achievementId)) return;

        const unlockedAchievement = {
            ...achievement,
            unlockedAt: new Date().toISOString(),
            progress: achievement.requirement.value
        };

        setUserStats(prev => ({
            ...prev,
            achievements: [...prev.achievements, unlockedAchievement]
        }));

        setRecentAchievements(prev => [unlockedAchievement, ...prev.slice(0, 4)]);
        await addPoints(achievement.points, `Achievement: ${achievement.name}`);
    };

    // Update learning streak
    const updateStreak = async () => {
        const today = new Date().toDateString();
        const lastActivity = new Date(userStats.lastActivityDate).toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

        let newStreak = userStats.currentStreak;

        if (today === lastActivity) {
            // Already active today, no change
        } else if (yesterday === lastActivity) {
            // Consecutive day, increment streak
            newStreak += 1;
        } else {
            // Streak broken, reset to 1
            newStreak = 1;
        }

        const newLongestStreak = Math.max(newStreak, userStats.longestStreak);

        setUserStats(prev => ({
            ...prev,
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastActivityDate: new Date().toISOString()
        }));

        // Check for streak-related badges
        await checkBadges('days_streak', newStreak);
        await checkAchievements('learning_streak', newStreak);
    };

    // Get level progress
    const getLevelProgress = () => {
        return {
            current: userStats.experience,
            next: userStats.experienceToNext,
            percentage: (userStats.experience / 100) * 100
        };
    };

    // Get leaderboard position
    const getLeaderboardPosition = () => {
        const position = leaderboard.findIndex(entry => entry.userId === 'current-user');
        return position >= 0 ? position + 1 : leaderboard.length + 1;
    };

    // Utility functions
    const getBadgeById = (badgeId: string) => {
        return BADGES.find(badge => badge.id === badgeId);
    };

    const getAchievementById = (achievementId: string) => {
        return ACHIEVEMENTS.find(achievement => achievement.id === achievementId);
    };

    const getUnlockedBadges = () => {
        return userStats.badges;
    };

    const getUnlockedAchievements = () => {
        return userStats.achievements;
    };

    const getLockedBadges = () => {
        return BADGES.filter(badge => !userStats.badges.find(b => b.id === badge.id));
    };

    const getLockedAchievements = () => {
        return ACHIEVEMENTS.filter(achievement => !userStats.achievements.find(a => a.id === achievement.id));
    };

    const value: GamificationContextType = {
        userStats,
        leaderboard,
        recentBadges,
        recentAchievements,
        addPoints,
        checkBadges,
        checkAchievements,
        unlockBadge,
        unlockAchievement,
        updateStreak,
        getLevelProgress,
        getLeaderboardPosition,
        getBadgeById,
        getAchievementById,
        getUnlockedBadges,
        getUnlockedAchievements,
        getLockedBadges,
        getLockedAchievements
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};
