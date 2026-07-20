import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (n: any) => {
    if (!n.read) markAsRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-300 hover:text-white transition-colors"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4.5 h-4.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
              <span className="text-sm font-semibold text-white">Notifications</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => { markAllAsRead(); }}
                    className="text-xs text-secondary-green hover:text-emerald-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => { setOpen(false); navigate('/notifications'); }}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  View all
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-400 text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-slate-700/30 cursor-pointer transition-colors hover:bg-slate-700/30 ${!n.read ? 'bg-secondary-green/5' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-slate-300'}`}>
                        {n.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">{n.message}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{timeAgo(n.createdAt)}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!n.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                          className="p-1 text-slate-400 hover:text-secondary-green transition-colors"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

export default NotificationBell;
