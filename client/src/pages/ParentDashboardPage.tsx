import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiBookOpen, FiCheckCircle, FiLoader, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
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
  completedSkills: CompletedSkill[];
}

const ParentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [teens, setTeens] = useState<Teen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  const fetchTeens = useCallback(async (showRefreshing = false) => {
    const token = localStorage.getItem('afterbell_token');
    if (!token) {
      setLoading(false);
      return;
    }
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/parent/teens`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.teens) setTeens(data.teens);
      else setError(data.message || 'Failed to load');
    } catch {
      setError('Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTeens();
  }, [fetchTeens]);

  const handleUnlink = async (teenId: string, teenName: string) => {
    if (!window.confirm(`Remove ${teenName} from your account? They will need to be re-approved to link again.`)) return;
    const token = localStorage.getItem('afterbell_token');
    if (!token) return;
    setUnlinkingId(teenId);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/parent/teens/${teenId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) await fetchTeens(true);
      else setError(data.message || 'Failed to unlink');
    } catch {
      setError('Failed to unlink');
    } finally {
      setUnlinkingId(null);
    }
  };

  if (user && user.role !== 'parent' && user.role !== 'admin') return <Navigate to="/" replace />;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Parent Dashboard</h1>
          <p className="text-slate-400">
            Welcome, {user?.name || 'Parent'}. {user?.role === 'admin' && 'Admin view. '}
            See your linked teens and their course progress below.
          </p>
        </div>
        {!loading && teens.length >= 0 && (
          <button
            type="button"
            onClick={() => fetchTeens(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <FiLoader className="w-10 h-10 text-secondary-green animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">{error}</div>
      ) : teens.length === 0 ? (
        <motion.div
          className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FiUser className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No linked teens yet</h2>
          <p className="text-slate-400 text-sm">
            When a teen signs up and adds your email, you’ll get a verification link. After you approve, they’ll appear here with their course progress.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {teens.map((teen, index) => (
            <motion.div
              key={teen.id}
              className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary-green/20 flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-secondary-green" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{teen.name}</h2>
                    <p className="text-slate-400 text-sm">{teen.email}</p>
                    <p className="text-slate-500 text-xs mt-0.5">Joined {formatDate(teen.joinedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-green/20 text-secondary-green text-sm font-medium">
                    <FiCheckCircle className="w-4 h-4" />
                    {teen.completedSkills.length} skill{teen.completedSkills.length !== 1 ? 's' : ''} completed
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUnlink(teen.id, teen.name)}
                    disabled={unlinkingId === teen.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-sm font-medium disabled:opacity-50"
                    title="Remove from your account"
                  >
                    {unlinkingId === teen.id ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                    Remove
                  </button>
                </div>
              </div>

              {teen.completedSkills.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Completed skills</h3>
                  <ul className="space-y-2">
                    {teen.completedSkills.map((s, i) => (
                      <li key={i} className="flex items-center justify-between py-2 px-3 bg-slate-700/30 rounded-lg">
                        <span className="text-white font-medium">{s.skillName}</span>
                        <span className="text-slate-400 text-xs">{formatDate(s.completedAt)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-3 px-4 bg-slate-700/20 rounded-lg text-slate-400 text-sm">
                  <FiBookOpen className="w-4 h-4 flex-shrink-0" />
                  No skills completed yet. Progress will appear here when they finish courses.
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        className="mt-8 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl text-slate-400 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        When we add end-of-course exams, evaluation reports and scores will show here and can be sent to you by email.
      </motion.div>
    </div>
  );
};

export default ParentDashboardPage;
