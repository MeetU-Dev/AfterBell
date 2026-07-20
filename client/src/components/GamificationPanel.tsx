import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '../context/GamificationContext';
import { FiZap } from 'react-icons/fi';

const GamificationPanel: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { userStats, recentBadges } = useGamification();

  const { level, totalPoints, currentStreak, experience, experienceToNext } = userStats;
  const progressPct = experienceToNext > 0
    ? Math.min(100, Math.round((experience / (experience + experienceToNext)) * 100))
    : 0;

  return (
    <div className={`flex items-center gap-3 ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Level */}
      <div className="flex items-center gap-1.5 bg-slate-700/50 px-2.5 py-1.5 rounded-lg border border-slate-600/50">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
          {level}
        </div>
        {!compact && (
          <div className="flex flex-col min-w-[60px]">
            <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">{experience}/{experience + experienceToNext} XP</span>
          </div>
        )}
      </div>

      {/* Streak */}
      <div className="flex items-center gap-1 bg-slate-700/50 px-2.5 py-1.5 rounded-lg border border-slate-600/50">
        <span className={`text-sm ${currentStreak > 0 ? '' : 'grayscale opacity-50'}`}>🔥</span>
        <span className={`font-semibold ${currentStreak > 0 ? 'text-orange-300' : 'text-slate-400'}`}>
          {currentStreak}
        </span>
      </div>

      {/* XP */}
      <div className="flex items-center gap-1 bg-slate-700/50 px-2.5 py-1.5 rounded-lg border border-slate-600/50">
        <FiZap className="w-4 h-4 text-yellow-400" />
        <span className="font-semibold text-yellow-300">{totalPoints}</span>
      </div>

      {/* Recent badge notification */}
      <AnimatePresence>
        {recentBadges.length > 0 && !compact && (
          <motion.div
            key={recentBadges[0]?.id || 'badge'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 px-2.5 py-1.5 rounded-lg"
          >
            <span className="text-lg">{recentBadges[0]?.icon || '🏅'}</span>
            <span className="text-xs text-purple-200 font-medium truncate max-w-[80px]">
              {recentBadges[0]?.name || ''}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamificationPanel;
