import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiUser, FiLoader, FiCheck } from 'react-icons/fi';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../api/client';

const VerifyParentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teenName, setTeenName] = useState<string | null>(null);
  const [teenEmail, setTeenEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);
  const [parentName, setParentName] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing verification link.');
      setLoading(false);
      return;
    }
    const fetchInfo = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/v1/auth/verify-parent/${token}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Invalid or expired link.');
          return;
        }
        setTeenName(data.teenName);
        setTeenEmail(data.teenEmail);
      } catch {
        setError('Could not load verification details.');
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !parentPassword || parentPassword.length < 6) {
      setError('Please set a password (at least 6 characters).');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/auth/verify-parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          parentPassword,
          parentName: parentName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Approval failed.');
        setSubmitting(false);
        return;
      }
      if (data.token) {
        localStorage.setItem('afterbell_token', data.token);
        const u = data.user || {};
        const userData = { id: u.id || u._id, email: u.email, name: u.name, role: 'parent' };
        localStorage.setItem('afterbell_user', JSON.stringify(userData));
      }
      setSuccess(true);
      setTimeout(() => { window.location.href = '/parent/dashboard'; }, 1500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role === 'parent') {
    navigate('/parent/dashboard');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <FiLoader className="w-10 h-10 text-secondary-green animate-spin" />
      </div>
    );
  }

  if (error && !teenName) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/" className="text-secondary-green hover:underline">Back to home</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <FiCheck className="w-16 h-16 text-secondary-green mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Account approved!</h1>
        <p className="text-slate-300">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <motion.div
        className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link to="/" className="inline-block mb-4">
          <img src="/Logo.png" alt="AfterBell" className="h-10 w-auto" />
        </Link>
        <h1 className="text-2xl font-bold text-white mb-1">Approve account</h1>
        <p className="text-slate-400 mb-6">
          {teenName && <>Approve <strong className="text-white">{teenName}</strong>’s AfterBell account. Create your parent account below to approve and view their progress.</>}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Your name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-secondary-green"
                placeholder="Parent's name"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Set your password (min 6 characters)</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={parentPassword}
                onChange={(e) => setParentPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-secondary-green"
                placeholder="Password"
                minLength={6}
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting || parentPassword.length < 6}
            className="w-full py-3 rounded-xl font-semibold bg-secondary-green text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <FiLoader className="w-5 h-5 animate-spin" /> : 'Approve & create parent account'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyParentPage;
