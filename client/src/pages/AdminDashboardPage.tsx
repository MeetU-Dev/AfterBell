import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useGamification } from '../context/GamificationContext';
import { useToast } from '../context/ToastContext';
import { getApiUrl } from '../api/client';
import EquippedBadge from '../components/EquippedBadge';
import {
    FiUsers, FiBookOpen, FiAward, FiTrendingUp, FiClock, FiStar,
    FiCheckCircle, FiZap, FiActivity, FiBarChart, FiTarget, FiArrowUp, FiRefreshCw,
    FiEdit3, FiTrash2, FiPlus, FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight,
    FiPlay, FiVideo, FiShield, FiUserCheck, FiAlertCircle, FiServer,
    FiGrid, FiLayers, FiBriefcase, FiSliders, FiList, FiSave, FiEye
} from 'react-icons/fi';

const api = async (url: string, options?: RequestInit) => {
    const token = localStorage.getItem('afterbell_token');
    const res = await fetch(`${getApiUrl()}${url}`, {
        ...options,
        headers: {
            ...options?.headers,
            Authorization: `Bearer ${token}`,
            ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || res.statusText || 'Request failed');
    return data;
};

const extractYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
};

const ConfirmModal: React.FC<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    variant?: 'danger' | 'primary';
    loading?: boolean;
}> = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', variant = 'danger', loading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-700/60 text-slate-300 hover:bg-slate-700 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-all ${
                            variant === 'danger'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-secondary-green hover:bg-emerald-600'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const AdminDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { stats } = useUserData();
    const { equippedBadge } = useGamification();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiActivity },
        { id: 'content-health', label: 'Content Health', icon: FiVideo },
        { id: 'skills', label: 'Skills', icon: FiBookOpen },
        { id: 'categories', label: 'Categories', icon: FiGrid },
        { id: 'partners', label: 'Partners', icon: FiBriefcase },
        { id: 'users', label: 'Users', icon: FiUsers },
        { id: 'ops', label: 'Ops', icon: FiSliders },
    ];

    // ─── Overview ──────────────────────────────────────────────
    const [analytics, setAnalytics] = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const res = await api('/api/v1/analytics/admin');
            setAnalytics(res.data || res);
        } catch (e: any) {
            toast.showToast('error', 'Failed to load analytics', e.message);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'overview') fetchAnalytics();
    }, [activeTab]);

    const renderOverview = () => {
        const users = analytics?.users || {};
        const activity = analytics?.activity || {};
        const overviewCards = [
            { label: 'Total Users', value: users.total ?? '—', icon: FiUsers, color: 'from-blue-500 to-blue-600' },
            { label: 'Teens', value: users.teens ?? '—', icon: FiStar, color: 'from-purple-500 to-pink-600' },
            { label: 'Parents', value: users.parents ?? '—', icon: FiUsers, color: 'from-teal-500 to-cyan-600' },
            { label: 'Active Users (7d)', value: activity.activeUsers ?? '—', icon: FiActivity, color: 'from-green-500 to-emerald-600' },
            { label: 'Total Completions', value: activity.totalCompletions ?? '—', icon: FiCheckCircle, color: 'from-amber-500 to-orange-600' },
            { label: 'New Today', value: users.newToday ?? '—', icon: FiZap, color: 'from-cyan-500 to-blue-600' },
        ];

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {analyticsLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-secondary-green border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {overviewCards.map((card, i) => (
                                <motion.div
                                    key={card.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.06 }}
                                    className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 border border-slate-700/50"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                                        <card.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
                                    <p className="text-xs text-slate-400">{card.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <FiActivity className="w-5 h-5 text-secondary-green" />
                                Activity Summary
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Activities', value: activity.totalActivities ?? '—', icon: FiBarChart },
                                    { label: 'Total Bookmarks', value: activity.totalBookmarks ?? '—', icon: FiStar },
                                    { label: 'Completions', value: activity.totalCompletions ?? '—', icon: FiCheckCircle },
                                    { label: 'Active Users', value: activity.activeUsers ?? '—', icon: FiUserCheck },
                                ].map((item) => (
                                    <div key={item.label} className="p-3 bg-slate-700/20 rounded-xl">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                            <item.icon className="w-3.5 h-3.5" />
                                            {item.label}
                                        </div>
                                        <p className="text-xl font-bold text-white">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        );
    };

    // ─── Content Health ────────────────────────────────────────
    const [allSkills, setAllSkills] = useState<any[]>([]);
    const [skillsLoading, setSkillsLoading] = useState(false);
    const [videoCheckResults, setVideoCheckResults] = useState<any[]>([]);
    const [videoCheckLoading, setVideoCheckLoading] = useState(false);
    const [videoSortBy, setVideoSortBy] = useState<string | null>(null);
    const [videoSortAsc, setVideoSortAsc] = useState(true);

    const fetchAllSkills = async () => {
        setSkillsLoading(true);
        try {
            const res = await api('/api/v1/skills?limit=100');
            const list = res.data || res.skills || res || [];
            setAllSkills(Array.isArray(list) ? list : []);
        } catch (e: any) {
            toast.showToast('error', 'Failed to load skills', e.message);
        } finally {
            setSkillsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'content-health') fetchAllSkills();
    }, [activeTab]);

    const duplicates = useMemo(() => {
        const groups: Record<string, any[]> = {};
        for (const skill of allSkills) {
            const id = extractYoutubeId(skill.videoUrl);
            if (id) {
                if (!groups[id]) groups[id] = [];
                groups[id].push(skill);
            }
        }
        return Object.entries(groups).filter(([, skills]) => skills.length > 1);
    }, [allSkills]);

    const runVideoCheck = async () => {
        setVideoCheckLoading(true);
        setVideoCheckResults([]);
        try {
            const res = await api('/api/v1/skills/check-videos', { method: 'POST' });
            const results = res.data || res.results || res;
            setVideoCheckResults(Array.isArray(results) ? results : []);
            toast.showToast('success', 'Video check complete', `${Array.isArray(results) ? results.length : 0} videos verified`);
            fetchAllSkills();
        } catch (e: any) {
            toast.showToast('error', 'Video check failed', e.message);
        } finally {
            setVideoCheckLoading(false);
        }
    };

    const sortedVideoResults = useMemo(() => {
        if (!videoSortBy) return videoCheckResults;
        return [...videoCheckResults].sort((a, b) => {
            const aVal = (a[videoSortBy] || '').toString().toLowerCase();
            const bVal = (b[videoSortBy] || '').toString().toLowerCase();
            return videoSortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
    }, [videoCheckResults, videoSortBy, videoSortAsc]);

    const handleVideoSort = (col: string) => {
        if (videoSortBy === col) {
            setVideoSortAsc(!videoSortAsc);
        } else {
            setVideoSortBy(col);
            setVideoSortAsc(true);
        }
    };

    const renderContentHealth = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Duplicate Video Detector */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FiVideo className="w-5 h-5 text-secondary-green" />
                    Duplicate Video Detector
                </h2>
                {skillsLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-secondary-green border-t-transparent rounded-full" />
                    </div>
                ) : duplicates.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <FiCheckCircle className="w-5 h-5" />
                        <span className="text-sm">No duplicate videos detected — all video URLs are unique!</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-slate-400 uppercase">
                                    <th className="text-left py-2 px-3">Video URL</th>
                                    <th className="text-left py-2 px-3">Times Used</th>
                                    <th className="text-left py-2 px-3">Skill Titles</th>
                                    <th className="text-left py-2 px-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {duplicates.map(([youtubeId, skills]) => (
                                    <tr key={youtubeId} className="border-t border-slate-700/30">
                                        <td className="py-2 px-3 text-sm text-slate-300 truncate max-w-[200px]">
                                            {skills[0].videoUrl}
                                        </td>
                                        <td className="py-2 px-3 text-sm text-white">{skills.length}</td>
                                        <td className="py-2 px-3 text-sm text-slate-300">
                                            {skills.map((s: any) => s.title).join(', ')}
                                        </td>
                                        <td className="py-2 px-3">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                                                Duplicate
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Embed Health Checker */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FiShield className="w-5 h-5 text-secondary-green" />
                        Embed Health Checker
                    </h2>
                    <motion.button
                        onClick={runVideoCheck}
                        disabled={videoCheckLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary-green/10 border border-secondary-green/30 rounded-xl text-sm font-medium text-secondary-green hover:bg-secondary-green/20 transition-all"
                        whileHover={{ scale: 1.02 }}
                    >
                        {videoCheckLoading ? (
                            <div className="animate-spin w-4 h-4 border-2 border-secondary-green border-t-transparent rounded-full" />
                        ) : (
                            <FiRefreshCw className="w-4 h-4" />
                        )}
                        {videoCheckLoading ? 'Checking...' : 'Verify All Videos'}
                    </motion.button>
                </div>

                {videoCheckResults.length > 0 && (
                    <>
                        <div className="flex gap-4 mb-4">
                            {[
                                { label: 'OK', count: videoCheckResults.filter((r) => r.status === 'ok' || r.status === '✅').length, color: 'text-green-400' },
                                { label: 'Not Found', count: videoCheckResults.filter((r) => r.status === 'not_found' || r.status === '❌').length, color: 'text-red-400' },
                                { label: 'Error', count: videoCheckResults.filter((r) => r.status === 'error' || r.status === '⚠️').length, color: 'text-yellow-400' },
                            ].map((s) => (
                                <div key={s.label} className={`text-sm ${s.color}`}>
                                    {s.label}: <span className="font-bold">{s.count}</span>
                                </div>
                            ))}
                        </div>
                        <div className="overflow-x-auto max-h-64 overflow-y-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-xs text-slate-400 uppercase">
                                        <th className="text-left py-2 px-3 cursor-pointer hover:text-white" onClick={() => handleVideoSort('skillTitle')}>
                                            Skill Title {videoSortBy === 'skillTitle' ? (videoSortAsc ? '▲' : '▼') : ''}
                                        </th>
                                        <th className="text-left py-2 px-3 cursor-pointer hover:text-white" onClick={() => handleVideoSort('videoUrl')}>
                                            Video URL {videoSortBy === 'videoUrl' ? (videoSortAsc ? '▲' : '▼') : ''}
                                        </th>
                                        <th className="text-left py-2 px-3 cursor-pointer hover:text-white" onClick={() => handleVideoSort('status')}>
                                            Status {videoSortBy === 'status' ? (videoSortAsc ? '▲' : '▼') : ''}
                                        </th>
                                        <th className="text-left py-2 px-3 cursor-pointer hover:text-white" onClick={() => handleVideoSort('lastChecked')}>
                                            Last Checked {videoSortBy === 'lastChecked' ? (videoSortAsc ? '▲' : '▼') : ''}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedVideoResults.map((r, i) => {
                                        let statusIcon = '⚠️';
                                        let statusColor = 'text-yellow-400';
                                        if (r.status === 'ok' || r.status === '✅') {
                                            statusIcon = '✅';
                                            statusColor = 'text-green-400';
                                        } else if (r.status === 'not_found' || r.status === '❌') {
                                            statusIcon = '❌';
                                            statusColor = 'text-red-400';
                                        }
                                        return (
                                            <tr key={r._id || i} className="border-t border-slate-700/30">
                                                <td className="py-2 px-3 text-sm text-white">{r.skillTitle || r.title || '—'}</td>
                                                <td className="py-2 px-3 text-sm text-slate-300 truncate max-w-[200px]">{r.videoUrl || '—'}</td>
                                                <td className={`py-2 px-3 text-sm ${statusColor}`}>{statusIcon} {r.status}</td>
                                                <td className="py-2 px-3 text-sm text-slate-400">{r.lastChecked ? new Date(r.lastChecked).toLocaleString() : '—'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                {videoCheckResults.length === 0 && !videoCheckLoading && (
                    <p className="text-sm text-slate-400">Click "Verify All Videos" to check embed health.</p>
                )}
            </div>
        </motion.div>
    );

    // ─── Skills Tab ────────────────────────────────────────────
    const [skillsList, setSkillsList] = useState<any[]>([]);
    const [skillsListLoading, setSkillsListLoading] = useState(false);
    const [showSkillModal, setShowSkillModal] = useState(false);
    const [editingSkill, setEditingSkill] = useState<any>(null);
    const [deleteSkillTarget, setDeleteSkillTarget] = useState<any>(null);
    const [skillDomains, setSkillDomains] = useState<any[]>([]);
    const [savingSkill, setSavingSkill] = useState(false);

    const fetchSkillsList = async () => {
        setSkillsListLoading(true);
        try {
            const res = await api('/api/v1/skills?limit=100');
            const list = res.data || res.skills || res;
            setSkillsList(Array.isArray(list) ? list : []);
        } catch (e: any) {
            toast.showToast('error', 'Failed to load skills', e.message);
        } finally {
            setSkillsListLoading(false);
        }
    };

    const fetchSkillDomains = async () => {
        try {
            const res = await api('/api/v1/skilldomains');
            const list = res.data || res;
            setSkillDomains(Array.isArray(list) ? list : []);
        } catch {
            // optional
        }
    };

    useEffect(() => {
        if (activeTab === 'skills') {
            fetchSkillsList();
            fetchSkillDomains();
        }
    }, [activeTab]);

    const defaultSkillForm = {
        title: '',
        description: '',
        category: '',
        difficulty: 'Beginner',
        duration: '',
        durationMinutes: 10,
        rating: 0,
        videoUrl: '',
        tags: '',
        steps: [] as any[],
    };

    const [skillForm, setSkillForm] = useState(defaultSkillForm);

    const openAddSkill = () => {
        setEditingSkill(null);
        setSkillForm(defaultSkillForm);
        setShowSkillModal(true);
    };

    const openEditSkill = (skill: any) => {
        setEditingSkill(skill);
        setSkillForm({
            title: skill.title || '',
            description: skill.description || '',
            category: skill.category?._id || skill.category || '',
            difficulty: skill.difficulty || 'Beginner',
            duration: skill.duration?.toString() || '',
            durationMinutes: skill.durationMinutes || 10,
            rating: skill.rating || 0,
            videoUrl: skill.videoUrl || '',
            tags: Array.isArray(skill.tags) ? skill.tags.join(', ') : skill.tags || '',
            steps: (skill.steps || []).map((s: any, i: number) => ({
                _id: s._id,
                title: s.title || '',
                description: s.description || '',
                type: s.type || 'video',
                content: s.content || '',
                order: s.order ?? i + 1,
            })),
        });
        setShowSkillModal(true);
    };

    const addStep = () => {
        setSkillForm((prev) => ({
            ...prev,
            steps: [...prev.steps, { title: '', description: '', type: 'video', content: '', order: prev.steps.length + 1 }],
        }));
    };

    const removeStep = (idx: number) => {
        setSkillForm((prev) => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 })),
        }));
    };

    const moveStep = (idx: number, dir: 'up' | 'down') => {
        if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === skillForm.steps.length - 1)) return;
        const next = [...skillForm.steps];
        const swap = dir === 'up' ? idx - 1 : idx + 1;
        [next[idx], next[swap]] = [next[swap], next[idx]];
        setSkillForm((prev) => ({ ...prev, steps: next.map((s, i) => ({ ...s, order: i + 1 })) }));
    };

    const updateStep = (idx: number, field: string, value: any) => {
        setSkillForm((prev) => {
            const steps = [...prev.steps];
            steps[idx] = { ...steps[idx], [field]: value };
            return { ...prev, steps };
        });
    };

    const saveSkill = async () => {
        setSavingSkill(true);
        try {
            const payload = {
                ...skillForm,
                tags: skillForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
                duration: parseInt(skillForm.duration) || skillForm.duration,
                steps: skillForm.steps.map((s) => ({
                    ...(s._id ? { _id: s._id } : {}),
                    title: s.title,
                    description: s.description,
                    type: s.type,
                    content: s.content,
                    order: s.order,
                })),
            };
            if (editingSkill) {
                await api(`/api/v1/skills/${editingSkill._id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
                toast.showToast('success', 'Skill updated');
            } else {
                await api('/api/v1/skills', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                toast.showToast('success', 'Skill created');
            }
            setShowSkillModal(false);
            fetchSkillsList();
        } catch (e: any) {
            toast.showToast('error', 'Failed to save skill', e.message);
        } finally {
            setSavingSkill(false);
        }
    };

    const confirmDeleteSkill = async () => {
        if (!deleteSkillTarget) return;
        try {
            await api(`/api/v1/skills/${deleteSkillTarget._id}`, { method: 'DELETE' });
            toast.showToast('success', 'Skill deleted');
            setDeleteSkillTarget(null);
            fetchSkillsList();
        } catch (e: any) {
            toast.showToast('error', 'Failed to delete skill', e.message);
        }
    };

    const renderSkills = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">All Skills</h2>
                <motion.button
                    onClick={openAddSkill}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary-green text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all"
                    whileHover={{ scale: 1.02 }}
                >
                    <FiPlus className="w-4 h-4" />
                    Add Skill
                </motion.button>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 overflow-x-auto">
                {skillsListLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-6 h-6 border-2 border-secondary-green border-t-transparent rounded-full" />
                    </div>
                ) : skillsList.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">No skills found.</p>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-slate-400 uppercase">
                                <th className="text-left py-2 px-3">Title</th>
                                <th className="text-left py-2 px-3">Category</th>
                                <th className="text-left py-2 px-3">Difficulty</th>
                                <th className="text-left py-2 px-3">Steps</th>
                                <th className="text-left py-2 px-3">Video</th>
                                <th className="text-right py-2 px-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {skillsList.map((skill, i) => (
                                <tr key={skill._id || i} className="border-t border-slate-700/30">
                                    <td className="py-2 px-3 text-sm text-white">{skill.title}</td>
                                    <td className="py-2 px-3 text-sm text-slate-300">
                                        {skill.category?.name || skill.category || '—'}
                                    </td>
                                    <td className="py-2 px-3 text-sm">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            skill.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                                            skill.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                            {skill.difficulty || '—'}
                                        </span>
                                    </td>
                                    <td className="py-2 px-3 text-sm text-slate-300">{skill.steps?.length || 0}</td>
                                    <td className="py-2 px-3 text-sm">
                                        {skill.videoCheckStatus ? (
                                            <span className={`text-xs ${
                                                skill.videoCheckStatus === 'ok' ? 'text-green-400' :
                                                skill.videoCheckStatus === 'not_found' ? 'text-red-400' :
                                                'text-yellow-400'
                                            }`}>
                                                {skill.videoCheckStatus === 'ok' ? '✅' : skill.videoCheckStatus === 'not_found' ? '❌' : '⚠️'}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-500">—</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEditSkill(skill)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
                                            >
                                                <FiEdit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteSkillTarget(skill)}
                                                className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Skill Form Modal */}
            {showSkillModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto py-8" onClick={() => setShowSkillModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full mx-4 my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">
                                {editingSkill ? 'Edit Skill' : 'Add Skill'}
                            </h3>
                            <button onClick={() => setShowSkillModal(false)} className="text-slate-400 hover:text-white transition-all">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Title</label>
                                <input
                                    value={skillForm.title}
                                    onChange={(e) => setSkillForm((p) => ({ ...p, title: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                    placeholder="Skill title"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Description</label>
                                <textarea
                                    value={skillForm.description}
                                    onChange={(e) => setSkillForm((p) => ({ ...p, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                    placeholder="Skill description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Category</label>
                                    <select
                                        value={skillForm.category}
                                        onChange={(e) => setSkillForm((p) => ({ ...p, category: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white outline-none focus:border-secondary-green text-sm"
                                    >
                                        <option value="">Select category</option>
                                        {skillDomains.map((d) => (
                                            <option key={d._id} value={d._id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Difficulty</label>
                                    <select
                                        value={skillForm.difficulty}
                                        onChange={(e) => setSkillForm((p) => ({ ...p, difficulty: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white outline-none focus:border-secondary-green text-sm"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Duration</label>
                                    <input
                                        value={skillForm.duration}
                                        onChange={(e) => setSkillForm((p) => ({ ...p, duration: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                        placeholder="e.g. 10 min"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Duration (min)</label>
                                    <input
                                        type="number"
                                        value={skillForm.durationMinutes}
                                        onChange={(e) => setSkillForm((p) => ({ ...p, durationMinutes: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Rating (0–5)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={5}
                                        step={0.5}
                                        value={skillForm.rating}
                                        onChange={(e) => setSkillForm((p) => ({ ...p, rating: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Video URL</label>
                                <input
                                    value={skillForm.videoUrl}
                                    onChange={(e) => setSkillForm((p) => ({ ...p, videoUrl: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Tags (comma-separated)</label>
                                <input
                                    value={skillForm.tags}
                                    onChange={(e) => setSkillForm((p) => ({ ...p, tags: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                    placeholder="tag1, tag2, tag3"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs text-slate-400">Steps</label>
                                    <button
                                        onClick={addStep}
                                        className="flex items-center gap-1 text-xs text-secondary-green hover:text-emerald-400 transition-all"
                                    >
                                        <FiPlus className="w-3 h-3" /> Add Step
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {skillForm.steps.map((step, idx) => (
                                        <div key={idx} className="p-3 bg-slate-700/20 rounded-xl border border-slate-700/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-slate-400">Step {idx + 1}</span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => moveStep(idx, 'up')}
                                                        disabled={idx === 0}
                                                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                                                    >
                                                        <FiChevronLeft className="w-3.5 h-3.5 rotate-90" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveStep(idx, 'down')}
                                                        disabled={idx === skillForm.steps.length - 1}
                                                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                                                    >
                                                        <FiChevronRight className="w-3.5 h-3.5 rotate-90" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeStep(idx)}
                                                        className="p-1 rounded text-red-400 hover:text-red-300 transition-all"
                                                    >
                                                        <FiTrash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <input
                                                    value={step.title}
                                                    onChange={(e) => updateStep(idx, 'title', e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 outline-none focus:border-secondary-green text-xs"
                                                    placeholder="Step title"
                                                />
                                                <input
                                                    value={step.description}
                                                    onChange={(e) => updateStep(idx, 'description', e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 outline-none focus:border-secondary-green text-xs"
                                                    placeholder="Step description"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <select
                                                    value={step.type}
                                                    onChange={(e) => updateStep(idx, 'type', e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white outline-none focus:border-secondary-green text-xs"
                                                >
                                                    <option value="video">Video</option>
                                                    <option value="reading">Reading</option>
                                                    <option value="quiz">Quiz</option>
                                                    <option value="practice">Practice</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    value={step.order}
                                                    onChange={(e) => updateStep(idx, 'order', parseInt(e.target.value) || 0)}
                                                    className="w-full px-2 py-1.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 outline-none focus:border-secondary-green text-xs"
                                                    placeholder="Order"
                                                />
                                            </div>
                                            <textarea
                                                value={step.content}
                                                onChange={(e) => updateStep(idx, 'content', e.target.value)}
                                                rows={2}
                                                className="w-full px-2 py-1.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 outline-none focus:border-secondary-green text-xs"
                                                placeholder="Step content"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700/30">
                            <button
                                onClick={() => setShowSkillModal(false)}
                                className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-700/60 text-slate-300 hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveSkill}
                                disabled={savingSkill}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-secondary-green text-white hover:bg-emerald-600 transition-all disabled:opacity-50"
                            >
                                {savingSkill ? (
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <FiSave className="w-4 h-4" />
                                )}
                                {editingSkill ? 'Update Skill' : 'Create Skill'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Skill Confirmation */}
            <ConfirmModal
                isOpen={!!deleteSkillTarget}
                title="Delete Skill"
                message={`Are you sure you want to delete "${deleteSkillTarget?.title}"? This action cannot be undone.`}
                onConfirm={confirmDeleteSkill}
                onCancel={() => setDeleteSkillTarget(null)}
                confirmLabel="Delete"
                variant="danger"
            />
        </motion.div>
    );

    // ─── Categories Tab ────────────────────────────────────────
    const [categoriesList, setCategoriesList] = useState<any[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<any>(null);
    const [savingCategory, setSavingCategory] = useState(false);

    const defaultCategoryForm = { name: '', description: '', icon: '', gradient: '', color: '', displayOrder: 0 };

    const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const res = await api('/api/v1/skilldomains');
            const list = res.data || res;
            setCategoriesList(Array.isArray(list) ? list : []);
        } catch (e: any) {
            toast.showToast('error', 'Failed to load categories', e.message);
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'categories') fetchCategories();
    }, [activeTab]);

    const openAddCategory = () => {
        setEditingCategory(null);
        setCategoryForm(defaultCategoryForm);
        setShowCategoryModal(true);
    };

    const openEditCategory = (cat: any) => {
        setEditingCategory(cat);
        setCategoryForm({
            name: cat.name || '',
            description: cat.description || '',
            icon: cat.icon || '',
            gradient: cat.gradient || '',
            color: cat.color || '',
            displayOrder: cat.displayOrder ?? 0,
        });
        setShowCategoryModal(true);
    };

    const saveCategory = async () => {
        setSavingCategory(true);
        try {
            if (editingCategory) {
                await api(`/api/v1/skilldomains/${editingCategory._id}`, {
                    method: 'PUT',
                    body: JSON.stringify(categoryForm),
                });
                toast.showToast('success', 'Category updated');
            } else {
                await api('/api/v1/skilldomains', {
                    method: 'POST',
                    body: JSON.stringify(categoryForm),
                });
                toast.showToast('success', 'Category created');
            }
            setShowCategoryModal(false);
            fetchCategories();
        } catch (e: any) {
            toast.showToast('error', 'Failed to save category', e.message);
        } finally {
            setSavingCategory(false);
        }
    };

    const confirmDeleteCategory = async () => {
        if (!deleteCategoryTarget) return;
        try {
            await api(`/api/v1/skilldomains/${deleteCategoryTarget._id}`, { method: 'DELETE' });
            toast.showToast('success', 'Category deleted');
            setDeleteCategoryTarget(null);
            fetchCategories();
        } catch (e: any) {
            toast.showToast('error', 'Failed to delete category', e.message);
        }
    };

    const renderCategories = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Categories (Skill Domains)</h2>
                <motion.button
                    onClick={openAddCategory}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary-green text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all"
                    whileHover={{ scale: 1.02 }}
                >
                    <FiPlus className="w-4 h-4" />
                    Add Category
                </motion.button>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 overflow-x-auto">
                {categoriesLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-6 h-6 border-2 border-secondary-green border-t-transparent rounded-full" />
                    </div>
                ) : categoriesList.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">No categories found.</p>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-slate-400 uppercase">
                                <th className="text-left py-2 px-3">Name</th>
                                <th className="text-left py-2 px-3">Slug</th>
                                <th className="text-left py-2 px-3">Icon</th>
                                <th className="text-left py-2 px-3">Gradient</th>
                                <th className="text-left py-2 px-3">Color</th>
                                <th className="text-left py-2 px-3">Order</th>
                                <th className="text-right py-2 px-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoriesList.map((cat, i) => (
                                <tr key={cat._id || i} className="border-t border-slate-700/30">
                                    <td className="py-2 px-3 text-sm text-white">{cat.name}</td>
                                    <td className="py-2 px-3 text-sm text-slate-300">{cat.slug || '—'}</td>
                                    <td className="py-2 px-3 text-sm text-slate-300">{cat.icon || '—'}</td>
                                    <td className="py-2 px-3 text-sm text-slate-300 font-mono text-xs">{cat.gradient || '—'}</td>
                                    <td className="py-2 px-3">
                                        <div className="flex items-center gap-2">
                                            {cat.color && <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }} />}
                                            <span className="text-sm text-slate-300">{cat.color || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="py-2 px-3 text-sm text-slate-300">{cat.displayOrder ?? '—'}</td>
                                    <td className="py-2 px-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEditCategory(cat)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
                                            >
                                                <FiEdit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteCategoryTarget(cat)}
                                                className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Category Form Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCategoryModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">
                                {editingCategory ? 'Edit Category' : 'Add Category'}
                            </h3>
                            <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-white transition-all">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Name</label>
                                <input
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                    placeholder="Category name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Description</label>
                                <textarea
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
                                    rows={2}
                                    className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                    placeholder="Description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Icon</label>
                                    <input
                                        value={categoryForm.icon}
                                        onChange={(e) => setCategoryForm((p) => ({ ...p, icon: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                        placeholder="FiStar"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={categoryForm.displayOrder}
                                        onChange={(e) => setCategoryForm((p) => ({ ...p, displayOrder: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Gradient</label>
                                    <input
                                        value={categoryForm.gradient}
                                        onChange={(e) => setCategoryForm((p) => ({ ...p, gradient: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                        placeholder="from-blue-500 to-purple-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Color</label>
                                    <input
                                        value={categoryForm.color}
                                        onChange={(e) => setCategoryForm((p) => ({ ...p, color: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                        placeholder="#3B82F6"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700/30">
                            <button
                                onClick={() => setShowCategoryModal(false)}
                                className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-700/60 text-slate-300 hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveCategory}
                                disabled={savingCategory}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-secondary-green text-white hover:bg-emerald-600 transition-all disabled:opacity-50"
                            >
                                {savingCategory ? (
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <FiSave className="w-4 h-4" />
                                )}
                                {editingCategory ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteCategoryTarget}
                title="Delete Category"
                message={`Are you sure you want to delete "${deleteCategoryTarget?.name}"? This action cannot be undone.`}
                onConfirm={confirmDeleteCategory}
                onCancel={() => setDeleteCategoryTarget(null)}
                confirmLabel="Delete"
                variant="danger"
            />
        </motion.div>
    );

    // ─── Partners Tab ──────────────────────────────────────────
    const [partnersList, setPartnersList] = useState<any[]>([]);
    const [partnersLoading, setPartnersLoading] = useState(false);
    const [showPartnerModal, setShowPartnerModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState<any>(null);
    const [deletePartnerTarget, setDeletePartnerTarget] = useState<any>(null);
    const [savingPartner, setSavingPartner] = useState(false);

    const defaultPartnerForm = { name: '', website: '', logo: '', description: '', partnerType: 'educational', isActive: true };
    const [partnerForm, setPartnerForm] = useState(defaultPartnerForm);

    const fetchPartners = async () => {
        setPartnersLoading(true);
        try {
            const res = await api('/api/v1/partners/all');
            const list = res.data || res;
            setPartnersList(Array.isArray(list) ? list : []);
        } catch (e: any) {
            toast.showToast('error', 'Failed to load partners', e.message);
        } finally {
            setPartnersLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'partners') fetchPartners();
    }, [activeTab]);

    const openAddPartner = () => {
        setEditingPartner(null);
        setPartnerForm(defaultPartnerForm);
        setShowPartnerModal(true);
    };

    const openEditPartner = (partner: any) => {
        setEditingPartner(partner);
        setPartnerForm({
            name: partner.name || '',
            website: partner.website || '',
            logo: partner.logo || '',
            description: partner.description || '',
            partnerType: partner.partnerType || 'educational',
            isActive: partner.isActive ?? true,
        });
        setShowPartnerModal(true);
    };

    const savePartner = async () => {
        setSavingPartner(true);
        try {
            if (editingPartner) {
                await api(`/api/v1/partners/${editingPartner._id}`, {
                    method: 'PUT',
                    body: JSON.stringify(partnerForm),
                });
                toast.showToast('success', 'Partner updated');
            } else {
                await api('/api/v1/partners', {
                    method: 'POST',
                    body: JSON.stringify(partnerForm),
                });
                toast.showToast('success', 'Partner created');
            }
            setShowPartnerModal(false);
            fetchPartners();
        } catch (e: any) {
            toast.showToast('error', 'Failed to save partner', e.message);
        } finally {
            setSavingPartner(false);
        }
    };

    const confirmDeletePartner = async () => {
        if (!deletePartnerTarget) return;
        try {
            await api(`/api/v1/partners/${deletePartnerTarget._id}`, { method: 'DELETE' });
            toast.showToast('success', 'Partner deleted');
            setDeletePartnerTarget(null);
            fetchPartners();
        } catch (e: any) {
            toast.showToast('error', 'Failed to delete partner', e.message);
        }
    };

    const renderPartners = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Partners</h2>
                <motion.button
                    onClick={openAddPartner}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary-green text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all"
                    whileHover={{ scale: 1.02 }}
                >
                    <FiPlus className="w-4 h-4" />
                    Add Partner
                </motion.button>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 overflow-x-auto">
                {partnersLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-6 h-6 border-2 border-secondary-green border-t-transparent rounded-full" />
                    </div>
                ) : partnersList.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">No partners found.</p>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-slate-400 uppercase">
                                <th className="text-left py-2 px-3">Name</th>
                                <th className="text-left py-2 px-3">Website</th>
                                <th className="text-left py-2 px-3">Type</th>
                                <th className="text-left py-2 px-3">Active</th>
                                <th className="text-right py-2 px-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partnersList.map((partner, i) => (
                                <tr key={partner._id || i} className="border-t border-slate-700/30">
                                    <td className="py-2 px-3 text-sm text-white">{partner.name}</td>
                                    <td className="py-2 px-3 text-sm text-slate-300">
                                        {partner.website ? (
                                            <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-secondary-green hover:underline">
                                                {partner.website}
                                            </a>
                                        ) : '—'}
                                    </td>
                                    <td className="py-2 px-3 text-sm text-slate-300">{partner.partnerType || '—'}</td>
                                    <td className="py-2 px-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            partner.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {partner.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEditPartner(partner)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
                                            >
                                                <FiEdit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletePartnerTarget(partner)}
                                                className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Partner Form Modal */}
            {showPartnerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowPartnerModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">
                                {editingPartner ? 'Edit Partner' : 'Add Partner'}
                            </h3>
                            <button onClick={() => setShowPartnerModal(false)} className="text-slate-400 hover:text-white transition-all">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Name</label>
                                <input
                                    value={partnerForm.name}
                                    onChange={(e) => setPartnerForm((p) => ({ ...p, name: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                    placeholder="Partner name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Website</label>
                                <input
                                    value={partnerForm.website}
                                    onChange={(e) => setPartnerForm((p) => ({ ...p, website: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Logo URL</label>
                                <input
                                    value={partnerForm.logo}
                                    onChange={(e) => setPartnerForm((p) => ({ ...p, logo: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Description</label>
                                <textarea
                                    value={partnerForm.description}
                                    onChange={(e) => setPartnerForm((p) => ({ ...p, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                                    placeholder="Partner description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Partner Type</label>
                                    <select
                                        value={partnerForm.partnerType}
                                        onChange={(e) => setPartnerForm((p) => ({ ...p, partnerType: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white outline-none focus:border-secondary-green text-sm"
                                    >
                                        <option value="educational">Educational</option>
                                        <option value="corporate">Corporate</option>
                                        <option value="nonprofit">Nonprofit</option>
                                        <option value="community">Community</option>
                                        <option value="government">Government</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={partnerForm.isActive}
                                            onChange={(e) => setPartnerForm((p) => ({ ...p, isActive: e.target.checked }))}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-700/60 text-secondary-green focus:ring-secondary-green"
                                        />
                                        <span className="text-sm text-white">Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700/30">
                            <button
                                onClick={() => setShowPartnerModal(false)}
                                className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-700/60 text-slate-300 hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={savePartner}
                                disabled={savingPartner}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-secondary-green text-white hover:bg-emerald-600 transition-all disabled:opacity-50"
                            >
                                {savingPartner ? (
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <FiSave className="w-4 h-4" />
                                )}
                                {editingPartner ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deletePartnerTarget}
                title="Delete Partner"
                message={`Are you sure you want to delete "${deletePartnerTarget?.name}"? This action cannot be undone.`}
                onConfirm={confirmDeletePartner}
                onCancel={() => setDeletePartnerTarget(null)}
                confirmLabel="Delete"
                variant="danger"
            />
        </motion.div>
    );

    // ─── Users Tab ─────────────────────────────────────────────
    const [usersList, setUsersList] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersSearch, setUsersSearch] = useState('');
    const [usersRoleFilter, setUsersRoleFilter] = useState('');
    const [usersPage, setUsersPage] = useState(1);
    const [usersTotal, setUsersTotal] = useState(0);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const usersPerPage = 20;

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const params = new URLSearchParams({ page: usersPage.toString(), limit: usersPerPage.toString() });
            if (usersSearch) params.set('search', usersSearch);
            if (usersRoleFilter) params.set('role', usersRoleFilter);
            const res = await api(`/api/v1/auth/users?${params.toString()}`);
            const list = res.data || res.users || res;
            setUsersList(Array.isArray(list) ? list : []);
            setUsersTotal(res.total ?? res.count ?? (Array.isArray(list) ? list.length : 0));
        } catch (e: any) {
            toast.showToast('error', 'Failed to load users', e.message);
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
    }, [activeTab, usersPage, usersSearch, usersRoleFilter]);

    const totalPages = Math.max(1, Math.ceil(usersTotal / usersPerPage));

    const handleRoleChange = (targetUser: any, newRole: string) => {
        console.log('Role change action:', { userId: targetUser._id, from: targetUser.role, to: newRole });
        toast.showToast('info', 'Role change not yet implemented', `Would change ${targetUser.name || targetUser.email} from ${targetUser.role} to ${newRole}`);
    };

    const renderUsers = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Users</h2>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={usersSearch}
                            onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
                            className="w-full pl-9 pr-3 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green text-sm"
                            placeholder="Search users..."
                        />
                    </div>
                    <div className="relative">
                        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={usersRoleFilter}
                            onChange={(e) => { setUsersRoleFilter(e.target.value); setUsersPage(1); }}
                            className="pl-9 pr-8 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-white outline-none focus:border-secondary-green text-sm appearance-none"
                        >
                            <option value="">All Roles</option>
                            <option value="teen">Teen</option>
                            <option value="parent">Parent</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                {usersLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-6 h-6 border-2 border-secondary-green border-t-transparent rounded-full" />
                    </div>
                ) : usersList.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">No users found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-slate-400 uppercase">
                                    <th className="text-left py-2 px-3">Name</th>
                                    <th className="text-left py-2 px-3">Email / Phone</th>
                                    <th className="text-left py-2 px-3">Role</th>
                                    <th className="text-left py-2 px-3">XP</th>
                                    <th className="text-left py-2 px-3">Level</th>
                                    <th className="text-left py-2 px-3">Verified</th>
                                    <th className="text-left py-2 px-3">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersList.map((u, i) => (
                                    <React.Fragment key={u._id || i}>
                                        <tr
                                            className="border-t border-slate-700/30 cursor-pointer hover:bg-slate-700/20 transition-all"
                                            onClick={() => setExpandedUser(expandedUser === u._id ? null : u._id)}
                                        >
                                            <td className="py-2 px-3 text-sm text-white">{u.name || u.username || '—'}</td>
                                            <td className="py-2 px-3 text-sm text-slate-300">{u.email || u.phone || '—'}</td>
                                            <td className="py-2 px-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                                    u.role === 'parent' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-green-500/20 text-green-400'
                                                }`}>
                                                    {u.role || '—'}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-sm text-white">{u.xp ?? '—'}</td>
                                            <td className="py-2 px-3 text-sm text-white">{u.level ?? '—'}</td>
                                            <td className="py-2 px-3">
                                                {u.verified ? (
                                                    <FiCheckCircle className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <FiX className="w-4 h-4 text-slate-500" />
                                                )}
                                            </td>
                                            <td className="py-2 px-3 text-sm text-slate-300">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                                            </td>
                                        </tr>
                                        {expandedUser === u._id && (
                                            <tr>
                                                <td colSpan={7} className="p-4 bg-slate-700/20 border-t border-slate-700/30">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                                            <p className="text-xs text-slate-400 mb-1">Badges</p>
                                                            <p className="text-lg font-bold text-white">{u.badges?.length || 0}</p>
                                                        </div>
                                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                                            <p className="text-xs text-slate-400 mb-1">Streak</p>
                                                            <p className="text-lg font-bold text-white">{u.currentStreak ?? 0}d</p>
                                                        </div>
                                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                                            <p className="text-xs text-slate-400 mb-1">Skills Completed</p>
                                                            <p className="text-lg font-bold text-white">{u.completedSkills ?? u.skillsCompleted ?? 0}</p>
                                                        </div>
                                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                                            <p className="text-xs text-slate-400 mb-1">Role</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <select
                                                                    defaultValue={u.role}
                                                                    onChange={(e) => handleRoleChange(u, e.target.value)}
                                                                    className="px-2 py-1 bg-slate-700/60 border border-slate-600 rounded-lg text-white text-xs outline-none focus:border-secondary-green"
                                                                >
                                                                    <option value="teen">Teen</option>
                                                                    <option value="parent">Parent</option>
                                                                    <option value="admin">Admin</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {u.badges && u.badges.length > 0 && (
                                                        <div className="mt-3">
                                                            <p className="text-xs text-slate-400 mb-2">Badges:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {u.badges.map((b: any, bi: number) => (
                                                                    <span key={bi} className="text-xs px-2 py-1 bg-slate-700/40 rounded-lg text-slate-300">
                                                                        {b.name || b.icon || `Badge ${bi + 1}`}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {usersTotal > usersPerPage && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/30">
                        <p className="text-xs text-slate-400">
                            Showing {(usersPage - 1) * usersPerPage + 1}–{Math.min(usersPage * usersPerPage, usersTotal)} of {usersTotal}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                                disabled={usersPage <= 1}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                            >
                                <FiChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                const start = Math.max(1, Math.min(usersPage - 2, totalPages - 4));
                                const page = start + i;
                                if (page > totalPages) return null;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setUsersPage(page)}
                                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                                            page === usersPage ? 'bg-secondary-green text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setUsersPage((p) => Math.min(totalPages, p + 1))}
                                disabled={usersPage >= totalPages}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                            >
                                <FiChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );

    // ─── Ops Tab ───────────────────────────────────────────────
    const [reseedLoading, setReseedLoading] = useState(false);
    const [showReseedModal, setShowReseedModal] = useState(false);
    const [auditLog, setAuditLog] = useState<any[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditPage, setAuditPage] = useState(1);
    const [auditTotal, setAuditTotal] = useState(0);
    const auditPerPage = 20;

    const fetchAuditLog = async () => {
        setAuditLoading(true);
        try {
            const res = await api(`/api/v1/admin/audit-log?page=${auditPage}&limit=${auditPerPage}`);
            const list = res.data || res.auditLog || res.logs || res;
            setAuditLog(Array.isArray(list) ? list : []);
            setAuditTotal(res.total ?? res.count ?? (Array.isArray(list) ? list.length : 0));
        } catch (e: any) {
            toast.showToast('error', 'Failed to load audit log', e.message);
        } finally {
            setAuditLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'ops') fetchAuditLog();
    }, [activeTab, auditPage]);

    const handleReseed = async () => {
        setReseedLoading(true);
        try {
            await api('/api/v1/admin/reseed', { method: 'POST' });
            toast.showToast('success', 'Database reseeded successfully');
            setShowReseedModal(false);
            fetchAuditLog();
        } catch (e: any) {
            toast.showToast('error', 'Reseed failed', e.message);
        } finally {
            setReseedLoading(false);
        }
    };

    const auditTotalPages = Math.max(1, Math.ceil(auditTotal / auditPerPage));

    const renderOps = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Reseed Section */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <FiServer className="w-5 h-5 text-secondary-green" />
                    Database Management
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                    Reseeding will reset the database to its default state. This action cannot be undone.
                </p>
                <motion.button
                    onClick={() => setShowReseedModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/30 transition-all"
                    whileHover={{ scale: 1.02 }}
                >
                    <FiAlertCircle className="w-4 h-4" />
                    Reseed Database
                </motion.button>
            </div>

            {/* Audit Log Section */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FiList className="w-5 h-5 text-secondary-green" />
                    Audit Log
                </h2>
                {auditLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-6 h-6 border-2 border-secondary-green border-t-transparent rounded-full" />
                    </div>
                ) : auditLog.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">No audit log entries found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-slate-400 uppercase">
                                    <th className="text-left py-2 px-3">Timestamp</th>
                                    <th className="text-left py-2 px-3">Admin</th>
                                    <th className="text-left py-2 px-3">Action</th>
                                    <th className="text-left py-2 px-3">Target</th>
                                    <th className="text-left py-2 px-3">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLog.map((entry, i) => (
                                    <tr key={entry._id || i} className="border-t border-slate-700/30">
                                        <td className="py-2 px-3 text-sm text-slate-300 whitespace-nowrap">
                                            {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
                                        </td>
                                        <td className="py-2 px-3 text-sm text-white">{entry.admin?.name || entry.admin || '—'}</td>
                                        <td className="py-2 px-3">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-green/10 text-secondary-green">
                                                {entry.action || '—'}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 text-sm text-slate-300">{entry.target || '—'}</td>
                                        <td className="py-2 px-3 text-sm text-slate-400 max-w-[200px] truncate">
                                            {typeof entry.details === 'object' ? JSON.stringify(entry.details) : entry.details || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {auditTotal > auditPerPage && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/30">
                        <p className="text-xs text-slate-400">
                            Page {auditPage} of {auditTotalPages}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                                disabled={auditPage <= 1}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                            >
                                <FiChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-slate-400 px-2">{auditPage}</span>
                            <button
                                onClick={() => setAuditPage((p) => Math.min(auditTotalPages, p + 1))}
                                disabled={auditPage >= auditTotalPages}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                            >
                                <FiChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={showReseedModal}
                title="Reseed Database"
                message="Are you sure you want to reseed the database? This will reset all data to its default state and cannot be undone."
                onConfirm={handleReseed}
                onCancel={() => setShowReseedModal(false)}
                confirmLabel="Reseed Database"
                variant="danger"
                loading={reseedLoading}
            />
        </motion.div>
    );

    // ─── Main Render ──────────────────────────────────────────
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

                    {/* Tab Navigation */}
                    <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-1.5 border border-slate-700/30 mb-6 overflow-x-auto">
                        <div className="flex gap-1 min-w-max">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                                            isActive
                                                ? 'bg-secondary-green text-white shadow-lg shadow-secondary-green/20'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'content-health' && renderContentHealth()}
                    {activeTab === 'skills' && renderSkills()}
                    {activeTab === 'categories' && renderCategories()}
                    {activeTab === 'partners' && renderPartners()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'ops' && renderOps()}
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
