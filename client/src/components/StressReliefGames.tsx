import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiRotateCcw, FiTarget, FiZap, FiHeart, FiStar } from 'react-icons/fi';

interface Game {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    component: React.ReactNode;
}

// Bubble Pop Game
const BubblePopGame: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setIsActive(false);
            onComplete();
        }
    }, [isActive, timeLeft, onComplete]);

    useEffect(() => {
        if (isActive) {
            const interval = setInterval(() => {
                setBubbles(prev => [
                    ...prev,
                    {
                        id: Date.now() + Math.random(),
                        x: Math.random() * 80 + 10,
                        y: Math.random() * 60 + 10,
                        size: Math.random() * 30 + 20
                    }
                ]);
            }, 800);

            return () => clearInterval(interval);
        }
    }, [isActive]);

    const popBubble = (id: number) => {
        setBubbles(prev => prev.filter(bubble => bubble.id !== id));
        setScore(prev => prev + 1);
    };

    const startGame = () => {
        setIsActive(true);
        setScore(0);
        setTimeLeft(60);
        setBubbles([]);
    };

    return (
        <div className="text-center">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Bubble Pop</h3>
                <p className="text-slate-400">Pop bubbles to relieve stress and tension</p>
            </div>

            <div className="mb-6 flex justify-center space-x-8">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{score}</div>
                    <div className="text-slate-400 text-sm">Score</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{timeLeft}</div>
                    <div className="text-slate-400 text-sm">Time</div>
                </div>
            </div>

            <div className="relative w-full h-96 bg-gradient-to-b from-blue-900/30 to-purple-900/30 rounded-xl overflow-hidden mb-6">
                {bubbles.map((bubble) => (
                    <motion.div
                        key={bubble.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.7 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute cursor-pointer"
                        style={{
                            left: `${bubble.x}%`,
                            top: `${bubble.y}%`,
                            width: bubble.size,
                            height: bubble.size,
                        }}
                        onClick={() => popBubble(bubble.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full border-2 border-white/30 shadow-lg"></div>
                    </motion.div>
                ))}
            </div>

            {!isActive && (
                <motion.button
                    onClick={startGame}
                    className="btn-primary px-8 py-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Start Game
                </motion.button>
            )}
        </div>
    );
};

// Color Matching Game
const ColorMatchingGame: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [colors, setColors] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isActive, setIsActive] = useState(false);

    const colorOptions = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'cyan'];

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setIsActive(false);
            onComplete();
        }
    }, [isActive, timeLeft, onComplete]);

    const generateNewColors = () => {
        const newColors = [];
        for (let i = 0; i < 4; i++) {
            newColors.push(colorOptions[Math.floor(Math.random() * colorOptions.length)]);
        }
        setColors(newColors);
        setSelectedColors([]);
    };

    const selectColor = (color: string) => {
        if (selectedColors.includes(color)) return;

        const newSelected = [...selectedColors, color];
        setSelectedColors(newSelected);

        if (newSelected.length === colors.length) {
            // Check if match
            const isMatch = newSelected.every((color, index) => color === colors[index]);
            if (isMatch) {
                setScore(prev => prev + 10);
                setTimeout(() => generateNewColors(), 500);
            } else {
                setScore(prev => Math.max(0, prev - 5));
                setTimeout(() => setSelectedColors([]), 1000);
            }
        }
    };

    const startGame = () => {
        setIsActive(true);
        setScore(0);
        setTimeLeft(60);
        generateNewColors();
    };

    return (
        <div className="text-center">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Color Match</h3>
                <p className="text-slate-400">Match the color sequence to relax your mind</p>
            </div>

            <div className="mb-6 flex justify-center space-x-8">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{score}</div>
                    <div className="text-slate-400 text-sm">Score</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{timeLeft}</div>
                    <div className="text-slate-400 text-sm">Time</div>
                </div>
            </div>

            {/* Target Colors */}
            <div className="mb-6">
                <h4 className="text-white mb-3">Match this sequence:</h4>
                <div className="flex justify-center space-x-2">
                    {colors.map((color, index) => (
                        <div
                            key={index}
                            className={`w-12 h-12 rounded-lg border-2 border-white/30`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
                <h4 className="text-white mb-3">Your selection:</h4>
                <div className="flex justify-center space-x-2">
                    {selectedColors.map((color, index) => (
                        <div
                            key={index}
                            className={`w-12 h-12 rounded-lg border-2 border-white/30`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                    {Array.from({ length: 4 - selectedColors.length }).map((_, index) => (
                        <div
                            key={index}
                            className="w-12 h-12 rounded-lg border-2 border-dashed border-slate-500"
                        />
                    ))}
                </div>
            </div>

            {/* Color Options */}
            <div className="grid grid-cols-4 gap-2 mb-6">
                {colorOptions.map((color) => (
                    <motion.button
                        key={color}
                        onClick={() => selectColor(color)}
                        disabled={!isActive}
                        className={`w-16 h-16 rounded-lg border-2 border-white/30 disabled:opacity-50`}
                        style={{ backgroundColor: color }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    />
                ))}
            </div>

            {!isActive && (
                <motion.button
                    onClick={startGame}
                    className="btn-primary px-8 py-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Start Game
                </motion.button>
            )}
        </div>
    );
};

// Meditation Timer
const MeditationTimer: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [isActive, setIsActive] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(5);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setIsActive(false);
            onComplete();
        }
    }, [isActive, timeLeft, onComplete]);

    const startMeditation = () => {
        setTimeLeft(selectedDuration * 60);
        setIsActive(true);
    };

    const stopMeditation = () => {
        setIsActive(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="text-center">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Meditation Timer</h3>
                <p className="text-slate-400">Take a peaceful moment to center yourself</p>
            </div>

            <div className="mb-8">
                <div className="text-6xl font-bold text-white mb-4">{formatTime(timeLeft)}</div>
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-secondary-green/30 flex items-center justify-center">
                    <motion.div
                        className="w-24 h-24 rounded-full bg-gradient-to-r from-secondary-green to-blue-400"
                        animate={isActive ? {
                            scale: [1, 1.1, 1],
                            opacity: [0.7, 1, 0.7]
                        } : {}}
                        transition={{
                            duration: 2,
                            repeat: isActive ? Infinity : 0,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </div>

            {!isActive && (
                <div className="mb-6">
                    <label className="block text-white mb-3">Duration (minutes):</label>
                    <select
                        value={selectedDuration}
                        onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                        className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    >
                        <option value={1}>1 minute</option>
                        <option value={3}>3 minutes</option>
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes</option>
                    </select>
                </div>
            )}

            <div className="flex justify-center space-x-4">
                {!isActive ? (
                    <motion.button
                        onClick={startMeditation}
                        className="btn-primary px-8 py-3"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start Meditation
                    </motion.button>
                ) : (
                    <motion.button
                        onClick={stopMeditation}
                        className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Stop
                    </motion.button>
                )}
            </div>

            {isActive && (
                <div className="mt-6 text-slate-400">
                    <p>Focus on your breathing and let your mind rest...</p>
                </div>
            )}
        </div>
    );
};

const StressReliefGames: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [gameScore, setGameScore] = useState(0);

    const games: Game[] = [
        {
            id: 'bubble-pop',
            name: 'Bubble Pop',
            description: 'Pop colorful bubbles to release tension and stress',
            icon: <FiTarget className="w-8 h-8" />,
            color: 'from-cyan-500 to-blue-500',
            component: <BubblePopGame onComplete={() => setGameScore(prev => prev + 1)} />
        },
        {
            id: 'color-match',
            name: 'Color Match',
            description: 'Match color sequences to focus your mind and relax',
            icon: <FiZap className="w-8 h-8" />,
            color: 'from-purple-500 to-pink-500',
            component: <ColorMatchingGame onComplete={() => setGameScore(prev => prev + 1)} />
        },
        {
            id: 'meditation',
            name: 'Meditation Timer',
            description: 'Take a peaceful moment to center yourself',
            icon: <FiHeart className="w-8 h-8" />,
            color: 'from-green-500 to-emerald-500',
            component: <MeditationTimer onComplete={() => setGameScore(prev => prev + 1)} />
        }
    ];

    return (
        <div className="min-h-screen bg-slate-900/40 backdrop-blur-sm p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">Stress Relief Games</h1>
                    <p className="text-slate-400">Play relaxing games to reduce stress and improve your mood</p>
                </motion.div>

                {!selectedGame ? (
                    /* Game Selection */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {games.map((game) => (
                            <motion.div
                                key={game.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer"
                                onClick={() => setSelectedGame(game)}
                            >
                                <div className={`w-16 h-16 bg-gradient-to-r ${game.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                                    {game.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                                <p className="text-slate-400">{game.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    /* Game Interface */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50">
                            {selectedGame.component}
                        </div>

                        {/* Back Button */}
                        <div className="text-center mt-6">
                            <motion.button
                                onClick={() => setSelectedGame(null)}
                                className="text-slate-400 hover:text-white transition-colors"
                                whileHover={{ scale: 1.05 }}
                            >
                                ← Back to Games
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default StressReliefGames;

