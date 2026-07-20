import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import GamificationPanel from './GamificationPanel';
import NotificationBell from './NotificationBell';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { useThrottle, LazyImage } from './PerformanceOptimizer';

const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { updateStreak } = useGamification();
    const [didCheckin, setDidCheckin] = useState(false);

    useEffect(() => {
      if (user?.role === 'teen' && !didCheckin) {
        updateStreak();
        setDidCheckin(true);
      }
    }, [user, didCheckin, updateStreak]);

    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 50);
    }, []);

    const throttledHandleScroll = useThrottle(handleScroll, 16); // ~60fps

    useEffect(() => {
        window.addEventListener('scroll', throttledHandleScroll, { passive: true });
        return () => window.removeEventListener('scroll', throttledHandleScroll);
    }, [throttledHandleScroll]);

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 fast-transition gpu-accelerated ${isScrolled
                ? 'bg-slate-900/80 backdrop-blur-optimized border-b border-slate-700/30'
                : 'bg-slate-900/40 backdrop-blur-sm'
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
                willChange: 'transform, background-color, backdrop-filter',
                backfaceVisibility: 'hidden'
            }}
        >
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <motion.div
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link to="/" className="flex items-center space-x-3">
                            <LazyImage
                                src="/Logo.png"
                                alt="AfterBell"
                                className="h-9"
                            />
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <MagicLink href="/">Home</MagicLink>
                        {user ? (
                            <>
                                    {user.role === 'admin' ? (
                                        <>
                                            <MagicLink href="/admin">Admin Dashboard</MagicLink>
                                            <MagicLink href="/skills">Teen App</MagicLink>
                                            <MagicLink href="/stories">Stories</MagicLink>
                                            <MagicLink href="/notes">Notes</MagicLink>
                                            <MagicLink href="/parent/dashboard">Parent Dashboard</MagicLink>
                                        </>
                                    ) : user.role === 'parent' ? (
                                    <MagicLink href="/parent/dashboard">Parent Dashboard</MagicLink>
                                ) : (
                                    <>
                                        <MagicLink href="/skills">Skills</MagicLink>
                                        <MagicLink href="/stories">Stories</MagicLink>
                                        <MagicLink href="/analytics">Analytics</MagicLink>
                                        <MagicLink href="/notes">Notes</MagicLink>
                                        <MagicLink href="/profile">Profile</MagicLink>
                                    </>
                                )}
                                {user.role === 'teen' && (
                                  <div className="flex items-center">
                                    <GamificationPanel compact />
                                  </div>
                                )}
                                <NotificationBell />
                                <div className="flex items-center space-x-4">
                                    <Link to="/profile" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                                        <FiUser className="w-4 h-4" />
                                        <span className="text-sm">{user.name}</span>
                                        {user.role === 'admin' && (
                                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">Admin</span>
                                        )}
                                    </Link>
                                    <motion.button
                                        onClick={logout}
                                        className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FiLogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <>
                                <MagicLink href="/skills">Skills</MagicLink>
                                <MagicLink href="/stories">Stories</MagicLink>
                                <MagicLink href="/login">Login</MagicLink>
                                <Link to="/signup">
                                    <motion.button
                                        className="btn-primary px-6 py-2"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Sign Up
                                    </motion.button>
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <motion.div
                        className="md:hidden py-4 border-t border-slate-700/50"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="flex flex-col space-y-4">
                            <Link to="/" className="text-white hover:text-secondary-green transition-colors">Home</Link>
                            {user ? (
                                <>
                                    {user.role === 'admin' ? (
                                        <>
                                            <Link to="/admin" className="text-white hover:text-secondary-green transition-colors">Admin Dashboard</Link>
                                            <Link to="/skills" className="text-white hover:text-secondary-green transition-colors">Teen App</Link>
                                            <Link to="/stories" className="text-white hover:text-secondary-green transition-colors">Stories</Link>
                                            <Link to="/analytics" className="text-white hover:text-secondary-green transition-colors">Analytics</Link>
                                            <Link to="/notes" className="text-white hover:text-secondary-green transition-colors">Notes</Link>
                                            <Link to="/parent/dashboard" className="text-white hover:text-secondary-green transition-colors">Parent Dashboard</Link>
                                        </>
                                    ) : user.role === 'parent' ? (
                                        <Link to="/parent/dashboard" className="text-white hover:text-secondary-green transition-colors">Parent Dashboard</Link>
                                    ) : (
                                        <>
                                            <Link to="/skills" className="text-white hover:text-secondary-green transition-colors">Skills</Link>
                                            <Link to="/stories" className="text-white hover:text-secondary-green transition-colors">Stories</Link>
                                            <Link to="/analytics" className="text-white hover:text-secondary-green transition-colors">Analytics</Link>
                                            <Link to="/notes" className="text-white hover:text-secondary-green transition-colors">Notes</Link>
                                        </>
                                    )}
                                    <Link to={user.role === 'parent' ? '/parent/dashboard' : '/profile'} className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors py-2">
                                        <FiUser className="w-4 h-4" />
                                        <span className="text-sm">{user.name}</span>
                                        {user.role === 'admin' && (
                                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">Admin</span>
                                        )}
                                    </Link>
                                    <motion.button
                                        onClick={logout}
                                        className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors w-fit"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FiLogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </motion.button>
                                </>
                            ) : (
                                <>
                                    <Link to="/skills" className="text-white hover:text-secondary-green transition-colors">Skills</Link>
                                    <Link to="/stories" className="text-white hover:text-secondary-green transition-colors">Stories</Link>
                                    <Link to="/login" className="text-white hover:text-secondary-green transition-colors">Login</Link>
                                    <Link to="/signup">
                                        <motion.button
                                            className="btn-primary px-6 py-2 w-fit"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Sign Up
                                        </motion.button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.header>
    );
};

// Magic Link Component with animated highlight
const MagicLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
    return (
        <motion.div
            className="relative group"
            whileHover={{ scale: 1.05 }}
        >
            <Link
                to={href}
                className="relative text-gray-300 hover:text-white transition-colors duration-300 font-medium"
            >
                {children}
                <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary-green origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </Link>
        </motion.div>
    );
};

export default Header; 