import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useGamification } from '../context/GamificationContext';
import { getApiUrl } from '../api/client';
import EquippedBadge from '../components/EquippedBadge';
import {
    FiUsers, FiBookOpen, FiAward, FiTrendingUp, FiClock, FiStar,
    FiCheckCircle, FiZap, FiActivity, FiBarChart, FiTarget, FiArrowUp, FiRefreshCw
} from 'react-icons/fi';

const AdminDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { stats, activities } = useUserData();
    const { equippedBadge } = useGamification();
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalSkills, setTotalSkills] = useState(0);
    const [recentSignups, setRecentSignups] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('afterbell_token');
            if (!token) return;
            const headers = { Authorization: `Bearer ${token}` };
            try {
                const [usersRes, skillsRes] = await Promise.all([
                    fetch(`${getApiUrl()}/api/v1/auth/users`, { headers }),
                    fetch(`${getApiUrl()}/api/v1/analytics/admin`, { headers }),
                ]);
                if (usersRes.ok) {
                    const u = await usersRes.json();
                    setTotalUsers(u.count || 0);
                    setRecentSignups(u.recent || []);
                }
                if (skillsRes.ok) {
                    const s = await skillsRes.json();
                    setTotalSkills(s.totalSkills || 0);
                }
            } catch {}
        };
        fetchStats();
    }, []);

    const statCards = useMemo(() => [
        { label: 'Total Users', value: totalUsers, icon: FiUsers, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-400' },
        { label: 'Skills Available', value: totalSkills || stats.totalSkills, icon: FiBookOpen, color: 'from-green-500 to-emerald-600', textColor: 'text-green-400' },
        { label: 'Completed Skills', value: stats.completedSkills, icon: FiCheckCircle, color: 'from-purple-500 to-pink-600', textColor: 'text-purple-400' },
        { label: 'Current Streak', value: `${stats.currentStreak}d`, icon: FiZap, color: 'from-orange-500 to-red-500', textColor: 'text-orange-400' },
        { label: 'Total Hours', value: Math.round(stats.totalHours), icon: FiClock, color: 'from-cyan-500 to-teal-500', textColor: 'text-cyan-400' },
        { label: 'Certificates Earned', value: stats.certificates, icon: FiAward, color: 'from-amber-500 to-yellow-500', textColor: 'text-amber-400' },
    ], [totalUsers, totalSkills, stats]);

    return (
        <div className="min-h-screen bg-[#0D1117] relative overflow-hidden pt-20">
            <div className="container mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                            <p className="text-slate-400 mt-1 flex items-center gap-2">
                                Welcome back, {user?.name}
                                {equippedBadge && <EquippedBadge icon={equippedBadge.icon} rarity={equippedBadge.rarity} size="xs" />}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <motion.button
                                onClick={() => navigate('/skills')}
                                className="px-4 py-2 bg-secondary-green/20 text-secondary-green border border-secondary-green/30 rounded-xl text-sm font-medium hover:bg-secondary-green/30 transition-all"
                                whileHover={{ scale: 1.05 }}
                            >
                                View Skills
                            </motion.button>
                            <motion.button
                                onClick={() => navigate('/parent/dashboard')}
                                className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-all"
                                whileHover={{ scale: 1.05 }}
                            >
                                Parent Dashboard
                            </motion.button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        {statCards.map((card, i) => (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                                    <card.icon className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
                                <p className="text-xs text-slate-400">{card.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50"
                        >
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <FiActivity className="w-5 h-5 text-secondary-green" />
                                Recent Activity
                            </h2>
                            {activities.length === 0 ? (
                                <p className="text-slate-400 text-sm">No activity yet. Start learning to see your progress here!</p>
                            ) : (
                                <div className="space-y-3">
                                    {activities.slice(0, 8).map((act) => (
                                        <div key={act.id || act.timestamp} className="flex items-center gap-3 p-2 bg-slate-700/20 rounded-lg">
                                            <div className="w-8 h-8 rounded-lg bg-secondary-green/20 flex items-center justify-center">
                                                {act.action === 'Completed' ? (
                                                    <FiCheckCircle className="w-4 h-4 text-green-400" />
                                                ) : act.action === 'Started' ? (
                                                    <FiTarget className="w-4 h-4 text-blue-400" />
                                                ) : (
                                                    <FiStar className="w-4 h-4 text-yellow-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white truncate">
                                                    <span className="text-secondary-green font-medium">{act.action}</span>
                                                    {' '}{act.skill}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(act.timestamp).toLocaleDateString()} — {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Quick Actions & Progress */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50"
                        >
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <FiZap className="w-5 h-5 text-amber-400" />
                                Quick Actions
                            </h2>

                            <div className="space-y-3 mb-6">
                                <motion.button
                                    onClick={() => navigate('/skills')}
                                    className="w-full flex items-center justify-between p-3 bg-secondary-green/10 border border-secondary-green/20 rounded-xl hover:bg-secondary-green/20 transition-all"
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <FiBookOpen className="w-5 h-5 text-secondary-green" />
                                        <span className="text-sm font-medium text-white">Browse All Skills</span>
                                    </div>
                                    <FiArrowUp className="w-4 h-4 text-secondary-green rotate-45" />
                                </motion.button>

                                <motion.button
                                    onClick={() => navigate('/stories')}
                                    className="w-full flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all"
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <FiStar className="w-5 h-5 text-purple-400" />
                                        <span className="text-sm font-medium text-white">Explore Stories</span>
                                    </div>
                                    <FiArrowUp className="w-4 h-4 text-purple-400 rotate-45" />
                                </motion.button>

                                <motion.button
                                    onClick={() => navigate('/analytics')}
                                    className="w-full flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all"
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <FiBarChart className="w-5 h-5 text-blue-400" />
                                        <span className="text-sm font-medium text-white">View Analytics</span>
                                    </div>
                                    <FiArrowUp className="w-4 h-4 text-blue-400 rotate-45" />
                                </motion.button>

                                <motion.button
                                    onClick={() => navigate('/badges')}
                                    className="w-full flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-all"
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <FiAward className="w-5 h-5 text-amber-400" />
                                        <span className="text-sm font-medium text-white">View Badges</span>
                                    </div>
                                    <FiArrowUp className="w-4 h-4 text-amber-400 rotate-45" />
                                </motion.button>
                            </div>

                            {/* Progress Overview */}
                            <div className="bg-slate-700/20 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <FiTarget className="w-4 h-4 text-secondary-green" />
                                    Progress Overview
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>Skills Completed</span>
                                            <span>{stats.completedSkills} / {stats.totalSkills}</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-secondary-green to-emerald-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((stats.completedSkills / Math.max(stats.totalSkills, 1)) * 100, 100)}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Streak</span>
                                        <span>{stats.currentStreak} days</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Certificates</span>
                                        <span>{stats.certificates}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;