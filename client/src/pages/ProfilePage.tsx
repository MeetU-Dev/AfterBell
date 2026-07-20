import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useGamification } from '../context/GamificationContext';
import { useToast } from '../context/ToastContext';
import { apiRequest } from '../api/client';
import MentalHealthDashboard from '../components/MentalHealthDashboard';
import {
    FiUser,
    FiMail,
    FiCalendar,
    FiAward,
    FiBookOpen,
    FiClock,
    FiTarget,
    FiSettings,
    FiEdit3,
    FiCamera,
    FiCheckCircle,
    FiStar,
    FiTrendingUp,
    FiHeart,
    FiShare2,
    FiBell,
    FiShield,
    FiLogOut,
    FiZap
} from 'react-icons/fi';

const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        profile,
        stats,
        achievements,
        activities,
        updateProfile,
        updateStreak
    } = useUserData();
    const { userStats } = useGamification();
    const [activeTab, setActiveTab] = useState('overview');
    const [badges, setBadges] = useState<any[]>([]);
    const [badgeTab, setBadgeTab] = useState<'all' | 'unlocked' | 'locked'>('all');
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        weeklyReports: true,
        publicProfile: false,
        darkMode: true,
        language: 'en'
    });
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        bio: '',
        location: ''
    });

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('user_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('user_settings', JSON.stringify(settings));
    }, [settings]);

    // Initialize edit data when profile loads
    useEffect(() => {
        if (profile) {
            setEditData({
                name: profile.name,
                email: profile.email,
                bio: profile.bio,
                location: profile.location
            });
        }
    }, [profile]);

    // Update streak on page load
    useEffect(() => {
        updateStreak();
    }, [updateStreak]);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const res = await apiRequest('/api/v1/gamification/badges');
                if (res.data) setBadges(res.data);
            } catch {}
        };
        fetchBadges();
    }, []);

    const rarityConfig: Record<string, { border: string; glow: string; label: string }> = {
        common: { border: 'border-slate-500/30', glow: 'shadow-slate-500/20', label: 'Common' },
        rare: { border: 'border-blue-500/40', glow: 'shadow-blue-500/30', label: 'Rare' },
        epic: { border: 'border-purple-500/40', glow: 'shadow-purple-500/30', label: 'Epic' },
        legendary: { border: 'border-amber-400/50', glow: 'shadow-amber-400/40', label: 'Legendary' },
    };

    const filteredBadges = badges.filter(b => {
        if (badgeTab === 'unlocked') return b.unlocked;
        if (badgeTab === 'locked') return !b.unlocked;
        return true;
    });

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiUser },
        { id: 'progress', label: 'Progress', icon: FiTrendingUp },
        { id: 'achievements', label: 'Achievements', icon: FiAward },
        { id: 'badges', label: 'Badges', icon: FiStar },
        { id: 'mental-health', label: 'Mental Health', icon: FiHeart },
        { id: 'settings', label: 'Settings', icon: FiSettings }
    ];

    const handleSave = async () => {
        if (profile) {
            try {
                await updateProfile({
                    name: editData.name,
                    email: editData.email,
                    bio: editData.bio,
                    location: editData.location
                });
                showToast('success', 'Profile Updated', 'Profile updated successfully!');
            } catch (error) {
                showToast('error', 'Update Failed', 'Failed to update profile');
            }
        }
        setIsEditing(false);
    };

    const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showToast('error', 'File Too Large', 'File size must be less than 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            showToast('error', 'Invalid File', 'Please select an image file');
            return;
        }

        setIsUploading(true);
        try {
            // Simulate upload process
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Convert to base64 and save to localStorage
            const reader = new FileReader();
            reader.onload = (e) => {
                const profilePictures = JSON.parse(localStorage.getItem('profile_pictures') || '{}');
                profilePictures[user?.id || ''] = e.target?.result as string;
                localStorage.setItem('profile_pictures', JSON.stringify(profilePictures));
                showToast('success', 'Picture Updated', 'Profile picture updated successfully!');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            showToast('error', 'Upload Failed', 'Failed to upload profile picture');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSettingsChange = (key: string, value: boolean | string) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
        showToast('success', 'Settings Updated', 'Settings updated!');
    };

    const handleExportData = () => {
        try {
            const userData = {
                profile,
                stats,
                achievements,
                activities,
                settings,
                exportedAt: new Date().toISOString()
            };

            const dataStr = JSON.stringify(userData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `afterbell-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showToast('success', 'Export Complete', 'Data exported successfully!');
        } catch (error) {
            showToast('error', 'Export Failed', 'Failed to export data');
        }
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // Clear all user data
            localStorage.removeItem('user_data');
            localStorage.removeItem('user_settings');
            localStorage.removeItem('profile_pictures');
            localStorage.removeItem('newsletter_subscribers');
            localStorage.removeItem('contact_messages');
            localStorage.removeItem('recent_searches');
            localStorage.removeItem('favorite_skills');

            showToast('success', 'Account Deleted', 'Account deleted successfully');
            logout();
        }
    };

    const handleLogout = () => {
        logout();
    };

    const formatTimeAgo = (timestamp: number): string => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const getIconComponent = (iconName: string) => {
        const icons: { [key: string]: any } = {
            'FiTarget': FiTarget,
            'FiTrendingUp': FiTrendingUp,
            'FiAward': FiAward,
            'FiShare2': FiShare2,
            'FiClock': FiClock,
            'FiHeart': FiHeart,
            'FiZap': FiZap
        };
        return icons[iconName] || FiAward;
    };

    const renderOverview = () => (
        <div className="space-y-4">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-slate-700/50"
            >
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                    {/* Profile Picture */}
                    <div className="relative">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-secondary-green to-emerald-600 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                            {profile?.name?.charAt(0) || 'U'}
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-7 h-7 md:w-8 md:h-8 bg-secondary-green rounded-full flex items-center justify-center text-white hover:bg-emerald-600 transition-colors">
                            <FiCamera className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1 text-white text-xl font-semibold"
                                />
                            ) : (
                                <h1 className="text-2xl font-bold text-white">{profile?.name || 'User'}</h1>
                            )}
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <FiEdit3 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center space-x-2 text-slate-300 mb-2">
                            <FiMail className="w-4 h-4" />
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1 text-white"
                                />
                            ) : (
                                <span>{profile?.email || ''}</span>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 text-slate-300 mb-4">
                            <FiCalendar className="w-4 h-4" />
                            <span>Joined {profile?.joinDate || 'Recently'}</span>
                        </div>

                        {isEditing && (
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-secondary-green text-white rounded-lg hover:bg-emerald-600 transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                    { label: 'Skills Completed', value: stats.completedSkills, icon: FiCheckCircle, color: 'text-green-400' },
                    { label: 'Learning Hours', value: Math.round(stats.totalHours), icon: FiClock, color: 'text-blue-400' },
                    { label: 'Current Streak', value: `${stats.currentStreak} days`, icon: FiTrendingUp, color: 'text-orange-400' },
                    { label: 'Certificates', value: stats.certificates, icon: FiAward, color: 'text-purple-400' }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-3 md:p-4 border border-slate-700/50 text-center"
                    >
                        <stat.icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 ${stat.color}`} />
                        <div className="text-xl md:text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs md:text-sm text-slate-400">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-slate-700/50"
            >
                <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4 flex items-center">
                    <FiClock className="w-4 h-4 md:w-5 md:h-5 mr-2 text-secondary-green" />
                    Recent Activity
                </h3>
                <div className="space-y-2 md:space-y-3">
                    {activities.slice(0, 5).map((activity) => {
                        const IconComponent = activity.action === 'Completed' ? FiCheckCircle :
                            activity.action === 'Started' ? FiBookOpen :
                                activity.action === 'Bookmarked' ? FiHeart :
                                    activity.action === 'Shared' ? FiShare2 : FiTarget;

                        return (
                            <div key={activity.id} className="flex items-center space-x-3 p-2 md:p-3 bg-slate-700/30 rounded-lg">
                                <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-secondary-green flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <span className="text-white font-medium text-sm md:text-base">{activity.action}</span>
                                    <span className="text-slate-300 ml-2 text-sm md:text-base truncate">{activity.skill}</span>
                                </div>
                                <span className="text-slate-400 text-xs md:text-sm flex-shrink-0">{formatTimeAgo(activity.timestamp)}</span>
                            </div>
                        );
                    })}
                    {activities.length === 0 && (
                        <div className="text-center text-slate-400 py-8">
                            No recent activity. Start learning to see your progress here!
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );

    const renderProgress = () => (
        <div className="space-y-6">
            {/* Progress Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50"
            >
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <FiTrendingUp className="w-5 h-5 mr-2 text-secondary-green" />
                    Learning Progress
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">{stats.completedSkills}</div>
                        <div className="text-slate-400">Completed Skills</div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                            <div
                                className="bg-secondary-green h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((stats.completedSkills / stats.totalSkills) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">{stats.inProgress}</div>
                        <div className="text-slate-400">In Progress</div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((stats.inProgress / stats.totalSkills) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">{Math.round(stats.totalHours)}</div>
                        <div className="text-slate-400">Total Hours</div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                            <div
                                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((stats.totalHours / 50) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Learning Streak */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50"
            >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <FiTarget className="w-5 h-5 mr-2 text-secondary-green" />
                    Learning Streak
                </h3>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-4xl font-bold text-white mb-2">{stats.currentStreak} days</div>
                        <div className="text-slate-400">Current streak</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-orange-400 mb-2">{stats.longestStreak} days</div>
                        <div className="text-slate-400">Longest streak</div>
                    </div>
                </div>

                <div className="mt-6 flex space-x-2">
                    {Array.from({ length: 7 }, (_, i) => (
                        <div
                            key={i}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${i < stats.currentStreak
                                ? 'bg-secondary-green text-white'
                                : 'bg-slate-700 text-slate-400'
                                }`}
                        >
                            <FiCheckCircle className="w-4 h-4" />
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );

    const renderAchievements = () => (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50"
            >
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <FiAward className="w-5 h-5 mr-2 text-secondary-green" />
                    Achievements
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => {
                        const IconComponent = getIconComponent(achievement.icon);
                        return (
                            <div
                                key={achievement.id}
                                className={`p-4 rounded-xl border transition-all duration-300 ${achievement.earned
                                    ? 'bg-slate-700/50 border-secondary-green/50'
                                    : 'bg-slate-800/30 border-slate-700/50 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${achievement.earned ? 'bg-secondary-green/20' : 'bg-slate-700/50'
                                        }`}>
                                        <IconComponent className={`w-5 h-5 ${achievement.earned ? 'text-secondary-green' : 'text-slate-400'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-semibold ${achievement.earned ? 'text-white' : 'text-slate-400'
                                            }`}>
                                            {achievement.title}
                                        </div>
                                        <div className="text-sm text-slate-400">{achievement.description}</div>
                                        {achievement.maxProgress && (
                                            <div className="mt-2">
                                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                    <span>{achievement.progress || 0}/{achievement.maxProgress}</span>
                                                    <span>{Math.round(((achievement.progress || 0) / achievement.maxProgress) * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-slate-700 rounded-full h-1">
                                                    <div
                                                        className="bg-secondary-green h-1 rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(((achievement.progress || 0) / achievement.maxProgress) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {achievement.earned && (
                                        <FiCheckCircle className="w-5 h-5 text-secondary-green" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );

    const renderBadges = () => (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50"
            >
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <FiStar className="w-5 h-5 mr-2 text-secondary-green" />
                    Badges
                </h3>

                {/* Stats bar */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-3 text-center">
                        <FiAward className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-white">{userStats?.badges?.length || 0}</p>
                        <p className="text-xs text-slate-400">Unlocked</p>
                    </div>
                    <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-3 text-center">
                        <FiZap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-white">{userStats?.totalPoints || 0}</p>
                        <p className="text-xs text-slate-400">Total XP</p>
                    </div>
                    <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-3 text-center">
                        <FiTrendingUp className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-white">{userStats?.currentStreak || 0}</p>
                        <p className="text-xs text-slate-400">Day Streak</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    {(['all', 'unlocked', 'locked'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setBadgeTab(t)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                badgeTab === t ? 'bg-secondary-green text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                            }`}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Badge grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredBadges.map((badge: any) => {
                        const rc = rarityConfig[badge.rarity] || rarityConfig.common;
                        return (
                            <motion.div
                                key={badge.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`relative bg-slate-700/30 border ${rc.border} rounded-xl p-4 text-center ${
                                    badge.unlocked ? rc.glow : 'opacity-60'
                                } shadow-lg`}
                            >
                                <div className={`text-3xl mb-2 ${badge.unlocked ? '' : 'grayscale'}`}>
                                    {badge.icon || '🏅'}
                                </div>
                                <p className="text-sm font-semibold text-white truncate">{badge.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{badge.description}</p>
                                {!badge.unlocked && (
                                    <div className="mt-2">
                                        <div className="h-1 bg-slate-600 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-secondary-green to-emerald-500 rounded-full transition-all"
                                                style={{ width: `${Math.min(badge.progress || 0, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1">{Math.min(badge.progress || 0, 100)}%</p>
                                    </div>
                                )}
                                {badge.unlocked && badge.unlockedAt && (
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        {new Date(badge.unlockedAt).toLocaleDateString()}
                                    </p>
                                )}
                                <span className={`absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 border ${rc.border} text-slate-400`}>
                                    {rc.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>

                {filteredBadges.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <FiAward className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>No badges found</p>
                    </div>
                )}
            </motion.div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-6">
            {/* Account Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50"
            >
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <FiSettings className="w-5 h-5 mr-2 text-secondary-green" />
                    Account Settings
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <FiBell className="w-5 h-5 text-slate-400" />
                            <div>
                                <div className="text-white font-medium">Email Notifications</div>
                                <div className="text-sm text-slate-400">Receive updates about your progress</div>
                            </div>
                        </div>
                        <button className="w-12 h-6 bg-secondary-green rounded-full relative">
                            <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <FiShield className="w-5 h-5 text-slate-400" />
                            <div>
                                <div className="text-white font-medium">Privacy Mode</div>
                                <div className="text-sm text-slate-400">Hide your progress from others</div>
                            </div>
                        </div>
                        <button className="w-12 h-6 bg-slate-600 rounded-full relative">
                            <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30"
            >
                <h3 className="text-xl font-semibold text-white mb-4">Danger Zone</h3>
                <div className="space-y-4">
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
                <div className="text-white text-xl">Loading profile...</div>
            </div>
        );
    }

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
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Profile</h1>
                        <p className="text-slate-400 text-sm md:text-base">Manage your account and track your learning progress</p>
                    </motion.div>

                    {/* Tab Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <div className="flex space-x-1 bg-slate-800/50 backdrop-blur-lg rounded-xl p-1 border border-slate-700/50">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-secondary-green text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Tab Content */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'progress' && renderProgress()}
                        {activeTab === 'achievements' && renderAchievements()}
                        {activeTab === 'badges' && renderBadges()}
                        {activeTab === 'mental-health' && <MentalHealthDashboard />}
                        {activeTab === 'settings' && renderSettings()}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;