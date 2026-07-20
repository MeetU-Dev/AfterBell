import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '../api/client';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'learning' | 'social' | 'achievement' | 'streak' | 'skill';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    requirement: {
        type: string;
        value: number;
        description: string;
    };
    unlockedAt?: string;
    progress?: number;
    unlocked?: boolean;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'learning' | 'social' | 'milestone' | 'special';
    requirement: {
        type: string;
        value: number;
        description: string;
    };
    unlockedAt?: string;
    progress?: number;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    xp: number;
    level: number;
    streak: number;
    badges: number;
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
    totalGamesPlayed: number;
    lastActivityDate: string;
}

interface EquippedBadgeInfo {
    id: string;
    name: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface GamificationContextType {
    userStats: UserStats;
    leaderboard: LeaderboardEntry[];
    recentBadges: Badge[];
    recentAchievements: Achievement[];
    loading: boolean;
    equippedBadge: EquippedBadgeInfo | null;
    addPoints: (points: number, reason: string, action: string) => Promise<any>;
    checkBadges: (action: string, value?: number) => Promise<Badge[]>;
    checkAchievements: (action: string, value?: number) => Promise<Achievement[]>;
    unlockBadge: (badgeId: string) => Promise<void>;
    updateStreak: () => Promise<void>;
    equipBadge: (badgeId: string | null) => Promise<void>;
    getLevelProgress: () => { current: number; next: number; percentage: number };
    getLeaderboardPosition: () => number;
    getBadgeById: (badgeId: string) => Badge | undefined;
    getUnlockedBadges: () => Badge[];
    getLockedBadges: () => Badge[];
    refreshProfile: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const BADGES: Badge[] = [];

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState<UserStats>({
        totalPoints: 0, level: 1, experience: 0, experienceToNext: 100,
        badges: [], achievements: [], currentStreak: 0, longestStreak: 0,
        totalSkillsCompleted: 0, totalGamesPlayed: 0,
        lastActivityDate: new Date().toISOString(),
    });

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [recentBadges, setRecentBadges] = useState<Badge[]>([]);
    const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
    const [equippedBadge, setEquippedBadge] = useState<EquippedBadgeInfo | null>(null);

    const refreshProfile = useCallback(async () => {
        if (!user) return;
        try {
            const res = await apiRequest('/api/v1/gamification/profile');
            const d = res.data;
            const nextLevelXp = d.level * 100;
            const currentLevelXp = (d.level - 1) * 100;
            const exp = d.xp - currentLevelXp;

            setUserStats({
                totalPoints: d.xp,
                level: d.level,
                experience: exp,
                experienceToNext: nextLevelXp - d.xp,
                badges: d.badges || [],
                achievements: d.achievements || [],
                currentStreak: d.currentStreak || 0,
                longestStreak: d.longestStreak || 0,
                totalSkillsCompleted: d.totalSkillsCompleted || 0,
                totalGamesPlayed: d.totalGamesPlayed || 0,
                lastActivityDate: d.lastActiveDate || new Date().toISOString(),
            });
            setEquippedBadge(d.equippedBadge || null);
        } catch {
            const saved = localStorage.getItem('afterbell_gamification_stats');
            if (saved) {
                try { setUserStats(JSON.parse(saved)); } catch {}
            }
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        refreshProfile();
    }, [refreshProfile]);

    useEffect(() => {
        if (user) {
            apiRequest('/api/v1/gamification/leaderboard').then(r => {
                if (r.data) setLeaderboard(r.data);
            }).catch(() => {});
            apiRequest('/api/v1/gamification/badges').then(r => {
                if (r.data) {
                    const unlocked: Badge[] = r.data.filter((b: any) => b.unlocked);
                    setRecentBadges(unlocked.slice(-3).reverse());
                }
            }).catch(() => {});
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('afterbell_gamification_stats', JSON.stringify(userStats));
    }, [userStats]);

    const addPoints = async (points: number, reason: string, action: string) => {
        try {
            const res = await apiRequest('/api/v1/gamification/award', {
                method: 'POST',
                body: JSON.stringify({ action }),
            });
            const d = res.data;
            const newTotal = d.totalXp || userStats.totalPoints + points;
            const newLevel = d.level || userStats.level;
            const nextLevelXp = newLevel * 100;
            const currentLevelXp = (newLevel - 1) * 100;

            setUserStats(prev => ({
                ...prev,
                totalPoints: newTotal,
                level: newLevel,
                experience: newTotal - currentLevelXp,
                experienceToNext: nextLevelXp - newTotal,
                currentStreak: d.currentStreak || prev.currentStreak,
            }));

            if (d.unlockedBadges?.length) {
                const newBadges = d.unlockedBadges.map((b: any) => ({
                    id: b.name || b.id,
                    name: b.name,
                    description: b.description,
                    icon: b.icon,
                    rarity: b.rarity,
                    category: b.category,
                    unlockedAt: b.unlockedAt,
                    requirement: { type: '', value: 0, description: '' },
                }));
                setRecentBadges(prev => [...newBadges, ...prev].slice(0, 3));
                setUserStats(prev => ({
                    ...prev,
                    badges: [...prev.badges, ...newBadges],
                }));
            }

            return { leveledUp: d.leveledUp, xpAwarded: d.xpAwarded, unlockedBadges: d.unlockedBadges };
        } catch {
            setUserStats(prev => {
                const newTotal = prev.totalPoints + points;
                const newLevel = Math.floor(newTotal / 100) + 1;
                return {
                    ...prev,
                    totalPoints: newTotal,
                    level: newLevel,
                    experience: newTotal % 100,
                    experienceToNext: 100 - (newTotal % 100),
                };
            });
            return { leveledUp: false, xpAwarded: points, unlockedBadges: [] };
        }
    };

    const checkBadges = async () => {
        try {
            const res = await apiRequest('/api/v1/gamification/badges');
            if (res.data) {
                const unlocked: Badge[] = res.data.filter((b: any) => b.unlocked);
                setRecentBadges(unlocked.slice(-3).reverse());
                return unlocked;
            }
        } catch {}
        return [];
    };

    const checkAchievements = async () => {
        return [];
    };

    const unlockBadge = async (badgeId: string) => {};

    const equipBadge = async (badgeId: string | null) => {
        try {
            const res = await apiRequest('/api/v1/gamification/equip-badge', {
                method: 'PUT',
                body: JSON.stringify({ badgeId }),
            });
            if (res.data) {
                setEquippedBadge(res.data.equippedBadge || null);
            }
        } catch {
            // Revert on failure — no-op, context stays in previous state
        }
    };

    const updateStreak = async () => {
        try {
            const res = await apiRequest('/api/v1/gamification/checkin', { method: 'POST' });
            const d = res.data;
            setUserStats(prev => ({
                ...prev,
                currentStreak: d.currentStreak || prev.currentStreak,
                longestStreak: d.longestStreak || prev.longestStreak,
                totalPoints: d.totalXp || prev.totalPoints,
                level: d.level || prev.level,
            }));
            if (d.unlockedBadges?.length) {
                const newBadges = d.unlockedBadges.map((b: any) => ({
                    id: b.name || b.id, name: b.name, description: b.description,
                    icon: b.icon, rarity: b.rarity, category: b.category, unlockedAt: b.unlockedAt,
                    requirement: { type: '', value: 0, description: '' },
                }));
                setRecentBadges(prev => [...newBadges, ...prev].slice(0, 3));
                setUserStats(prev => ({ ...prev, badges: [...prev.badges, ...newBadges] }));
            }
        } catch {}
    };

    const getLevelProgress = () => ({
        current: userStats.experience,
        next: userStats.experienceToNext,
        percentage: Math.min(100, (userStats.experience / 100) * 100),
    });

    const getLeaderboardPosition = () => {
        const pos = leaderboard.findIndex(e => e.userId === user?.id);
        return pos >= 0 ? pos + 1 : leaderboard.length + 1;
    };

    const getBadgeById = (badgeId: string) => userStats.badges.find(b => b.id === badgeId);

    const getUnlockedBadges = () => userStats.badges;
    const getLockedBadges = () => [];

    const value: GamificationContextType = {
        userStats, leaderboard, recentBadges, recentAchievements, loading,
        equippedBadge, addPoints, checkBadges, checkAchievements, unlockBadge,
        updateStreak, equipBadge, getLevelProgress, getLeaderboardPosition,
        getBadgeById, getUnlockedBadges, getLockedBadges, refreshProfile,
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) throw new Error('useGamification must be used within a GamificationProvider');
    return context;
};
