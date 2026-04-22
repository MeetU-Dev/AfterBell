import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isLogoPulsing, setIsLogoPulsing] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (value.length > 0 && !isLogoPulsing) {
            setIsLogoPulsing(true);
            setTimeout(() => setIsLogoPulsing(false), 1000);
        }
        // Clear password error when user starts typing
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: undefined }));
        }
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        // Clear email error when user starts typing
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setHasSubmitted(true);
        setErrors({}); // Clear previous errors

        if (!validateForm()) return;

        try {
            const result = await login(email, password);

            if (result.success) {
                showToast('success', 'Welcome back!', 'Successfully logged in to AfterBell', 1000);
                const path = result.role === 'parent' ? '/parent/dashboard' : result.role === 'admin' ? '/skills' : '/skills';
                setTimeout(() => navigate(path), 1000);
            } else {
                setErrors({ general: 'Invalid email or password. Please try again.' });
            }
        } catch (error) {
            setErrors({ general: 'Login failed. Please try again.' });
        }
    };

    return (
        <motion.div
            className="h-[calc(100vh-5rem)] flex relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Left Side - Image Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-shrink-0">
                {/* Background Image */}
                <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                    <img
                        src="/LoginPicture.png"
                        alt="AfterBell Learning"
                        className="max-w-[90%] max-h-[90%] w-auto h-auto object-contain object-center"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-transparent" />
                </div>

                {/* Interactive Floating Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Glowing Orbs */}
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-3 h-3 bg-secondary-green/60 rounded-full blur-sm"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.6, 1, 0.6],
                            y: [-10, 10, -10],
                            x: [-5, 5, -5]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-400/50 rounded-full blur-sm"
                        animate={{
                            scale: [1, 1.8, 1],
                            opacity: [0.4, 0.8, 0.4],
                            y: [0, -15, 0],
                            x: [0, 8, 0]
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                    />
                    <motion.div
                        className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-purple-400/40 rounded-full blur-sm"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0.9, 0.5],
                            y: [0, 12, 0],
                            x: [0, -8, 0]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                    />

                    {/* Floating Particles */}
                    <motion.div
                        className="absolute top-1/5 right-1/4 w-1 h-1 bg-white/30 rounded-full"
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.3, 0.8, 0.3],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/5 w-1 h-1 bg-secondary-green/40 rounded-full"
                        animate={{
                            y: [0, 25, 0],
                            opacity: [0.4, 0.7, 0.4],
                            scale: [1, 1.5, 1]
                        }}
                        transition={{
                            duration: 4.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1.5
                        }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/5 w-1 h-1 bg-blue-300/50 rounded-full"
                        animate={{
                            y: [0, -15, 0],
                            x: [0, 10, 0],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 5.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2.5
                        }}
                    />

                    {/* Enhanced Sparkle Effects */}
                    <motion.div
                        className="absolute top-1/3 left-1/2 w-2 h-2 bg-yellow-300/60 rounded-full shadow-lg shadow-yellow-300/50"
                        animate={{
                            scale: [0, 1.2, 0],
                            opacity: [0, 1, 0],
                            rotate: [0, 180, 360],
                            y: [0, -10, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                        }}
                    />
                    <motion.div
                        className="absolute bottom-1/3 right-1/2 w-1.5 h-1.5 bg-white/70 rounded-full shadow-lg shadow-white/50"
                        animate={{
                            scale: [0, 1.8, 0],
                            opacity: [0, 0.9, 0],
                            rotate: [0, -180, -360],
                            y: [0, 15, 0]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1.8
                        }}
                    />
                    <motion.div
                        className="absolute top-1/4 right-1/3 w-1 h-1 bg-secondary-green/50 rounded-full shadow-lg shadow-secondary-green/50"
                        animate={{
                            scale: [0, 1.5, 0],
                            opacity: [0, 0.8, 0],
                            rotate: [0, 360, 720],
                            x: [0, 8, 0]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2.5
                        }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-400/50 rounded-full shadow-lg shadow-purple-400/50"
                        animate={{
                            scale: [0, 1.3, 0],
                            opacity: [0, 0.7, 0],
                            rotate: [0, -360, -720],
                            x: [0, -12, 0]
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 3.5
                        }}
                    />

                    {/* Energy Waves */}
                    <motion.div
                        className="absolute top-1/4 right-1/4 w-8 h-8 border border-secondary-green/20 rounded-full"
                        animate={{
                            scale: [1, 2, 1],
                            opacity: [0.3, 0, 0.3]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeOut"
                        }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 left-1/4 w-6 h-6 border border-blue-400/20 rounded-full"
                        animate={{
                            scale: [1, 1.8, 1],
                            opacity: [0.4, 0, 0.4]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 2
                        }}
                    />

                    {/* Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <motion.line
                            x1="25%"
                            y1="30%"
                            x2="35%"
                            y2="40%"
                            stroke="url(#gradient1)"
                            strokeWidth="0.5"
                            opacity="0.3"
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                                strokeDasharray: ["0,100", "100,0", "0,100"]
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <motion.line
                            x1="65%"
                            y1="60%"
                            x2="75%"
                            y2="70%"
                            stroke="url(#gradient2)"
                            strokeWidth="0.5"
                            opacity="0.3"
                            animate={{
                                opacity: [0.3, 0.5, 0.3],
                                strokeDasharray: ["0,100", "100,0", "0,100"]
                            }}
                            transition={{
                                duration: 7,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 3
                            }}
                        />
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                            </linearGradient>
                            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Animated background elements for left side */}
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-secondary-green/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 lg:w-1/2 flex items-center justify-center px-6 py-8 lg:px-12 relative">
                {/* Enhanced Animated Background Elements */}
                <motion.div
                    className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                        scale: [1, 0.8, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <motion.div
                    className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-secondary-green/10 to-blue-500/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, 80, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.2, 1],
                        rotate: [0, -180, -360]
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 5
                    }}
                />

                {/* Enhanced Floating Particles */}
                <motion.div
                    className="absolute top-1/4 right-1/4 w-3 h-3 bg-secondary-green rounded-full opacity-60 shadow-lg shadow-secondary-green/50"
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 10, 0],
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60 shadow-lg shadow-blue-400/50"
                    animate={{
                        y: [0, 20, 0],
                        x: [0, -15, 0],
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
                <motion.div
                    className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-70 shadow-lg shadow-purple-400/50"
                    animate={{
                        y: [0, -25, 0],
                        x: [0, 20, 0],
                        opacity: [0.7, 1, 0.7],
                        scale: [1, 1.4, 1]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/5 w-2.5 h-2.5 bg-yellow-400 rounded-full opacity-50 shadow-lg shadow-yellow-400/50"
                    animate={{
                        y: [0, 35, 0],
                        x: [0, -25, 0],
                        opacity: [0.5, 0.9, 0.5],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 3
                    }}
                />

                {/* Floating Icons */}
                <motion.div
                    className="absolute top-1/6 left-1/6 text-secondary-green/30 text-2xl"
                    animate={{
                        y: [0, -15, 0],
                        rotate: [0, 5, 0],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                </motion.div>
                <motion.div
                    className="absolute bottom-1/6 right-1/6 text-blue-400/30 text-xl"
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -8, 0],
                        opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 4
                    }}
                >
                </motion.div>
                <motion.div
                    className="absolute top-2/3 left-1/5 text-purple-400/30 text-lg"
                    animate={{
                        y: [0, -18, 0],
                        x: [0, 12, 0],
                        rotate: [0, 12, 0],
                        opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{
                        duration: 9,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                >
                </motion.div>

                {/* Login Form Container */}
                <motion.div
                    className="w-full max-w-md relative"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.div
                        className="relative bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-slate-700/50 max-h-[80vh] overflow-y-auto hover:border-secondary-green/30 transition-all duration-500"
                        whileHover={{
                            scale: 1.02,
                            boxShadow: "0 25px 50px -12px rgba(80, 200, 120, 0.25)"
                        }}
                    >


                        {/* Card content */}
                        <div className="relative z-10">
                            {/* Logo */}
                            <motion.div
                                className="text-center mb-6"
                                animate={isLogoPulsing ? {
                                    scale: [1, 1.05, 1],
                                    filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                                } : {}}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                            >
                                <Link to="/">
                                    <motion.div
                                        className="flex justify-center mb-2"
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <img
                                            src="/Logo.png"
                                            alt="AfterBell"
                                            className="h-12 w-auto cursor-pointer transition-all duration-300 hover:drop-shadow-lg hover:drop-shadow-secondary-green/50"
                                        />
                                    </motion.div>
                                </Link>
                                <motion.p
                                    className="text-slate-400 text-sm md:text-base leading-relaxed tracking-wide"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                    Ready for another amazing learning adventure?
                                    <motion.span
                                        className="inline-block ml-1"
                                        animate={{
                                            rotate: [0, 10, -10, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: 1
                                        }}
                                    >
                                    </motion.span>
                                </motion.p>
                            </motion.div>

                            {/* Login Form */}
                            <motion.form
                                className="space-y-4 md:space-y-5"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                onSubmit={handleSubmit}
                            >
                                {/* Email Input */}
                                <div className="relative group">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-secondary-green/20 to-blue-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
                                        initial={false}
                                    />
                                    <motion.div
                                        className="absolute -inset-1 bg-gradient-to-r from-secondary-green/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"
                                        initial={false}
                                    />
                                    <FiMail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10 transition-all duration-300 ${isEmailFocused ? 'text-secondary-green scale-110 drop-shadow-lg' : 'text-slate-400'}`} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        onFocus={() => setIsEmailFocused(true)}
                                        onBlur={() => setIsEmailFocused(false)}
                                        className={`relative w-full pl-12 pr-4 py-3 md:py-4 bg-slate-700/30 backdrop-blur-lg border-2 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-secondary-green transition-all duration-300 group-hover:border-slate-500/50 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-600/50'}`}
                                        placeholder="Your Email Address"
                                        aria-describedby={errors.email ? "email-error" : undefined}
                                    />
                                </div>

                                {/* Password Input */}
                                <div className="relative group">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-secondary-green/20 to-blue-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
                                        initial={false}
                                    />
                                    <motion.div
                                        className="absolute -inset-1 bg-gradient-to-r from-secondary-green/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"
                                        initial={false}
                                    />
                                    <FiLock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10 transition-all duration-300 ${isPasswordFocused ? 'text-secondary-green scale-110 drop-shadow-lg' : 'text-slate-400'}`} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => handlePasswordChange(e.target.value)}
                                        onFocus={() => setIsPasswordFocused(true)}
                                        onBlur={() => setIsPasswordFocused(false)}
                                        className={`relative w-full pl-12 pr-12 py-3 md:py-4 bg-slate-700/30 backdrop-blur-lg border-2 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-secondary-green transition-all duration-300 group-hover:border-slate-500/50 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-600/50'}`}
                                        placeholder="Your Secret Password"
                                        aria-describedby={errors.password ? "password-error" : undefined}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200 z-10"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Remember Me Checkbox */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 text-secondary-green bg-slate-700 border-slate-600 rounded focus:ring-secondary-green focus:ring-2"
                                        />
                                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                            Remember me
                                        </span>
                                    </label>
                                </div>

                                {/* Validation Error Message */}
                                <AnimatePresence>
                                    {hasSubmitted && (errors.email || errors.password || errors.general) && (
                                        <motion.div
                                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <div className="text-red-400 text-sm">
                                                {errors.general && <div>• {errors.general}</div>}
                                                {errors.email && <div>• {errors.email}</div>}
                                                {errors.password && <div>• {errors.password}</div>}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Sign In Button */}
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`relative overflow-hidden w-full font-bold py-3 md:py-4 px-6 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-secondary-green/50 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg ${isLoading
                                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-secondary-green to-emerald-500 text-white hover:shadow-2xl hover:shadow-secondary-green/30 hover:-translate-y-1'
                                        }`}
                                    whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
                                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                                >
                                    <span className="relative z-10">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <FiLoader className="w-5 h-5 animate-spin" />
                                                <span>Starting Your Adventure...</span>
                                            </div>
                                        ) : (
                                            'Start Learning Adventure!'
                                        )}
                                    </span>
                                    {!isLoading && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: '100%' }}
                                            transition={{ duration: 0.6 }}
                                        />
                                    )}
                                </motion.button>

                                {/* Divider */}
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-600/50" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-slate-800/50 text-slate-400">OR CONTINUE WITH</span>
                                    </div>
                                </div>

                                {/* Social Login Buttons */}
                                <div className="grid grid-cols-3 gap-2 md:gap-3">
                                    {/* Google */}
                                    <motion.button
                                        type="button"
                                        className="flex items-center justify-center p-2 md:p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-300 group relative overflow-hidden shadow-md hover:shadow-lg"
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        aria-label="Sign in with Google"
                                    >
                                        <FcGoogle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                    </motion.button>

                                    {/* Facebook */}
                                    <motion.button
                                        type="button"
                                        className="flex items-center justify-center p-2 md:p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-300 group relative overflow-hidden shadow-md hover:shadow-lg"
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        aria-label="Sign in with Facebook"
                                    >
                                        <FaFacebook className="w-5 h-5 text-blue-500 transition-transform duration-300 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                    </motion.button>

                                    {/* X (Twitter) */}
                                    <motion.button
                                        type="button"
                                        className="flex items-center justify-center p-2 md:p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-300 group relative overflow-hidden shadow-md hover:shadow-lg"
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        aria-label="Sign in with X"
                                    >
                                        <FaTwitter className="w-5 h-5 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                    </motion.button>
                                </div>
                            </motion.form>

                            {/* Links */}
                            <motion.div
                                className="mt-4 text-center space-y-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            >
                                <a
                                    href="/forgot-password"
                                    className="block text-sm text-slate-400 hover:text-secondary-green transition-colors duration-200"
                                >
                                    Forgot Password?
                                </a>
                                <div className="text-sm text-slate-500">
                                    Don't have an account?{' '}
                                    <Link
                                        to="/signup"
                                        className="text-secondary-green hover:text-secondary-green/80 transition-colors duration-200 font-medium"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LoginPage;
