import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  FiBell, FiCheck, FiTrash2, FiArrowLeft, FiCheckCircle, FiFilter,
} from 'react-icons/fi';

const TYPE_ICONS: Record<string, string> = {
  skill_completed: '🎉',
  badge_unlocked: '🏆',
  achievement_unlocked: '🌟',
  level_up: '⬆️',
  streak_milestone: '🔥',
  weekly_report: '📊',
  parent_alert: '📋',
};

const NotificationPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Notifications</h1>
              <p className="text-slate-400 text-sm">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === 'all' ? 'bg-secondary-green text-white' : 'text-slate-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === 'unread' ? 'bg-secondary-green text-white' : 'text-slate-400'}`}
                >
                  Unread
                </button>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/50 rounded-xl text-xs text-secondary-green hover:bg-slate-600/50 transition-colors"
                >
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBell className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No notifications</h3>
            <p className="text-slate-400 text-sm">
              {filter === 'unread' ? 'All notifications are read' : 'Nothing here yet'}
            </p>
          </motion.div>
        ) : (
          <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {filtered.map((n, i) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                  !n.read
                    ? 'bg-secondary-green/5 border-secondary-green/20 hover:bg-secondary-green/10'
                    : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/30'
                }`}
                onClick={() => {
                  if (!n.read) markAsRead(n._id);
                  if (n.link) navigate(n.link);
                }}
              >
                <div className="text-xl flex-shrink-0 mt-0.5">
                  {TYPE_ICONS[n.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${!n.read ? 'text-white font-semibold' : 'text-slate-300'}`}>
                    {n.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{n.message}</div>
                  <div className="text-[10px] text-slate-500 mt-1.5">{timeAgo(n.createdAt)}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-secondary-green hover:bg-slate-700/50 transition-colors"
                      title="Mark as read"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default NotificationPage;
