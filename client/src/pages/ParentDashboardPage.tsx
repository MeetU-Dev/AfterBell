import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiBookOpen, FiCheckCircle, FiLoader, FiRefreshCw, FiTrash2, FiZap, FiAward, FiTrendingUp, FiSettings, FiX, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../api/client';

interface CompletedSkill {
  skillId: string;
  skillName: string;
  completedAt: string;
}

interface Teen {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  badges: any[];
  totalSkillsCompleted: number;
  totalGamesPlayed: number;
  completedSkills: CompletedSkill[];
}

interface TeenDetail extends Teen {
  lastActiveDate: string;
  completedByMonth: Record<string, number>;
  weeklyActivity: { day: string; count: number }[];
}

const rarityColors: Record<string, string> = {
  common: 'border-slate-500/30', rare: 'border-blue-500/40', epic: 'border-purple-500/40', legendary: 'border-amber-400/50',
};

const ParentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [teens, setTeens] = useState<Teen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [selectedTeen, setSelectedTeen] = useState<TeenDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [restrictedCats, setRestrictedCats] = useState<string[]>([]);
  const [notifPrefs, setNotifPrefs] = useState({ skillCompleted: true, weeklyReport: true, monthlyReport: false, streakMilestone: true });
  const [savingPrefs, setSavingPrefs] = useState(false);

  const token = localStorage.getItem('afterbell_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchTeens = useCallback(async (showRefreshing = false) => {
    if (!token) { setLoading(false); return; }
    if (showRefreshing) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/parent/teens`, { headers });
      const data = await res.json();
      if (data.success && data.teens) setTeens(data.teens);
      else setError(data.message || 'Failed to load');
    } catch { setError('Failed to load'); }
    finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useEffect(() => { fetchTeens(); }, [fetchTeens]);

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/parent/preferences`, { headers });
      const data = await res.json();
      if (data.success && data.data) {
        setRestrictedCats(data.data.restrictedCategories || []);
        setNotifPrefs(prev => ({ ...prev, ...(data.data.notifications || {}) }));
      }
    } catch {}
  }, [token]);

  useEffect(() => { if (user?.role === 'parent') fetchPreferences(); }, [user, fetchPreferences]);

  const fetchTeenDetail = async (teenId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/parent/teens/${teenId}`, { headers });
      const data = await res.json();
      if (data.success) setSelectedTeen(data.data);
    } catch {}
    setDetailLoading(false);
  };

  const handleUnlink = async (teenId: string, teenName: string) => {
    if (!window.confirm(`Remove ${teenName} from your account?`)) return;
    setUnlinkingId(teenId);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/parent/teens/${teenId}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.success) await fetchTeens(true);
      else setError(data.message || 'Failed to unlink');
    } catch { setError('Failed to unlink'); }
    finally { setUnlinkingId(null); }
  };

  const savePreferences = async () => {
    setSavingPrefs(true);
    try {
      await fetch(`${getApiUrl()}/api/v1/parent/preferences`, {
        method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ restrictedCategories: restrictedCats, notifications: notifPrefs }),
      });
      setShowSettings(false);
    } catch {}
    setSavingPrefs(false);
  };

  const toggleCategory = (cat: string) => {
    setRestrictedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  if (user && user.role !== 'parent' && user.role !== 'admin') return <Navigate to="/" replace />;

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const allCategories = ['finance', 'health', 'communication', 'career', 'technology', 'safety', 'life-skills'];

  if (selectedTeen) {
    const maxActivity = Math.max(...selectedTeen.weeklyActivity.map(w => w.count), 1);
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => setSelectedTeen(null)} className="flex items-center gap-1 text-slate-400 hover:text-white mb-4 transition-colors">
          <FiChevronRight className="w-4 h-4 rotate-180" /> Back to all teens
        </button>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary-green to-emerald-600 flex items-center justify-center text-xl font-bold text-white">
              {selectedTeen.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{selectedTeen.name}</h2>
              <p className="text-slate-400 text-sm">{selectedTeen.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-700/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-300">{selectedTeen.level}</p>
              <p className="text-xs text-slate-400">Level</p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-yellow-300">{selectedTeen.xp}</p>
              <p className="text-xs text-slate-400">XP</p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-300">{selectedTeen.currentStreak}</p>
              <p className="text-xs text-slate-400">Day Streak</p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-secondary-green">{selectedTeen.totalSkillsCompleted}</p>
              <p className="text-xs text-slate-400">Skills Done</p>
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="mb-4">
            <p className="text-sm text-slate-400 mb-2">This Week</p>
            <div className="flex items-end gap-2 h-20">
              {selectedTeen.weeklyActivity.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-secondary-green/20 rounded-t-md relative" style={{ height: `${(w.count / maxActivity) * 100}%`, minHeight: w.count > 0 ? '4px' : '2px' }}>
                    {w.count > 0 && <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-secondary-green font-medium">{w.count}</span>}
                  </div>
                  <span className="text-[10px] text-slate-500">{w.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          {selectedTeen.badges.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">Badges ({selectedTeen.badges.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedTeen.badges.slice(-6).map((b: any, i: number) => (
                  <div key={i} className={`px-2.5 py-1 rounded-lg bg-slate-700/30 border ${rarityColors[b.rarity] || 'border-slate-500/30'} flex items-center gap-1.5`}>
                    <span className="text-sm">{b.icon || '🏅'}</span>
                    <span className="text-xs text-slate-300">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Skills */}
          <div>
            <p className="text-sm text-slate-400 mb-2">Completed Skills ({selectedTeen.completedSkills.length})</p>
            {selectedTeen.completedSkills.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedTeen.completedSkills.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-slate-700/20 rounded-lg">
                    <span className="text-sm text-white">{s.skillName}</span>
                    <span className="text-[11px] text-slate-500">{formatDate(s.completedAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No skills completed yet</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Parent Dashboard</h1>
          <p className="text-slate-400">Welcome, {user?.name}. Monitor your teen's learning journey.</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'parent' && (
            <button onClick={() => setShowSettings(!showSettings)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-600/50 transition-colors">
              <FiSettings className="w-4 h-4" />
              Settings
            </button>
          )}
          <button onClick={() => fetchTeens(true)} disabled={refreshing} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-600/50 disabled:opacity-50 transition-colors">
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Parent Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><FiX className="w-5 h-5" /></button>
              </div>

              <div className="mb-5">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Restricted Skill Categories</h3>
                <p className="text-xs text-slate-500 mb-3">Blocked categories won't appear in your teen's app.</p>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map(cat => {
                    const blocked = restrictedCats.includes(cat);
                    return (
                      <button key={cat} onClick={() => toggleCategory(cat)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${blocked ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/50'}`}>
                        {blocked ? '🚫 ' : ''}{cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Notifications</h3>
                <div className="space-y-2">
                  {([
                    { key: 'skillCompleted', label: 'When a skill is completed' },
                    { key: 'weeklyReport', label: 'Weekly progress report' },
                    { key: 'monthlyReport', label: 'Monthly progress report' },
                    { key: 'streakMilestone', label: 'When a streak milestone is reached' },
                  ] as const).map(n => (
                    <label key={n.key} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={(notifPrefs as any)[n.key]} onChange={() => setNotifPrefs(prev => ({ ...prev, [n.key]: !(prev as any)[n.key] }))} className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-secondary-green focus:ring-secondary-green" />
                      <span className="text-sm text-slate-300">{n.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={savePreferences} disabled={savingPrefs} className="px-6 py-2 rounded-xl bg-secondary-green text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                {savingPrefs ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16"><FiLoader className="w-10 h-10 text-secondary-green animate-spin" /></div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">{error}</div>
      ) : teens.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 text-center">
          <FiUser className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No linked teens yet</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            When a teen signs up and adds your email, you'll get a verification link. After you approve, they'll appear here with their progress.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {teens.map((teen, index) => (
            <motion.div key={teen.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => fetchTeenDetail(teen.id)}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-green to-emerald-600 flex items-center justify-center text-lg font-bold text-white">
                    {teen.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white hover:text-secondary-green transition-colors">{teen.name}</h2>
                    <p className="text-slate-400 text-xs">{teen.email} · Joined {formatDate(teen.joinedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-green/20 text-secondary-green text-xs font-medium">
                    <FiCheckCircle className="w-3 h-3" />
                    {teen.completedSkills.length} skills
                  </span>
                  <button onClick={() => handleUnlink(teen.id, teen.name)} disabled={unlinkingId === teen.id}
                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors" title="Remove">
                    {unlinkingId === teen.id ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiTrash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-slate-700/20 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-amber-300">{teen.level}</p>
                  <p className="text-[10px] text-slate-500">Level</p>
                </div>
                <div className="bg-slate-700/20 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-yellow-300">{teen.xp}</p>
                  <p className="text-[10px] text-slate-500">XP</p>
                </div>
                <div className="bg-slate-700/20 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-orange-300">{teen.currentStreak}</p>
                  <p className="text-[10px] text-slate-500">Streak</p>
                </div>
                <div className="bg-slate-700/20 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-purple-300">{teen.badges.length}</p>
                  <p className="text-[10px] text-slate-500">Badges</p>
                </div>
              </div>

              {/* Recent badges */}
              {teen.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {teen.badges.slice(-4).map((b: any, i: number) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-slate-700/30 border border-slate-600/50 text-slate-400">
                      {b.icon || ''} {b.name}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentDashboardPage;
