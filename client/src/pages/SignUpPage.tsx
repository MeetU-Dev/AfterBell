import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiLoader, FiCheck, FiPhone } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignUpPage: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
        role: 'teen' as 'teen' | 'parent',
        parentEmail: '',
        parentPhone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLogoPulsing, setIsLogoPulsing] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [parentVerifyUrl, setParentVerifyUrl] = useState<string | null>(null);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Logo pulse effect for password fields
        if ((field === 'password' || field === 'confirmPassword') && typeof value === 'string' && value.length > 0 && !isLogoPulsing) {
            setIsLogoPulsing(true);
            setTimeout(() => setIsLogoPulsing(false), 1000);
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        }

        if (formData.role === 'teen') {
            if (!formData.parentEmail?.trim()) {
                newErrors.parentEmail = 'Parent email is required so they can approve your account';
            } else if (!/\S+@\S+\.\S+/.test(formData.parentEmail.trim())) {
                newErrors.parentEmail = 'Please enter a valid parent email';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setHasSubmitted(true);
        if (!validateForm()) return;
        setIsLoading(true);
        setParentVerifyUrl(null);
        setSignupSuccess(false);
        const result = await register({
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
            email: formData.email,
            password: formData.password,
            role: formData.role,
            parentEmail: formData.role === 'teen' ? formData.parentEmail.trim() : undefined,
            parentPhone: formData.role === 'teen' && formData.parentPhone?.trim() ? formData.parentPhone.trim() : undefined,
        });
        setIsLoading(false);
        if (result.success) {
            setSignupSuccess(true);
            if (result.parentVerifyUrl) setParentVerifyUrl(result.parentVerifyUrl);
            if (formData.role === 'parent') navigate('/parent/dashboard');
            else if (!result.parentVerifyUrl) navigate('/skills');
        } else {
            setErrors({ submit: result.message || 'Registration failed' });
        }
    };

    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, color: 'bg-slate-600', text: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const strengthMap = {
            1: { color: 'bg-red-500', text: 'Weak' },
            2: { color: 'bg-orange-500', text: 'Fair' },
            3: { color: 'bg-yellow-500', text: 'Good' },
            4: { color: 'bg-blue-500', text: 'Strong' },
            5: { color: 'bg-green-500', text: 'Very Strong' }
        };

        return { strength, ...strengthMap[strength as keyof typeof strengthMap] };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <motion.div
            className="h-[calc(100vh-5rem)] flex relative"
            style={{ transform: 'none' }}
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

                    {/* Sparkle Effects */}
                    <motion.div
                        className="absolute top-1/3 left-1/2 w-1.5 h-1.5 bg-yellow-300/60 rounded-full"
                        animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                            rotate: [0, 180, 360]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                        }}
                    />
                    <motion.div
                        className="absolute bottom-1/3 right-1/2 w-1 h-1 bg-white/70 rounded-full"
                        animate={{
                            scale: [0, 1.5, 0],
                            opacity: [0, 0.8, 0],
                            rotate: [0, -180, -360]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1.8
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
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex-1 lg:w-1/2 flex items-center justify-center px-4 py-6 sm:px-6 md:px-8 lg:px-12 xl:px-16 overflow-y-auto relative" style={{ transform: 'none' }}>
                {/* Decorative layer - does not block form inputs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Enhanced Animated Background Elements */}
                <motion.div
                    className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, -120, 0],
                        y: [0, 60, 0],
                        scale: [1, 0.9, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: 28,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <motion.div
                    className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-secondary-green/10 to-blue-500/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, 90, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.3, 1],
                        rotate: [0, -180, -360]
                    }}
                    transition={{
                        duration: 32,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 6
                    }}
                />

                {/* Enhanced Floating Particles */}
                <motion.div
                    className="absolute top-1/4 right-1/4 w-3 h-3 bg-secondary-green rounded-full opacity-60 shadow-lg shadow-secondary-green/50"
                    animate={{
                        y: [0, -35, 0],
                        x: [0, 15, 0],
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60 shadow-lg shadow-blue-400/50"
                    animate={{
                        y: [0, 25, 0],
                        x: [0, -20, 0],
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.4, 1]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
                <motion.div
                    className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-70 shadow-lg shadow-purple-400/50"
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 25, 0],
                        opacity: [0.7, 1, 0.7],
                        scale: [1, 1.5, 1]
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/5 w-2.5 h-2.5 bg-yellow-400 rounded-full opacity-50 shadow-lg shadow-yellow-400/50"
                    animate={{
                        y: [0, 40, 0],
                        x: [0, -30, 0],
                        opacity: [0.5, 0.9, 0.5],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 3
                    }}
                />
                <motion.div
                    className="absolute top-1/3 left-1/6 w-2 h-2 bg-pink-400 rounded-full opacity-60 shadow-lg shadow-pink-400/50"
                    animate={{
                        y: [0, -20, 0],
                        x: [0, 18, 0],
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{
                        duration: 9,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 4
                    }}
                />

                {/* Floating Icons */}
                <motion.div
                    className="absolute top-1/6 left-1/6 text-secondary-green/30 text-2xl"
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 8, 0],
                        opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                </motion.div>
                <motion.div
                    className="absolute bottom-1/6 right-1/6 text-blue-400/30 text-xl"
                    animate={{
                        y: [0, 25, 0],
                        rotate: [0, -10, 0],
                        opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 5
                    }}
                >
                </motion.div>
                <motion.div
                    className="absolute top-2/3 left-1/5 text-purple-400/30 text-lg"
                    animate={{
                        y: [0, -22, 0],
                        x: [0, 15, 0],
                        rotate: [0, 15, 0],
                        opacity: [0.3, 0.9, 0.3]
                    }}
                    transition={{
                        duration: 11,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 3
                    }}
                >
                </motion.div>
                <motion.div
                    className="absolute bottom-1/3 right-1/4 text-pink-400/30 text-lg"
                    animate={{
                        y: [0, 18, 0],
                        x: [0, -12, 0],
                        rotate: [0, -12, 0],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 13,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                >
                </motion.div>
                </div>
                {/* Signup Form Container - above decorative layer so inputs are clickable */}
                <motion.div
                    className="w-full max-w-md sm:max-w-lg md:max-w-xl relative z-10"
                    style={{ transform: 'none' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.div
                        className="relative bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl border border-slate-700/50 max-h-[80vh] overflow-y-auto hover:border-secondary-green/30 transition-all duration-500"
                        whileHover={{
                            scale: 1.02,
                            boxShadow: "0 25px 50px -12px rgba(80, 200, 120, 0.25)"
                        }}
                    >


                        {/* Card content */}
                        <div className="relative z-10">
                            {/* Logo */}
                            <motion.div
                                className="text-center mb-6 sm:mb-8 md:mb-10"
                                animate={isLogoPulsing ? {
                                    scale: [1, 1.05, 1],
                                    filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                                } : {}}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                            >
                                <Link to="/">
                                    <motion.div
                                        className="flex justify-center mb-3 sm:mb-4"
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <img
                                            src="/Logo.png"
                                            alt="AfterBell"
                                            className="h-10 sm:h-12 md:h-14 w-auto cursor-pointer transition-all duration-300 hover:drop-shadow-lg hover:drop-shadow-secondary-green/50"
                                        />
                                    </motion.div>
                                </Link>
                                <motion.h1
                                    className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-white mb-2 sm:mb-3 leading-tight"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                    Join the Learning Adventure!
                                </motion.h1>
                                <motion.p
                                    className="text-slate-400 text-sm sm:text-base leading-relaxed tracking-wide"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                >
                                    Create your account and unlock a world of exciting discoveries!
                                    <motion.span
                                        className="inline-block ml-1"
                                        animate={{
                                            rotate: [0, 15, -15, 0],
                                            scale: [1, 1.2, 1]
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: 2
                                        }}
                                    >
                                    </motion.span>
                                </motion.p>
                            </motion.div>

                            {/* Signup Form */}
                            <motion.form
                                className="space-y-4 md:space-y-5"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                onSubmit={handleSubmit}
                            >
                                {/* Name Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 lg:gap-5">
                                    {/* First Name */}
                                    <div className="relative group">
                                        <motion.div
                                            className="absolute -inset-1 bg-gradient-to-r from-secondary-green/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none"
                                            initial={false}
                                        />
                                        <FiUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10 transition-all duration-300 ${focusedField === 'firstName' ? 'text-secondary-green scale-110 drop-shadow-sm drop-shadow-secondary-green/50' : 'text-slate-300'} pointer-events-none`} />
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            autoComplete="given-name"
                                            onFocus={() => setFocusedField('firstName')}
                                            onBlur={() => setFocusedField(null)}
                                            className={`w-full pl-12 pr-4 py-2.5 sm:py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green focus:border-transparent transition-all duration-300 group-hover:border-slate-500/50 shadow-sm ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-slate-600/50'}`}
                                            placeholder="Your First Name"
                                            aria-describedby={errors.firstName ? "firstName-error" : undefined}
                                        />

                                    </div>

                                    {/* Last Name */}
                                    <div className="relative group">
                                        <motion.div
                                            className="absolute -inset-1 bg-gradient-to-r from-secondary-green/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none"
                                            initial={false}
                                        />
                                        <FiUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10 transition-all duration-300 ${focusedField === 'lastName' ? 'text-secondary-green scale-110 drop-shadow-sm drop-shadow-secondary-green/50' : 'text-slate-300'} pointer-events-none`} />
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            autoComplete="family-name"
                                            onFocus={() => setFocusedField('lastName')}
                                            onBlur={() => setFocusedField(null)}
                                            className={`w-full pl-12 pr-4 py-2.5 sm:py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green focus:border-transparent transition-all duration-300 group-hover:border-slate-500/50 shadow-sm ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-slate-600/50'}`}
                                            placeholder="Your Last Name"
                                            aria-describedby={errors.lastName ? "lastName-error" : undefined}
                                        />

                                    </div>
                                </div>

                                {/* Email */}
                                <div className="relative group">
                                    <motion.div
                                        className="absolute -inset-1 bg-gradient-to-r from-secondary-green/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none"
                                        initial={false}
                                    />
                                    <FiMail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10 transition-all duration-300 ${focusedField === 'email' ? 'text-secondary-green scale-110 drop-shadow-sm drop-shadow-secondary-green/50' : 'text-slate-300'} pointer-events-none`} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        autoComplete="email"
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full pl-12 pr-4 py-2.5 sm:py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green focus:border-transparent transition-all duration-300 group-hover:border-slate-500/50 shadow-sm ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-600/50'}`}
                                        placeholder="Your Email Address"
                                        aria-describedby={errors.email ? "email-error" : undefined}
                                    />
                                </div>

                                {/* I am a - theme-matched pill toggle */}
                                <div className="flex gap-0 p-1 bg-slate-700/50 border border-slate-600/50 rounded-xl">
                                    <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg cursor-pointer transition-all duration-300 ${formData.role === 'teen' ? 'bg-secondary-green/20 border border-secondary-green/50 text-secondary-green shadow-sm' : 'text-slate-400 hover:text-slate-300 border border-transparent'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            checked={formData.role === 'teen'}
                                            onChange={() => handleInputChange('role', 'teen')}
                                            className="sr-only"
                                        />
                                        <span className="font-medium">Student</span>
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg cursor-pointer transition-all duration-300 ${formData.role === 'parent' ? 'bg-secondary-green/20 border border-secondary-green/50 text-secondary-green shadow-sm' : 'text-slate-400 hover:text-slate-300 border border-transparent'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            checked={formData.role === 'parent'}
                                            onChange={() => handleInputChange('role', 'parent')}
                                            className="sr-only"
                                        />
                                        <span className="font-medium">Parent</span>
                                    </label>
                                </div>

                                {formData.role === 'teen' && (
                                    <>
                                        <div className="relative group">
                                            <FiMail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10 ${focusedField === 'parentEmail' ? 'text-secondary-green' : 'text-slate-300'} pointer-events-none`} />
                                            <input
                                                type="email"
                                                value={formData.parentEmail}
                                                onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                                                onFocus={() => setFocusedField('parentEmail')}
                                                onBlur={() => setFocusedField(null)}
                                                className={`w-full pl-12 pr-4 py-2.5 sm:py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green relative z-10 ${errors.parentEmail ? 'border-red-500' : 'border-slate-600/50'}`}
                                                placeholder="Parent's email (they will approve your account)"
                                                autoComplete="email"
                                            />
                                            {errors.parentEmail && <p className="text-red-400 text-xs mt-1">{errors.parentEmail}</p>}
                                        </div>
                                        <div className="relative group">
                                            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none z-10" />
                                            <input
                                                type="tel"
                                                value={formData.parentPhone}
                                                onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                                                onFocus={() => setFocusedField('parentPhone')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green relative z-10"
                                                placeholder="Parent's phone (optional)"
                                                autoComplete="tel"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Password */}
                                <div className="relative group">
                                    <motion.div
                                        className="absolute -inset-1 bg-gradient-to-r from-secondary-green/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none"
                                        initial={false}
                                    />
                                    <FiLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10 transition-all duration-300 ${focusedField === 'password' ? 'text-secondary-green scale-110 drop-shadow-sm drop-shadow-secondary-green/50' : 'text-slate-300'} pointer-events-none`} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full pl-12 pr-12 py-2.5 sm:py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green focus:border-transparent transition-all duration-300 group-hover:border-slate-500/50 shadow-sm ${errors.password ? 'border-red-500 focus:ring-red-500' : formData.password ? (passwordStrength.strength <= 2 ? 'border-red-500' : passwordStrength.strength <= 3 ? 'border-yellow-500' : 'border-green-500') : 'border-slate-600/50'}`}
                                        placeholder="Create Your Secret Password"
                                        aria-describedby={errors.password ? "password-error" : undefined}
                                    />
                                    {/* Password Strength Indicator - Inside Input */}
                                    {formData.password && (
                                        <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`w-1 h-3 rounded-full transition-all duration-300 ${level <= passwordStrength.strength
                                                        ? passwordStrength.color
                                                        : 'bg-slate-600'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200 z-10"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Confirm Password */}
                                <div className="relative group">
                                    <motion.div
                                        className="absolute -inset-1 bg-gradient-to-r from-secondary-green/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none"
                                        initial={false}
                                    />
                                    <FiLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10 transition-all duration-300 ${focusedField === 'confirmPassword' ? 'text-secondary-green scale-110 drop-shadow-sm drop-shadow-secondary-green/50' : 'text-slate-300'} pointer-events-none`} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        onFocus={() => setFocusedField('confirmPassword')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full pl-12 pr-12 py-2.5 sm:py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green focus:border-transparent transition-all duration-300 group-hover:border-slate-500/50 shadow-sm ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : formData.confirmPassword ? (formData.password === formData.confirmPassword ? 'border-green-500' : 'border-red-500') : 'border-slate-600/50'}`}
                                        placeholder="Confirm Your Secret Password"
                                        aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                                    />
                                    {/* Password Match Indicator - Inside Input */}
                                    {formData.confirmPassword && (
                                        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                                            {formData.password === formData.confirmPassword ? (
                                                <FiCheck className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <div className="w-4 h-4 border-2 border-red-400 rounded-full" />
                                            )}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200 z-10"
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="space-y-3 sm:space-y-4">
                                    <label className="flex items-start space-x-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.agreeToTerms}
                                            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                                            className="mt-1 w-4 h-4 text-secondary-green bg-slate-700 border-slate-600 rounded focus:ring-secondary-green focus:ring-2"
                                        />
                                        <div className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                            <span>I agree to the </span>
                                            <a href="/terms" className="text-secondary-green hover:text-secondary-green/80 transition-colors font-medium">
                                                Terms of Service
                                            </a>
                                            <span> and </span>
                                            <a href="/privacy" className="text-secondary-green hover:text-secondary-green/80 transition-colors font-medium">
                                                Privacy Policy
                                            </a>
                                        </div>
                                    </label>

                                </div>

                                {/* Success: Parent must verify */}
                                {signupSuccess && formData.role === 'teen' && (
                                    <motion.div
                                        className="p-4 bg-secondary-green/10 border border-secondary-green/30 rounded-lg"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <p className="text-secondary-green font-medium">Account created!</p>
                                        <p className="text-slate-300 text-sm mt-1">Ask your parent to check their email and approve your account.</p>
                                        {parentVerifyUrl && (
                                            <p className="text-slate-400 text-xs mt-2 break-all">
                                                Dev link: <a href={parentVerifyUrl} className="text-secondary-green underline" target="_blank" rel="noreferrer">{parentVerifyUrl}</a>
                                            </p>
                                        )}
                                    </motion.div>
                                )}

                                {/* Validation Error Message */}
                                <AnimatePresence>
                                    {hasSubmitted && Object.keys(errors).length > 0 && (
                                        <motion.div
                                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <div className="text-red-400 text-sm space-y-1">
                                                {errors.firstName && <div>• {errors.firstName}</div>}
                                                {errors.lastName && <div>• {errors.lastName}</div>}
                                                {errors.email && <div>• {errors.email}</div>}
                                                {errors.parentEmail && <div>• {errors.parentEmail}</div>}
                                                {errors.password && <div>• {errors.password}</div>}
                                                {errors.confirmPassword && <div>• {errors.confirmPassword}</div>}
                                                {errors.agreeToTerms && <div>• {errors.agreeToTerms}</div>}
                                                {errors.submit && <div>• {errors.submit}</div>}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Sign Up Button */}
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
                                                <FiLoader className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                                <span>Preparing Your Adventure...</span>
                                            </div>
                                        ) : (
                                            'Start Your Learning Journey!'
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
                                <div className="relative my-6 sm:my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-600/50" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-slate-800/50 text-slate-400">OR CONTINUE WITH</span>
                                    </div>
                                </div>

                                {/* Social Signup Buttons */}
                                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                    {/* Google */}
                                    <motion.button
                                        type="button"
                                        className="flex items-center justify-center p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-300 group relative overflow-hidden"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        aria-label="Sign up with Google"
                                    >
                                        <FcGoogle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                    </motion.button>

                                    {/* Facebook */}
                                    <motion.button
                                        type="button"
                                        className="flex items-center justify-center p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-300 group relative overflow-hidden"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        aria-label="Sign up with Facebook"
                                    >
                                        <FaFacebook className="w-5 h-5 text-blue-500 transition-transform duration-300 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                    </motion.button>

                                    {/* X (Twitter) */}
                                    <motion.button
                                        type="button"
                                        className="flex items-center justify-center p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-300 group relative overflow-hidden"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        aria-label="Sign up with X"
                                    >
                                        <FaTwitter className="w-5 h-5 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                    </motion.button>
                                </div>
                            </motion.form>

                            {/* Login Link */}
                            <motion.div
                                className="mt-6 sm:mt-8 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            >
                                <div className="text-sm text-slate-500">
                                    Already have an account?{' '}
                                    <Link
                                        to="/login"
                                        className="text-secondary-green hover:text-secondary-green/80 transition-colors duration-200 font-medium"
                                    >
                                        Sign In
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

export default SignUpPage;
