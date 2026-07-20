import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGamification } from '../context/GamificationContext';
import { apiRequest } from '../api/client';
import { FiAward, FiChevronLeft, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const rarityConfig: Record<string, { border: string; glow: string; label: string }> = {
  common: { border: 'border-slate-500/30', glow: 'shadow-slate-500/20', label: 'Common' },
  rare: { border: 'border-blue-500/40', glow: 'shadow-blue-500/30', label: 'Rare' },
  epic: { border: 'border-purple-500/40', glow: 'shadow-purple-500/30', label: 'Epic' },
  legendary: { border: 'border-amber-400/50', glow: 'shadow-amber-400/40', label: 'Legendary' },
};

const BadgesPage: React.FC = () => {
  const navigate = useNavigate();
  const { userStats } = useGamification();
  const [badges, setBadges] = useState<any[]>([]);
  const [tab, setTab] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await apiRequest('/api/v1/gamification/badges');
        if (res.data) setBadges(res.data);
      } catch {}
    };
    fetchBadges();
  }, []);

  const filtered = badges.filter(b => {
    if (tab === 'unlocked') return b.unlocked;
    if (tab === 'locked') return !b.unlocked;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors">
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Badges</h1>
            <p className="text-slate-400 text-sm">Collect badges by completing achievements</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-3 text-center">
            <FiAward className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{userStats.badges.length}</p>
            <p className="text-xs text-slate-400">Unlocked</p>
          </div>
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-3 text-center">
            <FiZap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{userStats.totalPoints}</p>
            <p className="text-xs text-slate-400">Total XP</p>
          </div>
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-3 text-center">
            <span className="text-xl block mb-1">🔥</span>
            <p className="text-2xl font-bold text-white">{userStats.currentStreak}</p>
            <p className="text-xs text-slate-400">Day Streak</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['all', 'unlocked', 'locked'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-secondary-green text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((badge) => {
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

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <FiAward className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No badges found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgesPage;
