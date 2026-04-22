import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '../api/client';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    bio: string;
    location: string;
    joinDate: string;
    level: string;
    profilePicture?: string;
}

interface UserStats {
    totalSkills: number;
    completedSkills: number;
    inProgress: number;
    bookmarked: number;
    totalHours: number;
    currentStreak: number;
    longestStreak: number;
    certificates: number;
    lastActiveDate: string;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedDate?: string;
    progress?: number;
    maxProgress?: number;
}

interface UserActivity {
    id: string;
    action: string;
    skill: string;
    skillId: string;
    time: string;
    timestamp: number;
}

interface BookmarkedSkill {
    skillId: string;
    bookmarkedAt: string;
}

interface CompletedSkill {
    skillId: string;
    completedAt: string;
    completedSteps: number[];
    totalSteps: number;
    timeSpent: number;
    score?: number;
}

interface UserDataContextType {
    profile: UserProfile | null;
    stats: UserStats;
    achievements: Achievement[];
    activities: UserActivity[];
    bookmarkedSkills: BookmarkedSkill[];
    completedSkills: CompletedSkill[];
    updateProfile: (updates: Partial<UserProfile>) => void;
    completeSkill: (skillId: string, steps: number[], timeSpent: number, score?: number) => void;
    bookmarkSkill: (skillId: string) => void;
    unbookmarkSkill: (skillId: string) => void;
    addActivity: (action: string, skill: string, skillId: string) => void;
    updateStreak: () => void;
    isSkillCompleted: (skillId: string) => boolean;
    isSkillBookmarked: (skillId: string) => boolean;
    getSkillProgress: (skillId: string) => { completed: number; total: number; percentage: number };
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

// Default achievements
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
    { id: '1', title: 'First Steps', description: 'Complete your first skill', icon: 'FiTarget', earned: false, progress: 0, maxProgress: 1 },
    { id: '2', title: 'Week Warrior', description: 'Maintain a 7-day learning streak', icon: 'FiTrendingUp', earned: false, progress: 0, maxProgress: 7 },
    { id: '3', title: 'Skill Master', description: 'Complete 5 skills', icon: 'FiAward', earned: false, progress: 0, maxProgress: 5 },
    { id: '4', title: 'Social Learner', description: 'Share 3 skills', icon: 'FiShare2', earned: false, progress: 0, maxProgress: 3 },
    { id: '5', title: 'Night Owl', description: 'Learn after 10 PM', icon: 'FiClock', earned: false, progress: 0, maxProgress: 1 },
    { id: '6', title: 'Bookworm', description: 'Bookmark 10 skills', icon: 'FiHeart', earned: false, progress: 0, maxProgress: 10 },
    { id: '7', title: 'Speed Learner', description: 'Complete a skill in under 30 minutes', icon: 'FiZap', earned: false, progress: 0, maxProgress: 1 },
    { id: '8', title: 'Dedicated Student', description: 'Learn for 50+ hours total', icon: 'FiClock', earned: false, progress: 0, maxProgress: 50 }
];

// Admin/demo account achievements (pre-earned for demo purposes)
const DEMO_ACHIEVEMENTS: Achievement[] = [
    { id: '1', title: 'First Steps', description: 'Complete your first skill', icon: 'FiTarget', earned: true, earnedDate: '2024-01-15T10:30:00Z', progress: 1, maxProgress: 1 },
    { id: '2', title: 'Week Warrior', description: 'Maintain a 7-day learning streak', icon: 'FiTrendingUp', earned: true, earnedDate: '2024-01-20T14:15:00Z', progress: 7, maxProgress: 7 },
    { id: '3', title: 'Skill Master', description: 'Complete 5 skills', icon: 'FiAward', earned: true, earnedDate: '2024-01-22T16:45:00Z', progress: 5, maxProgress: 5 },
    { id: '4', title: 'Social Learner', description: 'Share 3 skills', icon: 'FiShare2', earned: true, earnedDate: '2024-01-18T11:20:00Z', progress: 3, maxProgress: 3 },
    { id: '5', title: 'Night Owl', description: 'Learn after 10 PM', icon: 'FiClock', earned: true, earnedDate: '2024-01-16T22:30:00Z', progress: 1, maxProgress: 1 },
    { id: '6', title: 'Bookworm', description: 'Bookmark 10 skills', icon: 'FiHeart', earned: false, progress: 7, maxProgress: 10 },
    { id: '7', title: 'Speed Learner', description: 'Complete a skill in under 30 minutes', icon: 'FiZap', earned: true, earnedDate: '2024-01-19T09:15:00Z', progress: 1, maxProgress: 1 },
    { id: '8', title: 'Dedicated Student', description: 'Learn for 50+ hours total', icon: 'FiClock', earned: false, progress: 32, maxProgress: 50 }
];

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStats>({
        totalSkills: 12,
        completedSkills: 0,
        inProgress: 0,
        bookmarked: 0,
        totalHours: 0,
        currentStreak: 0,
        longestStreak: 0,
        certificates: 0,
        lastActiveDate: new Date().toISOString().split('T')[0]
    });
    const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
    const [activities, setActivities] = useState<UserActivity[]>([]);
    const [bookmarkedSkills, setBookmarkedSkills] = useState<BookmarkedSkill[]>([]);
    const [completedSkills, setCompletedSkills] = useState<CompletedSkill[]>([]);

    // Load user data on mount
    useEffect(() => {
        if (user) {
            loadUserData();
        }
    }, [user]);

    const loadUserData = () => {
        if (!user) return;

        const userKey = `afterbell_userdata_${user.id}`;
        const savedData = localStorage.getItem(userKey);

        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                setProfile(data.profile || createDefaultProfile());
                setStats(data.stats || stats);
                setAchievements(data.achievements || DEFAULT_ACHIEVEMENTS);
                setActivities(data.activities || []);
                setBookmarkedSkills(data.bookmarkedSkills || []);
                setCompletedSkills(data.completedSkills || []);
            } catch (error) {
                console.error('Error loading user data:', error);
                initializeUserData();
            }
        } else {
            initializeUserData();
        }
    };

    const createDefaultProfile = (): UserProfile => ({
        id: user?.id || '',
        name: user?.name || '',
        email: user?.email || '',
        bio: 'Passionate learner exploring new skills and knowledge.',
        location: 'New York, NY',
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        level: 'Beginner'
    });

    const initializeUserData = () => {
        if (!user) return;

        const defaultProfile = createDefaultProfile();
        setProfile(defaultProfile);

        // Give admin account demo stats for testing the app
        if (user.email === 'admin@afterbell.com') {
            setStats({
                totalSkills: 12,
                completedSkills: 5,
                inProgress: 3,
                bookmarked: 7,
                totalHours: 32,
                currentStreak: 7,
                longestStreak: 12,
                certificates: 3,
                lastActiveDate: new Date().toISOString().split('T')[0]
            });

            setAchievements(DEMO_ACHIEVEMENTS);

            // Add some sample activities
            const sampleActivities: UserActivity[] = [
                { id: '1', action: 'Joined', skill: 'AfterBell', skillId: 'welcome', time: '2 weeks ago', timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000 },
                { id: '2', action: 'Completed', skill: 'Budget Management', skillId: 'budget', time: '1 week ago', timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
                { id: '3', action: 'Completed', skill: 'Public Speaking', skillId: 'speaking', time: '5 days ago', timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
                { id: '4', action: 'Bookmarked', skill: 'Time Management', skillId: 'time', time: '3 days ago', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
                { id: '5', action: 'Completed', skill: 'Cooking Basics', skillId: 'cooking', time: '2 days ago', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
                { id: '6', action: 'Started', skill: 'Photography', skillId: 'photography', time: '1 day ago', timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
                { id: '7', action: 'Completed', skill: 'Online Safety', skillId: 'safety', time: '12 hours ago', timestamp: Date.now() - 12 * 60 * 60 * 1000 },
                { id: '8', action: 'Bookmarked', skill: 'Creative Writing', skillId: 'writing', time: '6 hours ago', timestamp: Date.now() - 6 * 60 * 60 * 1000 }
            ];
            setActivities(sampleActivities);

            // Add some completed skills
            const sampleCompletedSkills: CompletedSkill[] = [
                { skillId: 'budget', completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), completedSteps: [0, 1, 2, 3], totalSteps: 4, timeSpent: 45, score: 85 },
                { skillId: 'speaking', completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), completedSteps: [0, 1, 2, 3, 4], totalSteps: 5, timeSpent: 60, score: 92 },
                { skillId: 'cooking', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), completedSteps: [0, 1, 2], totalSteps: 3, timeSpent: 30, score: 78 },
                { skillId: 'safety', completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), completedSteps: [0, 1, 2, 3], totalSteps: 4, timeSpent: 25, score: 88 }
            ];
            setCompletedSkills(sampleCompletedSkills);

            // Add some bookmarked skills
            const sampleBookmarkedSkills: BookmarkedSkill[] = [
                { skillId: 'time', bookmarkedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
                { skillId: 'writing', bookmarkedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
                { skillId: 'coding', bookmarkedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
                { skillId: 'photography', bookmarkedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
                { skillId: 'finance', bookmarkedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
                { skillId: 'communication', bookmarkedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
                { skillId: 'leadership', bookmarkedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() }
            ];
            setBookmarkedSkills(sampleBookmarkedSkills);
        } else {
            addActivity('Joined', 'AfterBell', 'welcome');
        }
    };

    const saveUserData = () => {
        if (!user) return;

        const userKey = `afterbell_userdata_${user.id}`;
        const data = {
            profile,
            stats,
            achievements,
            activities,
            bookmarkedSkills,
            completedSkills
        };

        localStorage.setItem(userKey, JSON.stringify(data));
    };

    // Save data whenever it changes
    useEffect(() => {
        if (user) {
            saveUserData();
        }
    }, [profile, stats, achievements, activities, bookmarkedSkills, completedSkills, user]);

    const updateProfile = (updates: Partial<UserProfile>) => {
        if (!profile) return;

        setProfile(prev => prev ? { ...prev, ...updates } : null);
        addActivity('Updated', 'Profile', 'profile');
    };

    const completeSkill = (skillId: string, completedSteps: number[], timeSpent: number, score?: number, skillName?: string) => {
        const existingCompletion = completedSkills.find(cs => cs.skillId === skillId);

        if (existingCompletion) {
            // Update existing completion
            setCompletedSkills(prev => prev.map(cs =>
                cs.skillId === skillId
                    ? { ...cs, completedSteps, timeSpent: cs.timeSpent + timeSpent, score }
                    : cs
            ));
        } else {
            // Add new completion
            const newCompletion: CompletedSkill = {
                skillId,
                completedAt: new Date().toISOString(),
                completedSteps,
                totalSteps: 8, // Default total steps
                timeSpent,
                score
            };
            setCompletedSkills(prev => [...prev, newCompletion]);
            // Sync to backend so parent dashboard can show progress
            const nameForApi = skillName || getSkillName(skillId);
            apiRequest('/api/v1/progress', {
                method: 'POST',
                body: JSON.stringify({ skillId, skillName: nameForApi }),
            }).catch(() => {});
        }

        // Update stats
        setStats(prev => ({
            ...prev,
            completedSkills: completedSkills.length + (existingCompletion ? 0 : 1),
            totalHours: prev.totalHours + (timeSpent / 60) // Convert minutes to hours
        }));

        // Add activity
        addActivity('Completed', getSkillName(skillId), skillId);

        // Check achievements
        checkAchievements();
    };

    const bookmarkSkill = (skillId: string) => {
        if (bookmarkedSkills.find(bs => bs.skillId === skillId)) return;

        const newBookmark: BookmarkedSkill = {
            skillId,
            bookmarkedAt: new Date().toISOString()
        };

        setBookmarkedSkills(prev => [...prev, newBookmark]);
        setStats(prev => ({ ...prev, bookmarked: prev.bookmarked + 1 }));
        addActivity('Bookmarked', getSkillName(skillId), skillId);
        checkAchievements();
    };

    const unbookmarkSkill = (skillId: string) => {
        setBookmarkedSkills(prev => prev.filter(bs => bs.skillId !== skillId));
        setStats(prev => ({ ...prev, bookmarked: prev.bookmarked - 1 }));
        addActivity('Unbookmarked', getSkillName(skillId), skillId);
    };

    const addActivity = (action: string, skill: string, skillId: string) => {
        const newActivity: UserActivity = {
            id: Date.now().toString(),
            action,
            skill,
            skillId,
            time: 'Just now',
            timestamp: Date.now()
        };

        setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only last 10 activities
    };

    const updateStreak = () => {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = stats.lastActiveDate;

        if (lastActive === today) return; // Already updated today

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActive === yesterdayStr) {
            // Continue streak
            setStats(prev => ({
                ...prev,
                currentStreak: prev.currentStreak + 1,
                longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1),
                lastActiveDate: today
            }));
        } else {
            // Reset streak
            setStats(prev => ({
                ...prev,
                currentStreak: 1,
                lastActiveDate: today
            }));
        }

        checkAchievements();
    };

    const checkAchievements = () => {
        setAchievements(prev => prev.map(achievement => {
            let newProgress = achievement.progress || 0;
            let earned = achievement.earned;

            switch (achievement.id) {
                case '1': // First Steps
                    newProgress = completedSkills.length;
                    earned = newProgress >= 1;
                    break;
                case '2': // Week Warrior
                    newProgress = stats.currentStreak;
                    earned = newProgress >= 7;
                    break;
                case '3': // Skill Master
                    newProgress = completedSkills.length;
                    earned = newProgress >= 5;
                    break;
                case '4': // Social Learner
                    newProgress = activities.filter(a => a.action === 'Shared').length;
                    earned = newProgress >= 3;
                    break;
                case '5': // Night Owl
                    const nightActivity = activities.find(a => {
                        const hour = new Date(a.timestamp).getHours();
                        return hour >= 22 || hour <= 2;
                    });
                    newProgress = nightActivity ? 1 : 0;
                    earned = newProgress >= 1;
                    break;
                case '6': // Bookworm
                    newProgress = bookmarkedSkills.length;
                    earned = newProgress >= 10;
                    break;
                case '7': // Speed Learner
                    const fastCompletion = completedSkills.find(cs => cs.timeSpent < 30);
                    newProgress = fastCompletion ? 1 : 0;
                    earned = newProgress >= 1;
                    break;
                case '8': // Dedicated Student
                    newProgress = Math.floor(stats.totalHours);
                    earned = newProgress >= 50;
                    break;
            }

            return {
                ...achievement,
                progress: newProgress,
                earned: earned,
                earnedDate: earned && !achievement.earned ? new Date().toISOString() : achievement.earnedDate
            };
        }));
    };

    const getSkillName = (skillId: string): string => {
        const skillNames: { [key: string]: string } = {
            'budgeting': 'Budgeting Basics',
            'speaking': 'Public Speaking',
            'cooking': 'Cooking Fundamentals',
            'photography': 'Digital Photography',
            'safety': 'Online Safety',
            'writing': 'Creative Writing',
            'time-management': 'Time Management',
            'coding': 'Web Development'
        };
        return skillNames[skillId] || 'Unknown Skill';
    };

    const isSkillCompleted = (skillId: string): boolean => {
        return completedSkills.some(cs => cs.skillId === skillId);
    };

    const isSkillBookmarked = (skillId: string): boolean => {
        return bookmarkedSkills.some(bs => bs.skillId === skillId);
    };

    const getSkillProgress = (skillId: string): { completed: number; total: number; percentage: number } => {
        const completion = completedSkills.find(cs => cs.skillId === skillId);
        if (!completion) return { completed: 0, total: 8, percentage: 0 };

        return {
            completed: completion.completedSteps.length,
            total: completion.totalSteps,
            percentage: Math.round((completion.completedSteps.length / completion.totalSteps) * 100)
        };
    };

    return (
        <UserDataContext.Provider value={{
            profile,
            stats,
            achievements,
            activities,
            bookmarkedSkills,
            completedSkills,
            updateProfile,
            completeSkill,
            bookmarkSkill,
            unbookmarkSkill,
            addActivity,
            updateStreak,
            isSkillCompleted,
            isSkillBookmarked,
            getSkillProgress
        }}>
            {children}
        </UserDataContext.Provider>
    );
};

export const useUserData = () => {
    const context = useContext(UserDataContext);
    if (context === undefined) {
        throw new Error('useUserData must be used within a UserDataProvider');
    }
    return context;
};
