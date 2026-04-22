import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiZap, FiCheckSquare, FiLoader, FiMail, FiSend, FiUser, FiMessageSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import HowItWorks from '../components/HowItWorks';
import { useToast } from '../context/ToastContext';

const HomePage: React.FC = () => {
    const { showToast } = useToast();
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isContactSubmitting, setIsContactSubmitting] = useState(false);

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsletterEmail.trim()) return;

        setIsNewsletterSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Save to localStorage
            const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
            subscribers.push({
                email: newsletterEmail,
                subscribedAt: new Date().toISOString()
            });
            localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));

            showToast('success', 'Successfully subscribed to newsletter!');
            setNewsletterEmail('');
        } catch (error) {
            showToast('error', 'Failed to subscribe. Please try again.');
        } finally {
            setIsNewsletterSubmitting(false);
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
            showToast('error', 'Please fill in all fields');
            return;
        }

        setIsContactSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Save to localStorage
            const contacts = JSON.parse(localStorage.getItem('contact_messages') || '[]');
            contacts.push({
                ...contactForm,
                submittedAt: new Date().toISOString(),
                id: Date.now().toString()
            });
            localStorage.setItem('contact_messages', JSON.stringify(contacts));

            showToast('success', 'Message sent successfully! We\'ll get back to you soon.');
            setContactForm({ name: '', email: '', message: '' });
        } catch (error) {
            showToast('error', 'Failed to send message. Please try again.');
        } finally {
            setIsContactSubmitting(false);
        }
    };

    return (
        <div className="relative">
            {/* Fixed Video Background - Optimized */}
            <div className="fixed inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover gpu-accelerated"
                    aria-hidden="true"
                    preload="metadata"
                    style={{
                        willChange: 'auto',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden'
                    }}
                >
                    <source src="/Afterbell-bg.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                {/* Dark overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 gpu-accelerated"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Hero Section */}
                <HeroSection />

                {/* How It Works Section */}
                <HowItWorks />

                {/* Features Section */}
                <FeaturesSection />

                {/* CTA Section */}
                <CTASection
                    newsletterEmail={newsletterEmail}
                    setNewsletterEmail={setNewsletterEmail}
                    handleNewsletterSubmit={handleNewsletterSubmit}
                    isNewsletterSubmitting={isNewsletterSubmitting}
                />
            </div>

            {/* Footer */}
            <div className="relative z-20">
                <Footer
                    contactForm={contactForm}
                    setContactForm={setContactForm}
                    handleContactSubmit={handleContactSubmit}
                    isContactSubmitting={isContactSubmitting}
                />
            </div>
        </div>
    );
};

// Hero Section with Video Background
const HeroSection: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleGetStarted = () => {
        setIsLoading(true);
        // Simulate navigation delay
        setTimeout(() => {
            setIsLoading(false);
            navigate('/skills');
        }, 1500);
    };
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900/40 backdrop-blur-sm">
            {/* Content */}
            <motion.div
                className="relative z-10 text-center px-6 max-w-6xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1
                    className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-secondary-green via-blue-400 to-purple-500 drop-shadow-2xl leading-tight"
                    variants={itemVariants}
                >
                    Prepare for Real Life!
                </motion.h1>

                <motion.h2
                    className="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-medium text-slate-300 mb-8 drop-shadow-lg max-w-5xl mx-auto leading-relaxed tracking-wide"
                    variants={itemVariants}
                >
                    Master essential life skills, build mental resilience, and navigate teenage challenges with confidence. From managing anxiety to handling heartbreak - we've got you covered!
                </motion.h2>

                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center"
                >
                    <motion.button
                        className={`relative overflow-hidden text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-secondary-green/50 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg ${isLoading
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-secondary-green to-emerald-500 text-white hover:shadow-2xl hover:shadow-secondary-green/30 hover:-translate-y-1'
                            }`}
                        whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
                        whileTap={!isLoading ? { scale: 0.98 } : {}}
                        onClick={handleGetStarted}
                        disabled={isLoading}
                    >
                        <span className="relative z-10">
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <FiLoader className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                    <span>Preparing Your Learning Journey...</span>
                                </div>
                            ) : (
                                'Start Learning Life Skills!'
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

                    <motion.button
                        className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-slate-700/50 backdrop-blur-lg border border-slate-600 text-white hover:bg-slate-600/50 hover:border-slate-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-secondary-green/50 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:-translate-y-1"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Watch How It Works!
                    </motion.button>
                </motion.div>
            </motion.div>
        </section>
    );
};

// Features Section
const FeaturesSection: React.FC = () => {
    const features = [
        {
            title: "Mental Health & Wellness",
            description: "Learn to manage anxiety, build confidence, and develop emotional resilience. Interactive exercises and real-life scenarios help you navigate mental health challenges.",
            icon: <FiPlay className="w-8 h-8" />,
            color: "from-purple-500 to-pink-500",
        },
        {
            title: "Life Skills & Relationships",
            description: "Master essential life skills from budgeting to decision-making. Learn to handle heartbreak, build healthy relationships, and navigate teenage challenges.",
            icon: <FiZap className="w-8 h-8" />,
            color: "from-blue-500 to-cyan-500",
        },
        {
            title: "Peer Support & Real Stories",
            description: "Connect with others who've been through similar experiences. Read real stories, share your own, and find support from a community that understands.",
            icon: <FiCheckSquare className="w-8 h-8" />,
            color: "from-green-500 to-emerald-500",
        }
    ];

    return (
        <section id="features" className="relative py-32 bg-slate-900/40 backdrop-blur-sm overflow-hidden">


            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    className="text-center mb-16 md:mb-20"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-display mb-4 md:mb-6 bg-gradient-to-r from-secondary-green to-blue-400 bg-clip-text text-transparent leading-tight">
                        Your Life Preparation Hub
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed tracking-wide">
                        More than just academic learning - we prepare you for real life challenges. Build mental resilience, master life skills, and connect with a supportive community of peers who understand what you're going through.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="relative group"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                        >
                            {/* Card */}
                            <div className="relative bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 md:p-8 shadow-2xl h-full transition-all duration-500 group-hover:border-secondary-green/50 group-hover:shadow-secondary-green/20 overflow-hidden">
                                {/* Floating Elements */}
                                <motion.div
                                    className="absolute -top-2 -right-2 w-4 h-4 md:w-6 md:h-6 bg-secondary-green/20 rounded-full blur-sm"
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                                <motion.div
                                    className="absolute -bottom-2 -left-2 w-3 h-3 md:w-4 md:h-4 bg-blue-400/20 rounded-full blur-sm"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                                />



                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Icon */}
                                    <motion.div
                                        className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${feature.color} mb-4 md:mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-300`}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="text-white">
                                            {feature.icon}
                                        </div>
                                    </motion.div>

                                    {/* Title */}
                                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold font-display mb-3 md:mb-4 text-white group-hover:text-secondary-green transition-colors duration-300 leading-tight">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm md:text-base text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300 tracking-wide">
                                        {feature.description}
                                    </p>
                                </div>


                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// CTA Section
interface CTASectionProps {
    newsletterEmail: string;
    setNewsletterEmail: (email: string) => void;
    handleNewsletterSubmit: (e: React.FormEvent) => void;
    isNewsletterSubmitting: boolean;
}

const CTASection: React.FC<CTASectionProps> = ({
    newsletterEmail,
    setNewsletterEmail,
    handleNewsletterSubmit,
    isNewsletterSubmitting
}) => {
    const [isSignUpLoading, setIsSignUpLoading] = useState(false);
    const [isLearnMoreLoading, setIsLearnMoreLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = () => {
        setIsSignUpLoading(true);
        setTimeout(() => {
            setIsSignUpLoading(false);
            navigate('/signup');
        }, 1500);
    };

    const handleLearnMore = () => {
        setIsLearnMoreLoading(true);
        setTimeout(() => {
            setIsLearnMoreLoading(false);
            // Scroll to features section
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    };

    return (
        <section className="relative py-32 bg-slate-900/40 backdrop-blur-sm overflow-hidden">


            <div className="container mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h2
                        className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-display mb-6 md:mb-8 text-white leading-tight"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Your Future Starts Now
                    </motion.h2>

                    <motion.p
                        className="text-xl text-slate-300 max-w-2xl mx-auto mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Join thousands of learners who are already transforming their skills and careers with AfterBell
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <motion.button
                            className={`text-xl px-12 py-6 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-secondary-green focus:ring-offset-2 focus:ring-offset-slate-900 ${isSignUpLoading
                                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                : 'btn-primary animate-pulse-slow shadow-2xl shadow-secondary-green/25'
                                }`}
                            whileHover={!isSignUpLoading ? {
                                scale: 1.05,
                                y: -3,
                                boxShadow: "0 20px 40px rgba(80, 200, 120, 0.3)"
                            } : {}}
                            whileTap={!isSignUpLoading ? { scale: 0.95 } : {}}
                            onClick={handleSignUp}
                            disabled={isSignUpLoading}
                        >
                            {isSignUpLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <FiLoader className="w-5 h-5 animate-spin" />
                                    <span>Loading...</span>
                                </div>
                            ) : (
                                'Sign Up Now'
                            )}
                        </motion.button>

                        <motion.button
                            onClick={() => navigate('/skills')}
                            className="text-xl px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 hover:shadow-2xl hover:shadow-blue-500/25"
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Explore Skills Hub
                        </motion.button>

                        <motion.button
                            className={`text-xl px-12 py-6 border-2 border-white/30 text-white rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900 ${isLearnMoreLoading
                                ? 'bg-slate-600 border-slate-600 cursor-not-allowed'
                                : 'hover:bg-white/10'
                                }`}
                            whileHover={!isLearnMoreLoading ? { scale: 1.05, y: -3 } : {}}
                            whileTap={!isLearnMoreLoading ? { scale: 0.95 } : {}}
                            onClick={handleLearnMore}
                            disabled={isLearnMoreLoading}
                        >
                            {isLearnMoreLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <FiLoader className="w-5 h-5 animate-spin" />
                                    <span>Loading...</span>
                                </div>
                            ) : (
                                'Learn More'
                            )}
                        </motion.button>
                    </motion.div>

                    <motion.div
                        className="mt-12 text-slate-400 text-sm"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        Free to start • No credit card required • Cancel anytime
                    </motion.div>

                    {/* Newsletter Signup */}
                    <motion.div
                        className="mt-16 max-w-md mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.0 }}
                    >
                        <h3 className="text-xl font-semibold text-white mb-4">Stay Updated</h3>
                        <p className="text-slate-400 mb-6">Get the latest learning tips and updates delivered to your inbox</p>
                        <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-secondary-green focus:border-transparent outline-none transition-all duration-300"
                                    required
                                />
                            </div>
                            <motion.button
                                type="submit"
                                disabled={isNewsletterSubmitting}
                                className={`px-6 py-3 bg-secondary-green text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${isNewsletterSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                                whileHover={!isNewsletterSubmitting ? { scale: 1.05 } : {}}
                                whileTap={!isNewsletterSubmitting ? { scale: 0.95 } : {}}
                            >
                                {isNewsletterSubmitting ? (
                                    <>
                                        <FiLoader className="w-4 h-4 animate-spin" />
                                        <span>Subscribing...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiSend className="w-4 h-4" />
                                        <span>Subscribe</span>
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

// Footer
interface FooterProps {
    contactForm: {
        name: string;
        email: string;
        message: string;
    };
    setContactForm: React.Dispatch<React.SetStateAction<{
        name: string;
        email: string;
        message: string;
    }>>;
    handleContactSubmit: (e: React.FormEvent) => void;
    isContactSubmitting: boolean;
}

const Footer: React.FC<FooterProps> = ({
    contactForm,
    setContactForm,
    handleContactSubmit,
    isContactSubmitting
}) => {
    return (
        <footer className="py-16 bg-slate-900 border-t border-slate-800">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div className="flex items-center space-x-3 mb-6 md:mb-0">
                        <motion.img
                            src="/Logo.png"
                            alt="AfterBell"
                            className="h-9 w-auto cursor-pointer transition-all duration-300 hover:drop-shadow-lg hover:drop-shadow-secondary-green/50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        />
                        <span className="text-2xl font-display font-bold text-white">
                        </span>
                    </div>

                    <div className="flex space-x-6">
                        <motion.a
                            href="#"
                            className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                        </motion.a>

                        <motion.a
                            href="#"
                            className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </motion.a>

                        <motion.a
                            href="#"
                            className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </motion.a>

                        <motion.a
                            href="#"
                            className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                            </svg>
                        </motion.a>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h4 className="text-white font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-slate-400">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-slate-400">
                            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-slate-400">
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-slate-400">
                            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                        </ul>
                    </div>
                </div>

                {/* Contact Form Section */}
                <div className="pt-8 border-t border-slate-800">
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-white text-center mb-6">Get in Touch</h3>
                        <p className="text-slate-400 text-center mb-8">Have questions or feedback? We'd love to hear from you!</p>
                        <form onSubmit={handleContactSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Your Name"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-secondary-green focus:border-transparent outline-none transition-all duration-300"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="Your Email"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-secondary-green focus:border-transparent outline-none transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <FiMessageSquare className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                <textarea
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                                    placeholder="Your Message"
                                    rows={4}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-secondary-green focus:border-transparent outline-none transition-all duration-300 resize-none"
                                    required
                                />
                            </div>
                            <motion.button
                                type="submit"
                                disabled={isContactSubmitting}
                                className={`w-full py-3 bg-secondary-green text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${isContactSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                                whileHover={!isContactSubmitting ? { scale: 1.02 } : {}}
                                whileTap={!isContactSubmitting ? { scale: 0.98 } : {}}
                            >
                                {isContactSubmitting ? (
                                    <>
                                        <FiLoader className="w-5 h-5 animate-spin" />
                                        <span>Sending Message...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiSend className="w-5 h-5" />
                                        <span>Send Message</span>
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 text-center">
                    <p className="text-slate-400">
                        © 2024 AfterBell. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default HomePage; 