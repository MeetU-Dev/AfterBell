import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useGamification } from '../context/GamificationContext';
import { useStories } from '../context/StoriesContext';
import { useToast } from '../context/ToastContext';
import { getApiUrl } from '../api/client';
import {
    FiTrendingUp,
    FiTarget,
    FiBookOpen,
    FiHeart,
    FiMessageCircle,
    FiStar,
    FiAward,
    FiCalendar,
    FiBarChart,
    FiPieChart,
    FiActivity,
    FiClock,
    FiUsers,
    FiZap,
    FiCheckCircle,
    FiEye,
    FiShare2,
    FiBookmark,
    FiDownload
} from 'react-icons/fi';

const AnalyticsPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { profile, stats, achievements, activities } = useUserData();
    const { userStats, getLevelProgress, getUnlockedBadges, getUnlockedAchievements } = useGamification();
    const { stories, comments, bookmarkedStories, likedStories } = useStories();
    const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year' | 'all'>('month');
    const [activeTab, setActiveTab] = useState<'overview' | 'learning' | 'social' | 'achievements'>('overview');
    const [isExporting, setIsExporting] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // Fetch analytics from backend API
    useEffect(() => {
        const fetchAnalytics = async () => {
            setAnalyticsLoading(true);
            try {
                const token = localStorage.getItem('afterbell_token');
                const headers: HeadersInit = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;
                const res = await fetch(`${getApiUrl()}/api/v1/analytics/dashboard?timeframe=${selectedTimeframe}`, { headers });
                const data = await res.json();
                if (data.success) setAnalyticsData(data.data);
            } catch {
                // API unavailable — use local data
            } finally {
                setAnalyticsLoading(false);
            }
        };
        fetchAnalytics();
    }, [selectedTimeframe]);

    // Calculate learning streak
    const calculateLearningStreak = (activities: any[]) => {
        if (activities.length === 0) return 0;
        const sortedActivities = activities
            .map(activity => new Date(activity.timestamp).toDateString())
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const uniqueDays = [...new Set(sortedActivities)];
        let streak = 0;
        const today = new Date().toDateString();
        for (let i = 0; i < uniqueDays.length; i++) {
            const day = new Date(uniqueDays[i]);
            const expectedDay = new Date(today);
            expectedDay.setDate(expectedDay.getDate() - i);
            if (day.toDateString() === expectedDay.toDateString()) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    // Derive analytics from API data with local fallbacks
    const apiData = useMemo(() => {
        if (analyticsData) return analyticsData;

        // Fallback: compute from local context
        const localLearningStreak = calculateLearningStreak(activities);
        const totalSessions = activities.length;
        const totalLearningTime = totalSessions * 30;
        const dayCounts: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
        for (const a of activities) {
            const dn = new Date(a.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
            if (dayCounts[dn] !== undefined) dayCounts[dn]++;
        }
        const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mon';
        const maxCount = Math.max(...Object.values(dayCounts), 1);
        const days7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const localStreakData = days7.map(day => ({ day, value: dayCounts[day] === 0 ? 0 : Math.max(0.1, dayCounts[day] / maxCount) }));

        const categoryMap: Record<string, number> = {};
        for (const a of activities) {
            if (a.skillId) categoryMap[a.skillId] = (categoryMap[a.skillId] || 0) + 1;
        }
        const skillTotals: Record<string, number> = { Communication: 5, Cooking: 4, Finance: 6, Art: 3, Digital: 4, 'Mental Health': 4, Relationships: 5, 'Life Skills': 6 };
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500'];
        const localSkillCategories = Object.entries(skillTotals).map(([name, total], i) => ({
            name, completed: categoryMap[name.toLowerCase()] || 0, total, color: colors[i % colors.length],
        }));

        const localRecent = activities.slice(0, 10).map(a => a);

        const localInsights = [];
        if (localLearningStreak > 7) localInsights.push({ type: 'success', message: `Amazing! You've maintained a ${localLearningStreak}-day learning streak!` });
        if (totalLearningTime > 300) localInsights.push({ type: 'info', message: `You've spent ${Math.round(totalLearningTime / 60)} hours learning this ${selectedTimeframe}!` });
        localInsights.push({ type: 'tip', message: `Your most productive day is ${mostActiveDay}. Keep it up!` });

        return {
            learningMetrics: {
                learningStreak: localLearningStreak,
                totalSessions,
                totalLearningTime,
                averageSessionTime: totalSessions > 0 ? Math.round((totalLearningTime / totalSessions) * 10) / 10 : 0,
                mostActiveDay,
            },
            streakData: localStreakData,
            skillCategories: localSkillCategories,
            activityTimeline: [],
            completionTimeline: [],
            recentActivities: localRecent,
            productivityInsights: localInsights,
            levelProgress: { current: 0, next: 100, percentage: 0 },
            userStats: { xp: 0, level: 1, currentStreak: stats.currentStreak, longestStreak: stats.longestStreak, totalPoints: 0, totalSkillsCompleted: stats.completedSkills, totalGamesPlayed: 0, ...userStats },
            stats: { completedSkills: stats.completedSkills, bookmarked: stats.bookmarked, totalHours: Math.round(stats.totalHours) },
        };
    }, [analyticsData, activities, stats, selectedTimeframe, userStats]);

    const levelProgress = getLevelProgress();
    const unlockedBadges = getUnlockedBadges();
    const unlockedAchievements = getUnlockedAchievements();

    // Real data processing with time filtering
    const filteredData = useMemo(() => {
        const now = new Date();
        const filterDate = new Date();

        switch (selectedTimeframe) {
            case 'week':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                filterDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                filterDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                filterDate.setFullYear(2020); // All time
        }

        return {
            activities: activities.filter(activity => new Date(activity.timestamp) >= filterDate),
            stories: stories.filter(story => new Date(story.createdAt) >= filterDate),
            comments: comments.filter(comment => new Date(comment.createdAt) >= filterDate)
        };
    }, [selectedTimeframe, activities, stories, comments]);

    // Calculate additional stats with real data
    const totalStoriesShared = filteredData.stories.filter(story => story.authorId === user?.id).length;
    const totalCommentsMade = filteredData.comments.filter(comment => comment.authorId === user?.id).length;
    const totalBookmarks = bookmarkedStories.length;
    const totalLikes = likedStories.length;
    const averageRating = filteredData.stories
        .filter(story => story.authorId === user?.id)
        .reduce((acc, story) => acc + story.rating, 0) / Math.max(totalStoriesShared, 1);

    // Learning activity over time
    const learningActivityData = useMemo(() => {
        const activityMap = new Map();
        filteredData.activities.forEach(activity => {
            const date = new Date(activity.timestamp).toDateString();
            activityMap.set(date, (activityMap.get(date) || 0) + 1);
        });
        return Array.from(activityMap.entries()).map(([date, count]) => ({ date, count }));
    }, [filteredData.activities]);

    // Skill completion data
    const skillCompletionData = useMemo(() => {
        const skillMap = new Map();
        filteredData.activities
            .filter(activity => activity.action === 'Completed')
            .forEach(activity => {
                skillMap.set(activity.skillId, (skillMap.get(activity.skillId) || 0) + 1);
            });
        return Array.from(skillMap.entries()).map(([skill, count]) => ({ skill, count }));
    }, [filteredData.activities]);

    // Refresh analytics data
    const handleRefreshData = () => {
        setLastUpdated(new Date());
        showToast('Analytics data refreshed!', 'success');
    };

    // Export analytics data with comprehensive real data
    const handleExportAnalytics = async () => {
        setIsExporting(true);
        try {
            const analyticsData = {
                exportInfo: {
                    timeframe: selectedTimeframe,
                    generatedAt: new Date().toISOString(),
                    lastUpdated: lastUpdated.toISOString(),
                    totalRecords: filteredData.activities.length
                },
                overview: {
                    totalStoriesShared,
                    totalCommentsMade,
                    totalBookmarks,
                    totalLikes,
                    averageRating: averageRating.toFixed(2),
                    learningStreak: learningMetrics.learningStreak,
                    totalLearningTime: learningMetrics.totalLearningTime,
                    mostActiveDay: learningMetrics.mostActiveDay
                },
                learningMetrics: {
                    totalSessions: learningMetrics.totalSessions,
                    averageSessionTime: learningMetrics.averageSessionTime,
                    streakData,
                    skillCategories,
                    learningActivityData,
                    skillCompletionData
                },
                socialMetrics: {
                    storiesShared: totalStoriesShared,
                    commentsMade: totalCommentsMade,
                    bookmarks: totalBookmarks,
                    likes: totalLikes,
                    averageRating: averageRating
                },
                achievements: {
                    unlocked: unlockedAchievements,
                    badges: unlockedBadges,
                    levelProgress,
                    userStats
                },
                productivityInsights,
                rawData: {
                    activities: filteredData.activities,
                    stories: filteredData.stories,
                    comments: filteredData.comments
                }
            };

            const dataStr = JSON.stringify(analyticsData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `analytics-${selectedTimeframe}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showToast('Comprehensive analytics data exported successfully!', 'success');
        } catch (error) {
            showToast('Failed to export analytics data', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    // Real learning streak data based on actual activities
    const streakData = useMemo(() => apiData.streakData, [apiData]);

    // Real skill completion data based on actual skill progress
    const skillCategories = useMemo(() => apiData.skillCategories, [apiData]);

    // Real activity timeline with actual data
    const recentActivities = useMemo(() => apiData.recentActivities, [apiData]);

    // Real learning metrics
    const learningMetrics = useMemo(() => apiData.learningMetrics, [apiData]);

    // Real productivity insights
    const productivityInsights = useMemo(() => apiData.productivityInsights, [apiData]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiBarChart },
        { id: 'learning', label: 'Learning', icon: FiBookOpen },
        { id: 'social', label: 'Social', icon: FiUsers },
        { id: 'achievements', label: 'Achievements', icon: FiAward }
    ];

    const StatCard: React.FC<{
        title: string;
        value: string | number;
        change?: string;
        icon: React.ReactNode;
        color: string;
        trend?: 'up' | 'down' | 'neutral';
    }> = ({ title, value, change, icon, color, trend = 'neutral' }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    {icon}
                </div>
                {change && (
                    <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-400' :
                        trend === 'down' ? 'text-red-400' :
                            'text-slate-400'
                        }`}>
                        <FiTrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
                        <span>{change}</span>
                    </div>
                )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
            <p className="text-slate-400 text-sm">{title}</p>
        </motion.div>
    );

    const ProgressBar: React.FC<{
        label: string;
        current: number;
        total: number;
        color: string;
    }> = ({ label, current, total, color }) => {
        const percentage = (current / total) * 100;
        return (
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300 text-sm">{label}</span>
                    <span className="text-slate-400 text-sm">{current}/{total}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-2 rounded-full ${color}`}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0D1117] relative overflow-hidden">
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="fixed inset-0 w-full h-full object-cover opacity-20 z-0"
            >
                <source src="/Afterbell-bg.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Background overlay */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 z-0" />

            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-secondary-green/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 pt-20 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Learning Analytics</h1>
                                <p className="text-slate-400 text-sm md:text-base">Track your progress and discover insights about your learning journey</p>
                                <p className="text-slate-500 text-xs mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
                            </div>
                            <div className="flex space-x-3 mt-4 md:mt-0">
                                <motion.button
                                    onClick={handleRefreshData}
                                    className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center space-x-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiActivity className="w-4 h-4" />
                                    <span>Refresh</span>
                                </motion.button>
                                <motion.button
                                    onClick={handleExportAnalytics}
                                    disabled={isExporting}
                                    className={`px-4 py-2 bg-secondary-green text-white rounded-lg transition-all duration-300 flex items-center space-x-2 ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                                    whileHover={!isExporting ? { scale: 1.05 } : {}}
                                    whileTap={!isExporting ? { scale: 0.95 } : {}}
                                >
                                    {isExporting ? (
                                        <>
                                            <FiActivity className="w-4 h-4 animate-spin" />
                                            <span>Exporting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiDownload className="w-4 h-4" />
                                            <span>Export Data</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Timeframe Selector */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <div className="flex space-x-2">
                            {(['week', 'month', 'year', 'all'] as const).map((timeframe) => (
                                <button
                                    key={timeframe}
                                    onClick={() => setSelectedTimeframe(timeframe)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${selectedTimeframe === timeframe
                                        ? 'bg-secondary-green text-white'
                                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                        }`}
                                >
                                    {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Tab Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <div className="flex space-x-1 bg-slate-800/50 backdrop-blur-lg rounded-xl p-1 border border-slate-700/50">
                            {tabs.map((tab) => {
                                const IconComponent = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === tab.id
                                            ? 'bg-secondary-green text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Real Learning Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Learning Streak"
                                    value={`${learningMetrics.learningStreak} days`}
                                    icon={<FiZap className="w-6 h-6 text-white" />}
                                    color="bg-gradient-to-br from-yellow-500 to-orange-500"
                                    trend={learningMetrics.learningStreak > 7 ? 'up' : 'neutral'}
                                />
                                <StatCard
                                    title="Total Learning Time"
                                    value={`${Math.round(learningMetrics.totalLearningTime / 60)}h`}
                                    icon={<FiClock className="w-6 h-6 text-white" />}
                                    color="bg-gradient-to-br from-blue-500 to-cyan-500"
                                    trend="up"
                                />
                                <StatCard
                                    title="Learning Sessions"
                                    value={learningMetrics.totalSessions}
                                    icon={<FiBookOpen className="w-6 h-6 text-white" />}
                                    color="bg-gradient-to-br from-green-500 to-emerald-500"
                                    trend="up"
                                />
                                <StatCard
                                    title="Most Active Day"
                                    value={learningMetrics.mostActiveDay}
                                    icon={<FiCalendar className="w-6 h-6 text-white" />}
                                    color="bg-gradient-to-br from-purple-500 to-pink-500"
                                />
                            </div>

                            {/* Productivity Insights */}
                            {productivityInsights.length > 0 && (
                                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                                    <h2 className="text-xl font-bold text-white mb-4">Productivity Insights</h2>
                                    <div className="space-y-3">
                                        {productivityInsights.map((insight, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className={`p-4 rounded-lg border-l-4 ${insight.type === 'success' ? 'bg-green-500/10 border-green-500' :
                                                    insight.type === 'info' ? 'bg-blue-500/10 border-blue-500' :
                                                        insight.type === 'achievement' ? 'bg-yellow-500/10 border-yellow-500' :
                                                            'bg-purple-500/10 border-purple-500'
                                                    }`}
                                            >
                                                <p className="text-slate-300">{insight.message}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Level Progress */}
                            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white">Level Progress</h2>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-secondary-green">Level {userStats.level}</div>
                                        <div className="text-slate-400 text-sm">{userStats.totalPoints} points</div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-300 text-sm">Experience</span>
                                        <span className="text-slate-400 text-sm">{levelProgress.current}/{levelProgress.next}</span>
                                    </div>
                                    <div className="w-full bg-slate-700/50 rounded-full h-3">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${levelProgress.percentage}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="h-3 rounded-full bg-gradient-to-r from-secondary-green to-emerald-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Skills Completed"
                                    value={stats.completedSkills}
                                    change="+2 this week"
                                    icon={<FiTarget className="w-6 h-6 text-white" />}
                                    color="bg-blue-500/20"
                                    trend="up"
                                />
                                <StatCard
                                    title="Stories Shared"
                                    value={totalStoriesShared}
                                    change="+1 this week"
                                    icon={<FiShare2 className="w-6 h-6 text-white" />}
                                    color="bg-green-500/20"
                                    trend="up"
                                />
                                <StatCard
                                    title="Comments Made"
                                    value={totalCommentsMade}
                                    change="+5 this week"
                                    icon={<FiMessageCircle className="w-6 h-6 text-white" />}
                                    color="bg-purple-500/20"
                                    trend="up"
                                />
                                <StatCard
                                    title="Learning Streak"
                                    value={`${userStats.currentStreak} days`}
                                    change="Keep it up!"
                                    icon={<FiZap className="w-6 h-6 text-white" />}
                                    color="bg-orange-500/20"
                                    trend="up"
                                />
                            </div>

                            {/* Learning Streak Chart */}
                            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-bold text-white mb-4">Learning Streak</h3>
                                <div className="flex items-end space-x-2 h-32 overflow-hidden">
                                    {streakData.map((day, index) => {
                                        // Ensure the height is properly constrained and not causing full-height bars
                                        const maxHeight = Math.max(day.value * 100, 5); // Minimum 5% height for visibility
                                        const constrainedHeight = Math.min(maxHeight, 100); // Maximum 100% height

                                        return (
                                            <motion.div
                                                key={day.day}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${constrainedHeight}%` }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                className={`w-full rounded-t-lg transition-all duration-300 ${day.value > 0
                                                        ? 'bg-gradient-to-t from-secondary-green to-green-400'
                                                        : 'bg-slate-700/50'
                                                    }`}
                                                style={{
                                                    minHeight: '4px', // Ensure minimum visible height
                                                    maxHeight: '100%' // Prevent overflow
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between mt-4 text-slate-400 text-sm">
                                    {streakData.map((day) => (
                                        <span key={day.day}>{day.day}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Learning Tab */}
                    {activeTab === 'learning' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Skill Categories Progress */}
                            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-bold text-white mb-6">Skill Categories Progress</h3>
                                {skillCategories.map((category, index) => (
                                    <motion.div
                                        key={category.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <ProgressBar
                                            label={category.name}
                                            current={category.completed}
                                            total={category.total}
                                            color={category.color}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Learning Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Total Learning Hours"
                                    value={Math.round(stats.totalHours)}
                                    change="+5h this week"
                                    icon={<FiClock className="w-6 h-6 text-white" />}
                                    color="bg-blue-500/20"
                                    trend="up"
                                />
                                <StatCard
                                    title="Average Rating"
                                    value={averageRating.toFixed(1)}
                                    change="+0.2 this month"
                                    icon={<FiStar className="w-6 h-6 text-white" />}
                                    color="bg-yellow-500/20"
                                    trend="up"
                                />
                                <StatCard
                                    title="Certificates Earned"
                                    value={stats.certificates}
                                    change="+1 this month"
                                    icon={<FiAward className="w-6 h-6 text-white" />}
                                    color="bg-purple-500/20"
                                    trend="up"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Social Tab */}
                    {activeTab === 'social' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Social Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Stories Liked"
                                    value={totalLikes}
                                    change="+12 this week"
                                    icon={<FiHeart className="w-6 h-6 text-white" />}
                                    color="bg-red-500/20"
                                    trend="up"
                                />
                                <StatCard
                                    title="Stories Bookmarked"
                                    value={totalBookmarks}
                                    change="+3 this week"
                                    icon={<FiBookmark className="w-6 h-6 text-white" />}
                                    color="bg-yellow-500/20"
                                    trend="up"
                                />
                                <StatCard
                                    title="Comments Made"
                                    value={totalCommentsMade}
                                    change="+8 this week"
                                    icon={<FiMessageCircle className="w-6 h-6 text-white" />}
                                    color="bg-blue-500/20"
                                    trend="up"
                                />
                                <StatCard
                                    title="Stories Shared"
                                    value={totalStoriesShared}
                                    change="+1 this week"
                                    icon={<FiShare2 className="w-6 h-6 text-white" />}
                                    color="bg-green-500/20"
                                    trend="up"
                                />
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                                <div className="space-y-3">
                                    {recentActivities.map((activity, index) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg"
                                        >
                                            <div className="p-2 bg-secondary-green/20 rounded-lg">
                                                <FiActivity className="w-4 h-4 text-secondary-green" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-white font-medium">{activity.action}</span>
                                                <span className="text-slate-300 ml-2">{activity.skill}</span>
                                            </div>
                                            <span className="text-slate-400 text-sm">
                                                {new Date(activity.timestamp).toLocaleDateString()}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Achievements Tab */}
                    {activeTab === 'achievements' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Achievement Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Badges Earned"
                                    value={unlockedBadges.length}
                                    change="+2 this month"
                                    icon={<FiAward className="w-6 h-6 text-white" />}
                                    color="bg-yellow-500/20"
                                    trend="up"
                                />
                                <StatCard
                                    title="Achievements"
                                    value={unlockedAchievements.length}
                                    change="+1 this month"
                                    icon={<FiCheckCircle className="w-6 h-6 text-white" />}
                                    color="bg-green-500/20"
                                    trend="up"
                                />
                                <StatCard
                                    title="Total Points"
                                    value={userStats.totalPoints}
                                    change="+150 this month"
                                    icon={<FiZap className="w-6 h-6 text-white" />}
                                    color="bg-purple-500/20"
                                    trend="up"
                                />
                            </div>

                            {/* Recent Badges */}
                            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-bold text-white mb-4">Recent Badges</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {unlockedBadges.slice(0, 6).map((badge, index) => (
                                        <motion.div
                                            key={badge.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50"
                                        >
                                            <div className="text-3xl mb-2">{badge.icon}</div>
                                            <h4 className="font-semibold text-white mb-1">{badge.name}</h4>
                                            <p className="text-slate-400 text-sm mb-2">{badge.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-slate-500 capitalize">{badge.rarity}</span>
                                                <span className="text-xs text-secondary-green">+{badge.points} pts</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Achievements */}
                            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-bold text-white mb-4">Recent Achievements</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {unlockedAchievements.slice(0, 4).map((achievement, index) => (
                                        <motion.div
                                            key={achievement.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="text-2xl">{achievement.icon}</div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-white mb-1">{achievement.name}</h4>
                                                    <p className="text-slate-400 text-sm mb-2">{achievement.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-slate-500 capitalize">{achievement.category}</span>
                                                        <span className="text-xs text-secondary-green">+{achievement.points} pts</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
