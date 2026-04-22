import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiRotateCcw, FiHeart, FiWind, FiZap } from 'react-icons/fi';

interface BreathingExercise {
    id: string;
    name: string;
    description: string;
    pattern: {
        inhale: number;
        hold: number;
        exhale: number;
        pause: number;
    };
    color: string;
    icon: React.ReactNode;
    benefits: string[];
}

const BreathingExercises: React.FC = () => {
    const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
    const [timeLeft, setTimeLeft] = useState(0);
    const [cycle, setCycle] = useState(0);
    const [totalCycles, setTotalCycles] = useState(5);

    const exercises: BreathingExercise[] = [
        {
            id: 'box-breathing',
            name: 'Box Breathing',
            description: 'A simple 4-4-4-4 pattern that helps calm the nervous system and reduce stress.',
            pattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
            color: 'from-blue-500 to-cyan-500',
            icon: <FiWind className="w-8 h-8" />,
            benefits: ['Reduces stress', 'Improves focus', 'Calms anxiety', 'Better sleep']
        },
        {
            id: '478-breathing',
            name: '4-7-8 Breathing',
            description: 'The 4-7-8 technique is perfect for falling asleep and managing anxiety.',
            pattern: { inhale: 4, hold: 7, exhale: 8, pause: 0 },
            color: 'from-purple-500 to-pink-500',
            icon: <FiHeart className="w-8 h-8" />,
            benefits: ['Promotes sleep', 'Reduces anxiety', 'Calms racing thoughts', 'Relaxes body']
        },
        {
            id: 'triangle-breathing',
            name: 'Triangle Breathing',
            description: 'A gentle 4-4-4 pattern that\'s perfect for beginners and quick stress relief.',
            pattern: { inhale: 4, hold: 4, exhale: 4, pause: 0 },
            color: 'from-green-500 to-emerald-500',
            icon: <FiZap className="w-8 h-8" />,
            benefits: ['Quick stress relief', 'Easy to learn', 'Portable technique', 'Immediate calm']
        }
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && selectedExercise) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Move to next phase
                        switch (currentPhase) {
                            case 'inhale':
                                setCurrentPhase('hold');
                                return selectedExercise.pattern.hold;
                            case 'hold':
                                setCurrentPhase('exhale');
                                return selectedExercise.pattern.exhale;
                            case 'exhale':
                                if (selectedExercise.pattern.pause > 0) {
                                    setCurrentPhase('pause');
                                    return selectedExercise.pattern.pause;
                                } else {
                                    // Complete cycle
                                    setCycle(prev => {
                                        if (prev + 1 >= totalCycles) {
                                            setIsActive(false);
                                            setCurrentPhase('inhale');
                                            setCycle(0);
                                            return 0;
                                        }
                                        setCurrentPhase('inhale');
                                        return prev + 1;
                                    });
                                    return selectedExercise.pattern.inhale;
                                }
                            case 'pause':
                                setCycle(prev => {
                                    if (prev + 1 >= totalCycles) {
                                        setIsActive(false);
                                        setCurrentPhase('inhale');
                                        setCycle(0);
                                        return 0;
                                    }
                                    setCurrentPhase('inhale');
                                    return prev + 1;
                                });
                                return selectedExercise.pattern.inhale;
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, currentPhase, selectedExercise, totalCycles]);

    const startExercise = (exercise: BreathingExercise) => {
        setSelectedExercise(exercise);
        setCurrentPhase('inhale');
        setTimeLeft(exercise.pattern.inhale);
        setCycle(0);
        setIsActive(true);
    };

    const stopExercise = () => {
        setIsActive(false);
        setCurrentPhase('inhale');
        setTimeLeft(0);
        setCycle(0);
    };

    const resetExercise = () => {
        if (selectedExercise) {
            setCurrentPhase('inhale');
            setTimeLeft(selectedExercise.pattern.inhale);
            setCycle(0);
        }
    };

    const getPhaseText = () => {
        switch (currentPhase) {
            case 'inhale': return 'Breathe In';
            case 'hold': return 'Hold';
            case 'exhale': return 'Breathe Out';
            case 'pause': return 'Pause';
            default: return 'Ready';
        }
    };

    const getPhaseColor = () => {
        switch (currentPhase) {
            case 'inhale': return 'from-green-500 to-emerald-500';
            case 'hold': return 'from-blue-500 to-cyan-500';
            case 'exhale': return 'from-purple-500 to-pink-500';
            case 'pause': return 'from-gray-500 to-slate-500';
            default: return 'from-gray-500 to-slate-500';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900/40 backdrop-blur-sm p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">Breathing Exercises</h1>
                    <p className="text-slate-400">Calm your mind and reduce stress with guided breathing techniques</p>
                </motion.div>

                {!selectedExercise ? (
                    /* Exercise Selection */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {exercises.map((exercise) => (
                            <motion.div
                                key={exercise.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer"
                                onClick={() => startExercise(exercise)}
                            >
                                <div className={`w-16 h-16 bg-gradient-to-r ${exercise.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                                    {exercise.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{exercise.name}</h3>
                                <p className="text-slate-400 mb-4">{exercise.description}</p>
                                <div className="mb-4">
                                    <p className="text-sm text-slate-300 mb-2">Pattern:</p>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <span className="bg-slate-700 px-2 py-1 rounded text-white">
                                            In: {exercise.pattern.inhale}s
                                        </span>
                                        <span className="bg-slate-700 px-2 py-1 rounded text-white">
                                            Hold: {exercise.pattern.hold}s
                                        </span>
                                        <span className="bg-slate-700 px-2 py-1 rounded text-white">
                                            Out: {exercise.pattern.exhale}s
                                        </span>
                                        {exercise.pattern.pause > 0 && (
                                            <span className="bg-slate-700 px-2 py-1 rounded text-white">
                                                Pause: {exercise.pattern.pause}s
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-300 mb-2">Benefits:</p>
                                    <ul className="text-sm text-slate-400 space-y-1">
                                        {exercise.benefits.map((benefit, index) => (
                                            <li key={index}>• {benefit}</li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    /* Exercise Interface */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl mx-auto"
                    >
                        {/* Exercise Info */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">{selectedExercise.name}</h2>
                            <p className="text-slate-400">{selectedExercise.description}</p>
                        </div>

                        {/* Breathing Circle */}
                        <div className="flex justify-center mb-8">
                            <motion.div
                                className={`w-64 h-64 rounded-full bg-gradient-to-r ${getPhaseColor()} flex items-center justify-center relative overflow-hidden`}
                                animate={{
                                    scale: currentPhase === 'inhale' ? 1.2 : currentPhase === 'exhale' ? 0.8 : 1,
                                }}
                                transition={{
                                    duration: currentPhase === 'inhale' ? selectedExercise.pattern.inhale :
                                        currentPhase === 'exhale' ? selectedExercise.pattern.exhale : 0.3,
                                    ease: "easeInOut"
                                }}
                            >
                                <div className="absolute inset-0 bg-black/20 rounded-full"></div>
                                <div className="relative z-10 text-center">
                                    <div className="text-4xl font-bold text-white mb-2">{timeLeft}</div>
                                    <div className="text-lg text-white/80">{getPhaseText()}</div>
                                </div>

                                {/* Animated rings */}
                                <motion.div
                                    className="absolute inset-0 border-4 border-white/30 rounded-full"
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 0, 0.3]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            </motion.div>
                        </div>

                        {/* Progress */}
                        <div className="text-center mb-8">
                            <div className="text-white mb-2">
                                Cycle {cycle + 1} of {totalCycles}
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <motion.div
                                    className="bg-secondary-green h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((cycle + (4 - timeLeft) / 4) / totalCycles) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center space-x-4">
                            {!isActive ? (
                                <motion.button
                                    onClick={() => setIsActive(true)}
                                    className="btn-primary px-8 py-3 flex items-center space-x-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiPlay className="w-5 h-5" />
                                    <span>Start</span>
                                </motion.button>
                            ) : (
                                <motion.button
                                    onClick={stopExercise}
                                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 flex items-center space-x-2 rounded-lg transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiPause className="w-5 h-5" />
                                    <span>Stop</span>
                                </motion.button>
                            )}

                            <motion.button
                                onClick={resetExercise}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 flex items-center space-x-2 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiRotateCcw className="w-5 h-5" />
                                <span>Reset</span>
                            </motion.button>
                        </div>

                        {/* Back Button */}
                        <div className="text-center mt-6">
                            <motion.button
                                onClick={() => setSelectedExercise(null)}
                                className="text-slate-400 hover:text-white transition-colors"
                                whileHover={{ scale: 1.05 }}
                            >
                                ← Back to Exercises
                            </motion.button>
                        </div>

                        {/* Cycle Settings */}
                        <div className="mt-8 bg-slate-800/30 rounded-xl p-4">
                            <h3 className="text-white font-medium mb-3">Exercise Settings</h3>
                            <div className="flex items-center space-x-4">
                                <label className="text-slate-300">Cycles:</label>
                                <select
                                    value={totalCycles}
                                    onChange={(e) => setTotalCycles(parseInt(e.target.value))}
                                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                                >
                                    <option value={3}>3 cycles</option>
                                    <option value={5}>5 cycles</option>
                                    <option value={10}>10 cycles</option>
                                    <option value={15}>15 cycles</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default BreathingExercises;

