import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
import { useAIChat } from '../context/AIChatContext';
import { useGamification } from '../context/GamificationContext';
import {
    FiArrowLeft,
    FiPlay,
    FiCheckCircle,
    FiTarget,
    FiStar,
    FiClock,
    FiBookOpen,
    FiAward,
    FiBookmark,
    FiShare2,
    FiDownload,
    FiHeart,
    FiChevronRight,
    FiChevronLeft,
    FiPlayCircle,
    FiFileText,
    FiVideo,
    FiUsers,
    FiTrendingUp,
    FiCpu,
    FiEdit3,
    FiMessageSquare,
    FiX
} from 'react-icons/fi';
import MiniGame from '../components/MiniGames';
import { getApiUrl } from '../api/client';
import { skillsData } from '../data/skillDetails';

const SkillDetailPage: React.FC = () => {
    const { skillId } = useParams<{ skillId: string }>();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [gameScores, setGameScores] = useState<{ [key: number]: { score: number, time: number } }>({});
    const [showSteps, setShowSteps] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);

    const {
        isSkillCompleted,
        isSkillBookmarked,
        bookmarkSkill,
        unbookmarkSkill,
        completeSkill,
        getSkillProgress,
        addActivity
    } = useUserData();

    const { toggleChat, generateQuiz, summarizeLesson } = useAIChat();
    const { addPoints } = useGamification();
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [aiQuiz, setAiQuiz] = useState<any[] | null>(null);
    const [aiQuizIndex, setAiQuizIndex] = useState(0);
    const [aiQuizScore, setAiQuizScore] = useState(0);
    const [aiQuizAnswered, setAiQuizAnswered] = useState(false);
    const [aiQuizCompleted, setAiQuizCompleted] = useState(false);
    const [aiLoading, setAiLoading] = useState<'summary' | 'quiz' | null>(null);
    const [skillFromApi, setSkillFromApi] = useState<any>(null);
    const [relatedSkills, setRelatedSkills] = useState<any[]>([]);
    const [relatedLoading, setRelatedLoading] = useState(false);

    // Fetch related skills when skill changes
    useEffect(() => {
        if (!skillId) return;
        setRelatedSkills([]);
        setRelatedLoading(true);
        const fetchRelated = async () => {
            try {
                const res = await fetch(`${getApiUrl()}/api/v1/skills/related/${skillId}`);
                const data = await res.json();
                if (data.success) setRelatedSkills(data.data || []);
            } catch {} finally {
                setRelatedLoading(false);
            }
        };
        fetchRelated();
    }, [skillId]);

    // Fetch skill from backend API
    useEffect(() => {
        if (!skillId) return;
        const fetchSkill = async () => {
            try {
                const token = localStorage.getItem('afterbell_token');
                const headers: HeadersInit = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;
                const res = await fetch(`${getApiUrl()}/api/v1/skills/${skillId}`, { headers });
                const data = await res.json();
                if (data.success) setSkillFromApi(data.data);
            } catch (err) {
                console.warn('Failed to fetch skill from API, using fallback data');
            }
        };
        fetchSkill();
    }, [skillId]);

    // Merge API skill data with fallback
    const skill = useMemo(() => {
        if (skillFromApi) {
            const hardcoded = skillsData.find(s => s.id === parseInt(skillId || '0'));
            const apiSteps = (skillFromApi.steps || []).map((step: any, i: number) => ({
                ...step,
                id: step.id || i + 1,
                completed: false,
            }));
            return {
                ...skillFromApi,
                id: skillFromApi._id,
                duration: `${skillFromApi.durationMinutes} min`,
                difficulty: skillFromApi.difficulty.charAt(0).toUpperCase() + skillFromApi.difficulty.slice(1),
                completed: hardcoded?.completed || false,
                bookmarked: hardcoded?.bookmarked || false,
                steps: apiSteps,
                lessons: apiSteps.length || skillFromApi.lessons || 0,
                icon: hardcoded?.icon || 'FiBookOpen',
                videoUrl: skillFromApi.videoUrl || '',
                content: skillFromApi.content || '',
                rating: skillFromApi.rating || 4.5,
                certificate: skillFromApi.certificate || false,
            };
        }
        return skillsData.find(s => s.id === parseInt(skillId || '0'));
    }, [skillFromApi, skillId]);

    // Load existing progress when skill changes
    useEffect(() => {
        if (skillId) {
            const progress = getSkillProgress(skillId);
            setCompletedSteps(Array.from({ length: progress.completed }, (_, i) => i));
        }
    }, [skillId, getSkillProgress]);

    // Ensure page starts at the top when component mounts or skillId changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [skillId]);

    // Track time spent on skill
    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000); // Update every second

        return () => {
            clearInterval(interval);
            // Save time spent when leaving the page
            const totalTime = Math.floor((Date.now() - startTime) / 1000);
            if (totalTime > 0 && skillId) {
                // You could save this to localStorage or send to backend
                localStorage.setItem(`time_${skillId}`, totalTime.toString());
            }
        };
    }, [skillId]);

    // Also scroll to top when switching between overview and steps
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [showSteps]);

    // Calculate progress
    const progressPercentage = skill ? (completedSteps.length / skill.steps.length) * 100 : 0;

    if (!skill) {
        return (
            <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Skill Not Found</h1>
                    <button
                        onClick={() => navigate('/skills')}
                        className="bg-secondary-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-500 transition-colors duration-300"
                    >
                        Back to Skills
                    </button>
                </div>
            </div>
        );
    }

    const handleComplete = () => {
        if (!skillId || !skill) return;

        const totalSteps = skill.steps.length;
        const allStepsCompleted = completedSteps.length === totalSteps;

        if (allStepsCompleted && aiQuizCompleted) {
            completeSkill(skillId, completedSteps, timeSpent, undefined, skill.title);
            addActivity('Completed', skill.title, skillId);
            addPoints(50, 'Skill completed', 'complete_skill');
        }
    };

    const handleBookmark = () => {
        if (!skillId) return;

        if (isSkillBookmarked(skillId)) {
            unbookmarkSkill(skillId);
        } else {
            bookmarkSkill(skillId);
        }
    };

    const handleStepComplete = (stepId: number) => {
        if (completedSteps.includes(stepId)) {
            setCompletedSteps(prev => prev.filter(id => id !== stepId));
        } else {
            setCompletedSteps(prev => [...prev, stepId]);
        }
    };

    const nextStep = () => {
        if (skill && currentStep < skill.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleGameComplete = (score: number, time: number) => {
        setGameScores(prev => ({
            ...prev,
            [currentStep]: { score, time }
        }));
        handleStepComplete(skill?.steps[currentStep]?.id || 0);
        if (skill && currentStep < skill.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
        addPoints(15, 'Game played', 'play_game');
        if (score > 50) addPoints(25, 'Game won', 'win_game');
    };

    const handleGameSkip = () => {
        handleStepComplete(skill?.steps[currentStep]?.id || 0);
        if (skill && currentStep < skill.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleAskAI = () => {
        if (skill) {
            toggleChat();
        }
    };

    const handleSummarize = async () => {
        if (!skill) return;
        setAiLoading('summary');
        try {
            const summary = await summarizeLesson(skill.title, skill.description);
            setAiSummary(summary);
        } finally {
            setAiLoading(null);
        }
    };

    const handleStartQuiz = async () => {
        if (!skill) return;
        setAiLoading('quiz');
        try {
            const details = skill.steps
                .filter((s: any) => s.type === 'video')
                .map((s: any) => `- ${s.title}: ${s.description || ''}`)
                .join('\n');
            const questions = await generateQuiz(skill.title, 10, details);
            setAiQuiz(questions);
            setAiQuizIndex(0);
            setAiQuizScore(0);
            setAiQuizAnswered(false);
            setAiQuizCompleted(false);
        } finally {
            setAiLoading(null);
        }
    };

    const handleQuizAnswer = (selected: string) => {
        if (!aiQuiz || aiQuizAnswered) return;
        const correct = aiQuiz[aiQuizIndex].correctAnswer;
        if (selected === correct) {
            setAiQuizScore(prev => prev + 1);
        }
        setAiQuizAnswered(true);
    };

    const nextQuizQuestion = () => {
        if (!aiQuiz) return;
        if (aiQuizIndex < aiQuiz.length - 1) {
            setAiQuizIndex(prev => prev + 1);
            setAiQuizAnswered(false);
        } else {
            setAiQuizCompleted(true);
            setAiQuiz(null);
        }
    };

    const getGameType = (): 'budget' | 'speaking' | 'cooking' | 'photography' | 'safety' | 'writing' | 'time' | 'coding' => {
        if (!skill) return 'budget';
        switch (skill.category) {
            case 'finance': return 'budget';
            case 'communication': return 'speaking';
            case 'cooking': return 'cooking';
            case 'art': return 'photography';
            case 'digital': return 'coding';
            default: return 'budget';
        }
    };

    return (
        <div className="min-h-screen bg-[#0D1117] relative overflow-hidden">
            {/* Video Background */}
            <video
                autoPlay loop muted playsInline
                className="fixed inset-0 w-full h-full object-cover opacity-20 z-0"
            >
                <source src="/Afterbell-bg.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Background overlay */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 z-0" />

            {/* Main Content */}
            <div className="relative z-10 pt-20">
                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <motion.button
                        onClick={() => navigate('/skills')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-300 mb-8"
                        whileHover={{ x: -4 }}
                    >
                        <FiArrowLeft className="w-5 h-5" />
                        <span>Back to Skills</span>
                    </motion.button>

                    {/* Skill Header */}
                    <motion.div
                        className="bg-slate-800/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-700/50 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Side - Progress & Info */}
                            <div className="lg:w-1/3">
                                <div className="mb-6">
                                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">{skill.title}</h1>
                                    <div className="flex items-center gap-4 text-slate-400 mb-4">
                                        <span className="flex items-center gap-1">
                                            <FiClock className="w-4 h-4" />
                                            {skill.duration}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                            {skill.rating}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FiBookOpen className="w-4 h-4" />
                                            {skill.lessons} lessons
                                        </span>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed mb-6">{skill.description}</p>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-300">Course Progress</span>
                                        <span className="text-sm text-slate-400">{Math.round(progressPercentage)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <motion.div
                                            className="bg-gradient-to-r from-secondary-green to-emerald-500 h-2 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercentage}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {completedSteps.length} of {skill.steps.length} steps completed
                                    </p>
                                </div>

                                {/* Game Scores */}
                                {Object.keys(gameScores).length > 0 && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiAward className="w-4 h-4 text-yellow-400" />
                                            <span className="text-sm font-semibold text-white">Game Scores</span>
                                        </div>
                                        <div className="space-y-1">
                                            {Object.entries(gameScores).map(([stepIndex, score]) => (
                                                <div key={stepIndex} className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-300">Game {parseInt(stepIndex) + 1}</span>
                                                    <span className="text-yellow-400 font-semibold">{score.score} points</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-4">
                                    {!showSteps ? (
                                        <motion.button
                                            onClick={() => setShowSteps(true)}
                                            className="w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-secondary-green to-emerald-500 text-white hover:shadow-lg hover:shadow-secondary-green/30"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiPlay className="w-5 h-5" />
                                            Start Learning
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            onClick={handleComplete}
                                            disabled={!aiQuizCompleted}
                                            className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${
                                                isSkillCompleted(skillId || '')
                                                ? 'bg-secondary-green/20 text-secondary-green border-2 border-secondary-green/30'
                                                : !aiQuizCompleted
                                                    ? 'bg-slate-700/50 text-slate-400 border border-slate-600/50 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-secondary-green to-emerald-500 text-white hover:shadow-lg hover:shadow-secondary-green/30'
                                            }`}
                                            whileHover={aiQuizCompleted && !isSkillCompleted(skillId || '') ? { scale: 1.02 } : {}}
                                            whileTap={aiQuizCompleted && !isSkillCompleted(skillId || '') ? { scale: 0.98 } : {}}
                                        >
                                            {isSkillCompleted(skillId || '') ? (
                                                <>
                                                    <FiCheckCircle className="w-5 h-5" />
                                                    Completed
                                                </>
                                            ) : !aiQuizCompleted ? (
                                                <>
                                                    <FiEdit3 className="w-5 h-5" />
                                                    Pass Quiz to Complete
                                                </>
                                            ) : (
                                                <>
                                                    <FiTarget className="w-5 h-5" />
                                                    Mark as Completed
                                                </>
                                            )}
                                        </motion.button>
                                    )}

                                    {/* AI Study Buddy Buttons */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <motion.button
                                            onClick={handleAskAI}
                                            className="py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiMessageSquare className="w-4 h-4" />
                                            Ask AI
                                        </motion.button>
                                        <motion.button
                                            onClick={handleSummarize}
                                            disabled={aiLoading === 'summary'}
                                            className="py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 disabled:opacity-50"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiFileText className="w-4 h-4" />
                                            {aiLoading === 'summary' ? '...' : 'Summarize'}
                                        </motion.button>
                                        <motion.button
                                            onClick={handleStartQuiz}
                                            disabled={aiLoading === 'quiz'}
                                            className="py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 disabled:opacity-50"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiEdit3 className="w-4 h-4" />
                                            {aiLoading === 'quiz' ? '...' : 'Quiz'}
                                        </motion.button>
                                    </div>

                                    <div className="flex gap-3">
                                        <motion.button
                                            onClick={handleBookmark}
                                            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isSkillBookmarked(skillId || '')
                                                ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiBookmark className={`w-4 h-4 ${isSkillBookmarked(skillId || '') ? 'fill-current' : ''}`} />
                                            {isSkillBookmarked(skillId || '') ? 'Bookmarked' : 'Bookmark'}
                                        </motion.button>

                                        <motion.button
                                            onClick={() => {
                                                if (navigator.share) {
                                                    navigator.share({
                                                        title: skill?.title || 'Skill',
                                                        text: `Check out this skill: ${skill?.title}`,
                                                        url: window.location.href
                                                    });
                                                } else {
                                                    navigator.clipboard.writeText(window.location.href);
                                                }
                                                if (skillId) {
                                                    addActivity('Shared', skill?.title || 'Skill', skillId);
                                                }
                                            }}
                                            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiShare2 className="w-4 h-4" />
                                            Share
                                        </motion.button>
                                    </div>

                                    {/* AI Summary Modal */}
                                    <AnimatePresence>
                                        {aiSummary && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 bg-slate-700/30 border border-blue-500/30 rounded-xl mt-2">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                                                            <FiCpu className="w-4 h-4" /> AI Summary
                                                        </h4>
                                                        <button onClick={() => setAiSummary(null)} className="text-slate-400 hover:text-white">
                                                            <FiX className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="text-sm text-slate-200 prose prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-emerald-300">
                                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiSummary}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* AI Quiz Modal */}
                                    <AnimatePresence>
                                        {aiQuiz && aiQuiz[aiQuizIndex] && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                                            >
                                                <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-white font-semibold flex items-center gap-2">
                                                            <FiEdit3 className="text-amber-400" /> AI Quiz
                                                        </h3>
                                                        <button onClick={() => setAiQuiz(null)} className="text-slate-400 hover:text-white">
                                                            <FiX className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <div className="mb-2 flex justify-between text-xs text-slate-400">
                                                        <span>Question {aiQuizIndex + 1} of {aiQuiz.length}</span>
                                                        <span>Score: {aiQuizScore}/{aiQuizAnswered ? aiQuizIndex + 1 : aiQuizIndex}</span>
                                                    </div>
                                                    <p className="text-white font-medium mb-4">{aiQuiz[aiQuizIndex].question}</p>
                                                    <div className="space-y-2">
                                                        {aiQuiz[aiQuizIndex].options.map((opt: string, i: number) => {
                                                            const isCorrect = opt === aiQuiz[aiQuizIndex].correctAnswer;
                                                            const isSelected = aiQuizAnswered;
                                                            return (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => handleQuizAnswer(opt)}
                                                                    disabled={aiQuizAnswered}
                                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                                                                        isSelected
                                                                            ? isCorrect
                                                                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                                                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                                            : 'bg-slate-700/50 text-slate-200 hover:bg-slate-600/50 border border-slate-600/50'
                                                                    }`}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {aiQuizAnswered && (
                                                        <motion.button
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            onClick={nextQuizQuestion}
                                                            className="mt-4 w-full py-3 rounded-xl bg-secondary-green text-white font-semibold hover:bg-emerald-500 transition-colors"
                                                        >
                                                            {aiQuizIndex < aiQuiz.length - 1 ? 'Next Question' : 'See Results'}
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Certificate Badge */}
                                {skill.certificate && (
                                    <div className="mt-6 p-4 bg-gradient-to-r from-secondary-green/10 to-emerald-500/10 border border-secondary-green/30 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FiAward className="w-6 h-6 text-secondary-green" />
                                                <div>
                                                    <h4 className="font-semibold text-white">Certificate Available</h4>
                                                    <p className="text-sm text-slate-400">
                                                        {isSkillCompleted(skillId || '')
                                                            ? 'Congratulations! You can download your certificate.'
                                                            : 'Complete all steps to earn your certificate'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            {isSkillCompleted(skillId || '') && (
                                                <motion.button
                                                    onClick={() => {
                                                        // Generate and download certificate
                                                        const certificateData = {
                                                            skillName: skill?.title,
                                                            completedDate: new Date().toLocaleDateString(),
                                                            userName: 'Student', // You could get this from user context
                                                            certificateId: `CERT-${skillId}-${Date.now()}`
                                                        };

                                                        // Create a simple certificate as text file
                                                        const certificateText = `
AFTERBELL LEARNING PLATFORM
CERTIFICATE OF COMPLETION

This certifies that
${certificateData.userName}
has successfully completed the course
"${certificateData.skillName}"

Completed on: ${certificateData.completedDate}
Certificate ID: ${certificateData.certificateId}

Congratulations on your achievement!

AfterBell Learning Platform
                                                        `;

                                                        const blob = new Blob([certificateText], { type: 'text/plain' });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `${skill?.title}-Certificate.txt`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        document.body.removeChild(a);
                                                        URL.revokeObjectURL(url);
                                                    }}
                                                    className="px-4 py-2 bg-secondary-green text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <FiDownload className="w-4 h-4" />
                                                    Download
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Side - Content */}
                            <div className="lg:w-2/3">
                                {!showSteps ? (
                                    /* Overview Content */
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/50"
                                    >
                                        <h2 className="text-2xl font-bold text-white mb-4">What You'll Learn</h2>
                                        <div className="space-y-4 mb-6">
                                            {skill.steps.map((step, index) => (
                                                <div key={step.id} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-secondary-green/20 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-semibold text-secondary-green">{index + 1}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                                                        <p className="text-sm text-slate-400 mb-2">{step.description}</p>
                                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <FiClock className="w-3 h-3" />
                                                                {step.duration}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                {step.type === 'video' ? (
                                                                    <FiVideo className="w-3 h-3" />
                                                                ) : step.type === 'game' ? (
                                                                    <FiTarget className="w-3 h-3" />
                                                                ) : (
                                                                    <FiFileText className="w-3 h-3" />
                                                                )}
                                                                {step.type === 'video' ? 'Video' : step.type === 'game' ? 'Game' : 'Exercise'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
                                            <h3 className="font-semibold text-white mb-2">Ready to Start?</h3>
                                            <p className="text-sm text-slate-300">Click "Start Learning" to begin your journey with interactive lessons and games!</p>
                                        </div>
                                    </motion.div>
                                ) : skill && skill.steps && skill.steps[currentStep] ? (
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/50"
                                    >
                                        {/* Step Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h2 className="text-2xl font-bold text-white mb-2">
                                                    Step {currentStep + 1}: {skill.steps[currentStep].title}
                                                </h2>
                                                <p className="text-slate-300 mb-2">{skill.steps[currentStep].description}</p>
                                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <FiClock className="w-4 h-4" />
                                                        {skill.steps[currentStep].duration}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        {skill.steps[currentStep].type === 'video' ? (
                                                            <FiVideo className="w-4 h-4" />
                                                        ) : (
                                                            <FiFileText className="w-4 h-4" />
                                                        )}
                                                        {skill.steps[currentStep].type === 'video' ? 'Video Lesson' : 'Interactive Exercise'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleStepComplete(skill.steps[currentStep].id)}
                                                className={`p-3 rounded-xl transition-all duration-300 ${completedSteps.includes(skill.steps[currentStep].id)
                                                    ? 'bg-secondary-green/20 text-secondary-green border-2 border-secondary-green/30'
                                                    : 'bg-slate-600/50 text-slate-300 hover:bg-slate-500/50 border-2 border-slate-500/50'
                                                    }`}
                                            >
                                                <FiCheckCircle className="w-6 h-6" />
                                            </button>
                                        </div>

                                        {/* Step Content */}
                                        <div className="mb-6">
                                            {skill.steps[currentStep].type === 'video' ? (
                                                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg">
                                                    <iframe
                                                        src={skill.steps[currentStep].content}
                                                        title={skill.steps[currentStep].title}
                                                        className="w-full h-full"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            ) : skill.steps[currentStep].type === 'game' ? (
                                                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/30">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <FiTarget className="w-6 h-6 text-secondary-green" />
                                                        <h3 className="text-lg font-semibold text-white">Interactive Game</h3>
                                                    </div>
                                                    <p className="text-slate-300 leading-relaxed mb-4">{skill.steps[currentStep].content}</p>
                                                    <MiniGame
                                                        gameType={(skill.steps[currentStep].gameType as any) || 'budget'}
                                                        onComplete={handleGameComplete}
                                                        onSkip={handleGameSkip}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/30">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <FiPlayCircle className="w-6 h-6 text-secondary-green" />
                                                        <h3 className="text-lg font-semibold text-white">Interactive Exercise</h3>
                                                    </div>
                                                    <p className="text-slate-300 leading-relaxed">{skill.steps[currentStep].content}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Resources */}
                                        {skill.steps[currentStep].resources && (
                                            <div className="mb-6">
                                                <h4 className="text-lg font-semibold text-white mb-3">Resources & Materials</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {skill.steps[currentStep].resources.map((resource, index) => (
                                                        <div key={index} className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                                                            <FiDownload className="w-4 h-4 text-secondary-green" />
                                                            <span className="text-sm text-slate-300">{resource}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Navigation */}
                                        <div className="flex items-center justify-between">
                                            <motion.button
                                                onClick={currentStep === 0 ? () => setShowSteps(false) : prevStep}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <FiChevronLeft className="w-4 h-4" />
                                                {currentStep === 0 ? 'Back to Overview' : 'Previous'}
                                            </motion.button>

                                            <div className="flex items-center gap-2">
                                                {skill.steps.map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${index === currentStep
                                                            ? 'bg-secondary-green'
                                                            : completedSteps.includes(skill.steps[index].id)
                                                                ? 'bg-secondary-green/50'
                                                                : 'bg-slate-600'
                                                            }`}
                                                        onClick={() => setCurrentStep(index)}
                                                    />
                                                ))}
                                            </div>

                                            <motion.button
                                                onClick={nextStep}
                                                disabled={currentStep === skill.steps.length - 1}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${currentStep === skill.steps.length - 1
                                                    ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-secondary-green to-emerald-500 text-white hover:shadow-lg hover:shadow-secondary-green/30'
                                                    }`}
                                                whileHover={currentStep < skill.steps.length - 1 ? { scale: 1.02 } : {}}
                                                whileTap={currentStep < skill.steps.length - 1 ? { scale: 0.98 } : {}}
                                            >
                                                Next
                                                <FiChevronRight className="w-4 h-4" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/50 text-center"
                                    >
                                        <h2 className="text-2xl font-bold text-white mb-4">Skill Not Found</h2>
                                        <p className="text-slate-400 mb-6">The skill you're looking for doesn't exist or has been removed.</p>
                                        <motion.button
                                            onClick={() => navigate('/skills')}
                                            className="px-6 py-3 bg-secondary-green text-white rounded-lg hover:bg-emerald-600 transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Back to Skills
                                        </motion.button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Steps Overview */}
                    {skill && skill.steps && (
                        <motion.div
                            className="bg-slate-800/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-700/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Course Steps</h2>
                            <div className="space-y-4">
                                {skill.steps.map((step, index) => (
                                    <motion.div
                                        key={step.id}
                                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${index === currentStep
                                            ? 'bg-secondary-green/10 border-secondary-green/30'
                                            : completedSteps.includes(step.id)
                                                ? 'bg-slate-700/30 border-slate-600/50'
                                                : 'bg-slate-700/20 border-slate-600/30 hover:bg-slate-700/30'
                                            }`}
                                        onClick={() => setCurrentStep(index)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completedSteps.includes(step.id)
                                                    ? 'bg-secondary-green text-white'
                                                    : index === currentStep
                                                        ? 'bg-secondary-green/20 text-secondary-green border-2 border-secondary-green/30'
                                                        : 'bg-slate-600 text-slate-300'
                                                    }`}>
                                                    {completedSteps.includes(step.id) ? (
                                                        <FiCheckCircle className="w-4 h-4" />
                                                    ) : (
                                                        <span className="text-sm font-bold">{index + 1}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">{step.title}</h3>
                                                    <p className="text-sm text-slate-400">{step.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-slate-400">{step.duration}</span>
                                                {step.type === 'video' ? (
                                                    <FiVideo className="w-4 h-4 text-slate-400" />
                                                ) : step.type === 'game' ? (
                                                    <FiTarget className="w-4 h-4 text-slate-400" />
                                                ) : (
                                                    <FiFileText className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {/* Related Skills */}
                    {relatedSkills.length > 0 && (
                        <motion.div
                            className="bg-slate-800/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-700/50 mt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Related Skills</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {relatedSkills.map((rs: any) => (
                                    <motion.button
                                        key={rs._id}
                                        onClick={() => navigate(`/skills/${rs._id}`)}
                                        className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50 text-left hover:bg-slate-700/50 hover:border-secondary-green/30 transition-all duration-300"
                                        whileHover={{ y: -3 }}
                                    >
                                        <h3 className="font-semibold text-white mb-1 truncate">{rs.title}</h3>
                                        <p className="text-slate-400 text-xs line-clamp-2 mb-3">{rs.description}</p>
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            <span>{rs.difficulty}</span>
                                            <span>·</span>
                                            <span>{rs.durationMinutes} min</span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1">
                                                <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                                                {rs.rating}
                                            </span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default SkillDetailPage;