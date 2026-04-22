import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHeart,
    FiTrendingUp,
    FiCalendar,
    FiTarget,
    FiBookOpen,
    FiUsers,
    FiPlus,
    FiCheckCircle,
    FiAlertCircle,
    FiSmile,
    FiMeh,
    FiFrown,
    FiWind,
    FiZap,
    FiMessageCircle
} from 'react-icons/fi';
import BreathingExercises from './BreathingExercises';
import StressReliefGames from './StressReliefGames';
import PeerSupportChat from './PeerSupportChat';

interface MoodEntry {
    id: string;
    date: string;
    mood: 'happy' | 'neutral' | 'sad';
    energy: number; // 1-10
    stress: number; // 1-10
    notes?: string;
    activities: string[];
}

interface MentalHealthStats {
    totalDays: number;
    averageMood: number;
    averageEnergy: number;
    averageStress: number;
    completedActivities: number;
    streakDays: number;
}

const MentalHealthDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
    const [showMoodForm, setShowMoodForm] = useState(false);
    const [newMoodEntry, setNewMoodEntry] = useState<Partial<MoodEntry>>({
        mood: 'neutral',
        energy: 5,
        stress: 5,
        activities: []
    });
    const [stats, setStats] = useState<MentalHealthStats>({
        totalDays: 0,
        averageMood: 0,
        averageEnergy: 0,
        averageStress: 0,
        completedActivities: 0,
        streakDays: 0
    });

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiHeart },
        { id: 'breathing', label: 'Breathing', icon: FiWind },
        { id: 'games', label: 'Stress Relief', icon: FiZap },
        { id: 'chat', label: 'Peer Support', icon: FiMessageCircle }
    ];

    const moodActivities = [
        'Exercise', 'Meditation', 'Reading', 'Music', 'Art/Creativity',
        'Socializing', 'Nature Walk', 'Journaling', 'Cooking', 'Gaming',
        'Learning', 'Sleep', 'Therapy', 'Breathing Exercises', 'Yoga'
    ];

    // Load data from localStorage
    useEffect(() => {
        const savedEntries = localStorage.getItem('mental_health_entries');
        if (savedEntries) {
            const entries = JSON.parse(savedEntries);
            setMoodEntries(entries);
            calculateStats(entries);
        }
    }, []);

    const calculateStats = (entries: MoodEntry[]) => {
        if (entries.length === 0) return;

        const totalDays = entries.length;
        const averageMood = entries.reduce((sum, entry) => {
            const moodValue = entry.mood === 'happy' ? 3 : entry.mood === 'neutral' ? 2 : 1;
            return sum + moodValue;
        }, 0) / totalDays;

        const averageEnergy = entries.reduce((sum, entry) => sum + entry.energy, 0) / totalDays;
        const averageStress = entries.reduce((sum, entry) => sum + entry.stress, 0) / totalDays;
        const completedActivities = entries.reduce((sum, entry) => sum + entry.activities.length, 0);

        // Calculate streak (consecutive days with entries)
        let streakDays = 0;
        const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const today = new Date().toDateString();

        for (let i = 0; i < sortedEntries.length; i++) {
            const entryDate = new Date(sortedEntries[i].date).toDateString();
            const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();

            if (entryDate === expectedDate) {
                streakDays++;
            } else {
                break;
            }
        }

        setStats({
            totalDays,
            averageMood,
            averageEnergy,
            averageStress,
            completedActivities,
            streakDays
        });
    };

    const handleMoodSubmit = () => {
        if (!newMoodEntry.mood) return;

        const entry: MoodEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            mood: newMoodEntry.mood,
            energy: newMoodEntry.energy || 5,
            stress: newMoodEntry.stress || 5,
            notes: newMoodEntry.notes,
            activities: newMoodEntry.activities || []
        };

        const updatedEntries = [entry, ...moodEntries];
        setMoodEntries(updatedEntries);
        calculateStats(updatedEntries);

        // Save to localStorage
        localStorage.setItem('mental_health_entries', JSON.stringify(updatedEntries));

        setShowMoodForm(false);
        setNewMoodEntry({
            mood: 'neutral',
            energy: 5,
            stress: 5,
            activities: []
        });
    };

    const toggleActivity = (activity: string) => {
        const currentActivities = newMoodEntry.activities || [];
        const updatedActivities = currentActivities.includes(activity)
            ? currentActivities.filter(a => a !== activity)
            : [...currentActivities, activity];

        setNewMoodEntry(prev => ({ ...prev, activities: updatedActivities }));
    };

    const getMoodIcon = (mood: string) => {
        switch (mood) {
            case 'happy': return <FiSmile className="w-6 h-6 text-green-400" />;
            case 'neutral': return <FiMeh className="w-6 h-6 text-yellow-400" />;
            case 'sad': return <FiFrown className="w-6 h-6 text-red-400" />;
            default: return <FiMeh className="w-6 h-6 text-yellow-400" />;
        }
    };

    const getMoodColor = (mood: string) => {
        switch (mood) {
            case 'happy': return 'from-green-500 to-emerald-500';
            case 'neutral': return 'from-yellow-500 to-orange-500';
            case 'sad': return 'from-red-500 to-pink-500';
            default: return 'from-gray-500 to-slate-500';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900/40 backdrop-blur-sm p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Mental Health Dashboard</h1>
                            <p className="text-slate-400">Track your mood, energy, and wellness activities</p>
                        </div>
                        {activeTab === 'overview' && (
                            <motion.button
                                onClick={() => setShowMoodForm(true)}
                                className="btn-primary px-6 py-3 flex items-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiPlus className="w-5 h-5" />
                                <span>Log Mood</span>
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                                        ? 'bg-secondary-green text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="font-medium">{tab.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Stats Grid */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                            >
                                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-blue-500/20 rounded-lg">
                                            <FiCalendar className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <span className="text-2xl font-bold text-white">{stats.totalDays}</span>
                                    </div>
                                    <h3 className="text-slate-300 font-medium">Days Tracked</h3>
                                </div>

                                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-green-500/20 rounded-lg">
                                            <FiTrendingUp className="w-6 h-6 text-green-400" />
                                        </div>
                                        <span className="text-2xl font-bold text-white">{stats.streakDays}</span>
                                    </div>
                                    <h3 className="text-slate-300 font-medium">Day Streak</h3>
                                </div>

                                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-purple-500/20 rounded-lg">
                                            <FiTarget className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <span className="text-2xl font-bold text-white">{stats.completedActivities}</span>
                                    </div>
                                    <h3 className="text-slate-300 font-medium">Activities Done</h3>
                                </div>

                                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                                            <FiHeart className="w-6 h-6 text-yellow-400" />
                                        </div>
                                        <span className="text-2xl font-bold text-white">
                                            {stats.averageMood > 0 ? stats.averageMood.toFixed(1) : '0'}
                                        </span>
                                    </div>
                                    <h3 className="text-slate-300 font-medium">Avg Mood</h3>
                                </div>
                            </motion.div>

                            {/* Recent Entries */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-8"
                            >
                                <h2 className="text-xl font-bold text-white mb-6">Recent Mood Entries</h2>
                                {moodEntries.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FiHeart className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                        <p className="text-slate-400">No mood entries yet. Start tracking your mental health journey!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {moodEntries.slice(0, 5).map((entry) => (
                                            <motion.div
                                                key={entry.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    {getMoodIcon(entry.mood)}
                                                    <div>
                                                        <p className="text-white font-medium">
                                                            {new Date(entry.date).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-slate-400 text-sm capitalize">{entry.mood} mood</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm">
                                                    <div className="text-center">
                                                        <p className="text-slate-300">Energy</p>
                                                        <p className="text-white font-medium">{entry.energy}/10</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-slate-300">Stress</p>
                                                        <p className="text-white font-medium">{entry.stress}/10</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-slate-300">Activities</p>
                                                        <p className="text-white font-medium">{entry.activities.length}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === 'breathing' && (
                        <motion.div
                            key="breathing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <BreathingExercises />
                        </motion.div>
                    )}

                    {activeTab === 'games' && (
                        <motion.div
                            key="games"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <StressReliefGames />
                        </motion.div>
                    )}

                    {activeTab === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <PeerSupportChat />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mood Entry Form Modal */}
                <AnimatePresence>
                    {showMoodForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowMoodForm(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-slate-900/95 backdrop-blur-lg rounded-2xl border border-slate-700/50 max-w-2xl w-full max-h-[90vh] overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-700/50">
                                    <h2 className="text-2xl font-bold text-white">Log Your Mood</h2>
                                    <p className="text-slate-400">How are you feeling today?</p>
                                </div>

                                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                                    {/* Mood Selection */}
                                    <div className="mb-6">
                                        <label className="block text-white font-medium mb-3">How's your mood today?</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {(['sad', 'neutral', 'happy'] as const).map((mood) => (
                                                <motion.button
                                                    key={mood}
                                                    onClick={() => setNewMoodEntry(prev => ({ ...prev, mood }))}
                                                    className={`p-4 rounded-lg border-2 transition-all ${newMoodEntry.mood === mood
                                                        ? 'border-secondary-green bg-secondary-green/20'
                                                        : 'border-slate-600 hover:border-slate-500'
                                                        }`}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <div className="flex flex-col items-center space-y-2">
                                                        {getMoodIcon(mood)}
                                                        <span className="text-white capitalize">{mood}</span>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Energy Level */}
                                    <div className="mb-6">
                                        <label className="block text-white font-medium mb-3">
                                            Energy Level: {newMoodEntry.energy}/10
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={newMoodEntry.energy || 5}
                                            onChange={(e) => setNewMoodEntry(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Stress Level */}
                                    <div className="mb-6">
                                        <label className="block text-white font-medium mb-3">
                                            Stress Level: {newMoodEntry.stress}/10
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={newMoodEntry.stress || 5}
                                            onChange={(e) => setNewMoodEntry(prev => ({ ...prev, stress: parseInt(e.target.value) }))}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Activities */}
                                    <div className="mb-6">
                                        <label className="block text-white font-medium mb-3">What activities did you do today?</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {moodActivities.map((activity) => (
                                                <motion.button
                                                    key={activity}
                                                    onClick={() => toggleActivity(activity)}
                                                    className={`p-2 rounded-lg text-sm transition-all ${newMoodEntry.activities?.includes(activity)
                                                        ? 'bg-secondary-green text-white'
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                        }`}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    {activity}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="mb-6">
                                        <label className="block text-white font-medium mb-3">Notes (optional)</label>
                                        <textarea
                                            value={newMoodEntry.notes || ''}
                                            onChange={(e) => setNewMoodEntry(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="How are you feeling? Any thoughts you'd like to remember?"
                                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-secondary-green"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex space-x-4">
                                        <motion.button
                                            onClick={handleMoodSubmit}
                                            className="flex-1 btn-primary py-3"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Save Entry
                                        </motion.button>
                                        <motion.button
                                            onClick={() => setShowMoodForm(false)}
                                            className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Cancel
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MentalHealthDashboard;
