import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiTarget,
    FiStar,
    FiAward,
    FiPlay,
    FiPause,
    FiRotateCcw,
    FiCheckCircle,
    FiX,
    FiDollarSign,
    FiMessageCircle,
    FiStar as FiStarIcon,
    FiClock,
    FiMonitor,
    FiBookOpen
} from 'react-icons/fi';

// Game types
export type GameType = 'budget' | 'speaking' | 'cooking' | 'photography' | 'safety' | 'writing' | 'time' | 'coding' | 'stress' | 'confidence' | 'anxiety';

interface MiniGameProps {
    gameType: GameType;
    onComplete: (score: number, time: number) => void;
    onSkip: () => void;
    initialScore?: number;
    initialTime?: number;
}

// Budget Game - Money Management Challenge
const BudgetGame: React.FC<MiniGameProps> = ({ onComplete, onSkip }) => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const questions = [
        {
            question: "You have $100. How much should you allocate for needs?",
            options: ["$50", "$30", "$20", "$80"],
            correct: 0,
            explanation: "The 50/30/20 rule suggests 50% for needs!"
        },
        {
            question: "What's the best way to track your spending?",
            options: ["Write it down", "Use an app", "Remember it", "Ask parents"],
            correct: 1,
            explanation: "Apps make tracking easier and more accurate!"
        },
        {
            question: "How often should you review your budget?",
            options: ["Monthly", "Weekly", "Daily", "Never"],
            correct: 1,
            explanation: "Weekly reviews help you stay on track!"
        },
        {
            question: "What percentage should go to savings?",
            options: ["10%", "20%", "30%", "5%"],
            correct: 1,
            explanation: "20% is the recommended savings rate!"
        },
        {
            question: "Which is a 'want' expense?",
            options: ["Rent", "Food", "Video games", "Transportation"],
            correct: 2,
            explanation: "Video games are entertainment, which is a want!"
        }
    ];

    useEffect(() => {
        if (gameStarted && timeLeft > 0 && !gameOver) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setGameOver(true);
        }
    }, [timeLeft, gameStarted, gameOver]);

    const handleAnswer = (answerIndex: number) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(answerIndex);
        if (answerIndex === questions[currentQuestion].correct) {
            setScore(score + 1);
        }

        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
            } else {
                setGameOver(true);
            }
        }, 2000);
    };

    const startGame = () => {
        setGameStarted(true);
        setTimeLeft(60);
        setScore(0);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setGameOver(false);
    };

    const resetGame = () => {
        setGameStarted(false);
        setGameOver(false);
        setScore(0);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setTimeLeft(60);
    };

    if (!gameStarted) {
        return (
            <div className="text-center p-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6"
                >
                    <FiDollarSign className="w-16 h-16 text-secondary-green mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Budget Master Challenge</h3>
                    <p className="text-slate-300 mb-6">Test your budgeting knowledge in 60 seconds!</p>
                </motion.div>
                <div className="flex gap-4 justify-center">
                    <motion.button
                        onClick={startGame}
                        className="bg-gradient-to-r from-secondary-green to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiPlay className="w-4 h-4" />
                        Start Game
                    </motion.button>
                    <motion.button
                        onClick={onSkip}
                        className="bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Skip
                    </motion.button>
                </div>
            </div>
        );
    }

    if (gameOver) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="text-center p-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6"
                >
                    <FiAward className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Game Complete!</h3>
                    <div className="text-4xl font-bold text-secondary-green mb-2">{score}/{questions.length}</div>
                    <div className="text-xl text-slate-300 mb-4">{percentage}% Correct</div>
                    <div className="text-slate-400">
                        {percentage >= 80 ? "Budget Master!" :
                            percentage >= 60 ? "Good job!" :
                                "Keep learning!"}
                    </div>
                </motion.div>
                <div className="flex gap-4 justify-center">
                    <motion.button
                        onClick={() => onComplete(score, 60 - timeLeft)}
                        className="bg-gradient-to-r from-secondary-green to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Continue Learning
                    </motion.button>
                    <motion.button
                        onClick={resetGame}
                        className="bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiRotateCcw className="w-4 h-4" />
                        Play Again
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="text-white font-semibold">Question {currentQuestion + 1}/{questions.length}</div>
                <div className="flex items-center gap-4">
                    <div className="text-white">Score: {score}</div>
                    <div className="text-white">Time: {timeLeft}s</div>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">{questions[currentQuestion].question}</h3>
                <div className="grid grid-cols-2 gap-3">
                    {questions[currentQuestion].options.map((option, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={selectedAnswer !== null}
                            className={`p-4 rounded-xl font-semibold transition-all duration-300 ${selectedAnswer === null
                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                : index === questions[currentQuestion].correct
                                    ? 'bg-secondary-green text-white'
                                    : selectedAnswer === index
                                        ? 'bg-red-500 text-white'
                                        : 'bg-slate-700 text-slate-400'
                                }`}
                            whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                            whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                        >
                            {option}
                        </motion.button>
                    ))}
                </div>
            </div>

            {selectedAnswer !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-800 rounded-xl"
                >
                    <p className="text-slate-300">{questions[currentQuestion].explanation}</p>
                </motion.div>
            )}
        </div>
    );
};

// Public Speaking Game - Confidence Builder
const SpeakingGame: React.FC<MiniGameProps> = ({ onComplete, onSkip }) => {
    const [currentPhrase, setCurrentPhrase] = useState(0);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const phrases = [
        "Hello everyone, my name is...",
        "Today I want to talk about...",
        "The main point is...",
        "In conclusion...",
        "Thank you for listening"
    ];

    const startGame = () => {
        setGameStarted(true);
        setCurrentPhrase(0);
        setScore(0);
        setGameOver(false);
    };

    const handlePhraseComplete = () => {
        setScore(score + 1);
        if (currentPhrase < phrases.length - 1) {
            setCurrentPhrase(currentPhrase + 1);
        } else {
            setGameOver(true);
        }
    };

    if (!gameStarted) {
        return (
            <div className="text-center p-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6"
                >
                    <FiMessageCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Confidence Builder</h3>
                    <p className="text-slate-300 mb-6">Practice speaking these phrases with confidence!</p>
                </motion.div>
                <div className="flex gap-4 justify-center">
                    <motion.button
                        onClick={startGame}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiPlay className="w-4 h-4" />
                        Start Practice
                    </motion.button>
                    <motion.button
                        onClick={onSkip}
                        className="bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Skip
                    </motion.button>
                </div>
            </div>
        );
    }

    if (gameOver) {
        return (
            <div className="text-center p-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6"
                >
                    <FiAward className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Great Practice!</h3>
                    <div className="text-4xl font-bold text-blue-500 mb-2">{score}/{phrases.length}</div>
                    <div className="text-xl text-slate-300 mb-4">Phrases Completed</div>
                    <div className="text-slate-400">You're building confidence!</div>
                </motion.div>
                <div className="flex gap-4 justify-center">
                    <motion.button
                        onClick={() => onComplete(score, 0)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Continue Learning
                    </motion.button>
                    <motion.button
                        onClick={startGame}
                        className="bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiRotateCcw className="w-4 h-4" />
                        Practice Again
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 text-center">
            <div className="mb-6">
                <div className="text-white font-semibold mb-4">Phrase {currentPhrase + 1}/{phrases.length}</div>
                <div className="text-2xl font-bold text-white mb-6 p-6 bg-slate-800 rounded-xl">
                    "{phrases[currentPhrase]}"
                </div>
                <p className="text-slate-400 mb-6">Say this phrase out loud with confidence!</p>
            </div>

            <motion.button
                onClick={handlePhraseComplete}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                I Said It!
            </motion.button>
        </div>
    );
};

// Cooking Game - Recipe Challenge
const CookingGame: React.FC<MiniGameProps> = ({ onComplete, onSkip }) => {
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState(0);

    const recipes = [
        {
            name: "Pasta",
            correct: ["pasta", "tomato sauce", "cheese", "garlic"],
            all: ["pasta", "tomato sauce", "cheese", "garlic", "chocolate", "ice cream", "pickles"]
        },
        {
            name: "Scrambled Eggs",
            correct: ["eggs", "butter", "salt", "pepper"],
            all: ["eggs", "butter", "salt", "pepper", "sugar", "flour", "vanilla"]
        },
        {
            name: "Salad",
            correct: ["lettuce", "tomato", "cucumber", "dressing"],
            all: ["lettuce", "tomato", "cucumber", "dressing", "chicken", "rice", "soy sauce"]
        }
    ];

    const startGame = () => {
        setGameStarted(true);
        setCurrentRecipe(0);
        setScore(0);
        setGameOver(false);
        setSelectedIngredients([]);
        setIngredients(recipes[0].all);
    };

    const toggleIngredient = (ingredient: string) => {
        if (selectedIngredients.includes(ingredient)) {
            setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
        } else {
            setSelectedIngredients([...selectedIngredients, ingredient]);
        }
    };

    const checkRecipe = () => {
        const correct = recipes[currentRecipe].correct;
        const isCorrect = correct.every(ingredient => selectedIngredients.includes(ingredient)) &&
            selectedIngredients.every(ingredient => correct.includes(ingredient));

        if (isCorrect) {
            setScore(score + 1);
        }

        if (currentRecipe < recipes.length - 1) {
            setCurrentRecipe(currentRecipe + 1);
            setSelectedIngredients([]);
            setIngredients(recipes[currentRecipe + 1].all);
        } else {
            setGameOver(true);
        }
    };

    if (!gameStarted) {
        return (
            <div className="text-center p-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6"
                >
                    <FiStarIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Recipe Challenge</h3>
                    <p className="text-slate-300 mb-6">Choose the right ingredients for each recipe!</p>
                </motion.div>
                <div className="flex gap-4 justify-center">
                    <motion.button
                        onClick={startGame}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiPlay className="w-4 h-4" />
                        Start Cooking
                    </motion.button>
                    <motion.button
                        onClick={onSkip}
                        className="bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Skip
                    </motion.button>
                </div>
            </div>
        );
    }

    if (gameOver) {
        return (
            <div className="text-center p-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6"
                >
                    <FiAward className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Recipe Master!</h3>
                    <div className="text-4xl font-bold text-orange-500 mb-2">{score}/{recipes.length}</div>
                    <div className="text-xl text-slate-300 mb-4">Recipes Correct</div>
                    <div className="text-slate-400">Great cooking knowledge!</div>
                </motion.div>
                <div className="flex gap-4 justify-center">
                    <motion.button
                        onClick={() => onComplete(score, 0)}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Continue Learning
                    </motion.button>
                    <motion.button
                        onClick={startGame}
                        className="bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiRotateCcw className="w-4 h-4" />
                        Cook Again
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Recipe {currentRecipe + 1}: {recipes[currentRecipe].name}</h3>
                <p className="text-slate-300">Select the correct ingredients:</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                {ingredients.map((ingredient, index) => (
                    <motion.button
                        key={index}
                        onClick={() => toggleIngredient(ingredient)}
                        className={`p-4 rounded-xl font-semibold transition-all duration-300 ${selectedIngredients.includes(ingredient)
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {ingredient}
                    </motion.button>
                ))}
            </div>

            <div className="text-center">
                <motion.button
                    onClick={checkRecipe}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Check Recipe
                </motion.button>
            </div>
        </div>
    );
};

// Stress Management Game
const StressGame: React.FC<MiniGameProps> = ({ onComplete, onSkip }) => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [currentScenario, setCurrentScenario] = useState(0);
    const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const scenarios = [
        {
            scenario: "You have 3 exams tomorrow and feel overwhelmed. What's the best first step?",
            strategies: ["Panic and study all night", "Take 5 deep breaths and make a plan", "Skip the exams", "Ask friends for answers"],
            correct: 1,
            explanation: "Taking deep breaths helps calm your nervous system and clear thinking!"
        },
        {
            scenario: "Your best friend is ignoring you and you're stressed about it. What should you do?",
            strategies: ["Ignore them back", "Talk to them calmly about it", "Post about it on social media", "Ask other friends to choose sides"],
            correct: 1,
            explanation: "Open communication is key to resolving conflicts and reducing stress!"
        },
        {
            scenario: "You're running late for an important presentation. How do you manage the stress?",
            strategies: ["Rush and panic", "Take a moment to breathe and focus", "Cancel the presentation", "Blame others"],
            correct: 1,
            explanation: "Staying calm helps you think clearly and perform better under pressure!"
        }
    ];

    useEffect(() => {
        if (gameStarted && !gameOver && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setGameOver(true);
        }
    }, [gameStarted, timeLeft, gameOver]);

    const handleAnswer = (index: number) => {
        setSelectedStrategy(index);
        if (index === scenarios[currentScenario].correct) {
            setScore(score + 1);
        }

        setTimeout(() => {
            if (currentScenario < scenarios.length - 1) {
                setCurrentScenario(currentScenario + 1);
                setSelectedStrategy(null);
            } else {
                setGameOver(true);
            }
        }, 1500);
    };

    const startGame = () => {
        setGameStarted(true);
    };

    const resetGame = () => {
        setScore(0);
        setTimeLeft(60);
        setCurrentScenario(0);
        setSelectedStrategy(null);
        setGameStarted(false);
        setGameOver(false);
    };

    if (!gameStarted) {
        return (
            <div className="p-8 text-center">
                <div className="mb-6">
                    <FiTarget className="w-16 h-16 text-secondary-green mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Stress Management Challenge</h2>
                    <p className="text-slate-300">Practice managing stress in real-life scenarios!</p>
                </div>
                <div className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">How to Play:</h3>
                        <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Read each stress scenario</li>
                            <li>• Choose the best coping strategy</li>
                            <li>• Learn effective stress management techniques</li>
                            <li>• Complete in 60 seconds!</li>
                        </ul>
                    </div>
                    <motion.button
                        onClick={startGame}
                        className="btn-primary px-8 py-3 text-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start Challenge
                    </motion.button>
                </div>
            </div>
        );
    }

    if (gameOver) {
        const percentage = Math.round((score / scenarios.length) * 100);
        return (
            <div className="p-8 text-center">
                <div className="mb-6">
                    <FiAward className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Challenge Complete!</h2>
                    <p className="text-slate-300">You scored {score}/{scenarios.length} ({percentage}%)</p>
                </div>
                <div className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Great job!</h3>
                        <p className="text-sm text-slate-300">
                            {percentage >= 80 ? "Excellent stress management skills!" :
                                percentage >= 60 ? "Good understanding of stress management!" :
                                    "Keep practicing these techniques!"}
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <motion.button
                            onClick={() => onComplete(score, 60 - timeLeft)}
                            className="btn-primary px-6 py-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Continue Learning
                        </motion.button>
                        <motion.button
                            onClick={resetGame}
                            className="btn-secondary px-6 py-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Try Again
                        </motion.button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <div className="bg-secondary-green/20 text-secondary-green px-3 py-1 rounded-full text-sm font-medium">
                        {timeLeft}s
                    </div>
                    <div className="text-white font-medium">
                        {currentScenario + 1}/{scenarios.length}
                    </div>
                </div>
                <div className="text-white font-medium">
                    Score: {score}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {scenarios[currentScenario].scenario}
                </h3>
                <div className="space-y-3">
                    {scenarios[currentScenario].strategies.map((strategy, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={selectedStrategy !== null}
                            className={`w-full p-4 rounded-lg text-left transition-all ${selectedStrategy === index
                                    ? index === scenarios[currentScenario].correct
                                        ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                                        : 'bg-red-500/20 border-2 border-red-500 text-red-300'
                                    : selectedStrategy !== null && index === scenarios[currentScenario].correct
                                        ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                                        : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border-2 border-transparent'
                                }`}
                            whileHover={{ scale: selectedStrategy === null ? 1.02 : 1 }}
                            whileTap={{ scale: selectedStrategy === null ? 0.98 : 1 }}
                        >
                            {strategy}
                        </motion.button>
                    ))}
                </div>
            </div>

            {selectedStrategy !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-700/50 rounded-lg p-4 mb-4"
                >
                    <p className="text-sm text-slate-300">
                        {scenarios[currentScenario].explanation}
                    </p>
                </motion.div>
            )}

            <div className="flex justify-between">
                <motion.button
                    onClick={onSkip}
                    className="text-slate-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                >
                    Skip Challenge
                </motion.button>
            </div>
        </div>
    );
};

// Confidence Building Game
const ConfidenceGame: React.FC<MiniGameProps> = ({ onComplete, onSkip }) => {
    const [score, setScore] = useState(0);
    const [currentChallenge, setCurrentChallenge] = useState(0);
    const [selectedResponse, setSelectedResponse] = useState<number | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const challenges = [
        {
            challenge: "Someone criticizes your presentation in front of the class. How do you respond?",
            responses: ["Feel embarrassed and avoid speaking up again", "Thank them for feedback and ask for specific improvements", "Get angry and criticize them back", "Ignore them completely"],
            correct: 1,
            explanation: "Confident people see feedback as an opportunity to grow and improve!"
        },
        {
            challenge: "You're offered a leadership role you're not sure you're ready for. What do you do?",
            responses: ["Decline immediately", "Accept it and figure it out as you go", "Ask for more details and training first", "Ask someone else to do it"],
            correct: 2,
            explanation: "Confident people ask questions and seek support when taking on new challenges!"
        },
        {
            challenge: "You make a mistake in a group project. How do you handle it?",
            responses: ["Hide it and hope no one notices", "Blame someone else", "Acknowledge it and work to fix it", "Quit the project"],
            correct: 2,
            explanation: "Confident people take responsibility for their mistakes and focus on solutions!"
        }
    ];

    const handleAnswer = (index: number) => {
        setSelectedResponse(index);
        if (index === challenges[currentChallenge].correct) {
            setScore(score + 1);
        }

        setTimeout(() => {
            if (currentChallenge < challenges.length - 1) {
                setCurrentChallenge(currentChallenge + 1);
                setSelectedResponse(null);
            } else {
                setGameOver(true);
            }
        }, 1500);
    };

    const startGame = () => {
        setGameStarted(true);
    };

    const resetGame = () => {
        setScore(0);
        setCurrentChallenge(0);
        setSelectedResponse(null);
        setGameStarted(false);
        setGameOver(false);
    };

    if (!gameStarted) {
        return (
            <div className="p-8 text-center">
                <div className="mb-6">
                    <FiTarget className="w-16 h-16 text-secondary-green mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Confidence Building Challenge</h2>
                    <p className="text-slate-300">Practice confident responses to challenging situations!</p>
                </div>
                <div className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">How to Play:</h3>
                        <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Read each confidence challenge</li>
                            <li>• Choose the most confident response</li>
                            <li>• Learn to build self-confidence</li>
                            <li>• Practice assertive communication</li>
                        </ul>
                    </div>
                    <motion.button
                        onClick={startGame}
                        className="btn-primary px-8 py-3 text-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start Challenge
                    </motion.button>
                </div>
            </div>
        );
    }

    if (gameOver) {
        const percentage = Math.round((score / challenges.length) * 100);
        return (
            <div className="p-8 text-center">
                <div className="mb-6">
                    <FiAward className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Challenge Complete!</h2>
                    <p className="text-slate-300">You scored {score}/{challenges.length} ({percentage}%)</p>
                </div>
                <div className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Excellent work!</h3>
                        <p className="text-sm text-slate-300">
                            {percentage >= 80 ? "You have great confidence skills!" :
                                percentage >= 60 ? "Good understanding of confident behavior!" :
                                    "Keep practicing these confidence techniques!"}
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <motion.button
                            onClick={() => onComplete(score, 0)}
                            className="btn-primary px-6 py-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Continue Learning
                        </motion.button>
                        <motion.button
                            onClick={resetGame}
                            className="btn-secondary px-6 py-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Try Again
                        </motion.button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="text-white font-medium">
                    {currentChallenge + 1}/{challenges.length}
                </div>
                <div className="text-white font-medium">
                    Score: {score}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {challenges[currentChallenge].challenge}
                </h3>
                <div className="space-y-3">
                    {challenges[currentChallenge].responses.map((response, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={selectedResponse !== null}
                            className={`w-full p-4 rounded-lg text-left transition-all ${selectedResponse === index
                                    ? index === challenges[currentChallenge].correct
                                        ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                                        : 'bg-red-500/20 border-2 border-red-500 text-red-300'
                                    : selectedResponse !== null && index === challenges[currentChallenge].correct
                                        ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                                        : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border-2 border-transparent'
                                }`}
                            whileHover={{ scale: selectedResponse === null ? 1.02 : 1 }}
                            whileTap={{ scale: selectedResponse === null ? 0.98 : 1 }}
                        >
                            {response}
                        </motion.button>
                    ))}
                </div>
            </div>

            {selectedResponse !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-700/50 rounded-lg p-4 mb-4"
                >
                    <p className="text-sm text-slate-300">
                        {challenges[currentChallenge].explanation}
                    </p>
                </motion.div>
            )}

            <div className="flex justify-between">
                <motion.button
                    onClick={onSkip}
                    className="text-slate-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                >
                    Skip Challenge
                </motion.button>
            </div>
        </div>
    );
};

// Anxiety Management Game
const AnxietyGame: React.FC<MiniGameProps> = ({ onComplete, onSkip }) => {
    const [score, setScore] = useState(0);
    const [currentSituation, setCurrentSituation] = useState(0);
    const [selectedTechnique, setSelectedTechnique] = useState<number | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const situations = [
        {
            situation: "You're having a panic attack before a big test. What's the best immediate technique?",
            techniques: ["Try to ignore it", "Use the 5-4-3-2-1 grounding technique", "Drink lots of caffeine", "Avoid the test"],
            correct: 1,
            explanation: "Grounding techniques help bring you back to the present moment and reduce panic!"
        },
        {
            situation: "You're feeling anxious about a social event. What's the most helpful approach?",
            techniques: ["Cancel and stay home", "Practice deep breathing and positive self-talk", "Take anxiety medication", "Drink alcohol to relax"],
            correct: 1,
            explanation: "Breathing exercises and positive self-talk are healthy ways to manage social anxiety!"
        },
        {
            situation: "You're overwhelmed with anxious thoughts. What should you do?",
            techniques: ["Ruminate on the thoughts", "Write them down and challenge them", "Distract yourself with social media", "Worry more about the future"],
            correct: 1,
            explanation: "Writing down and challenging anxious thoughts helps break the worry cycle!"
        }
    ];

    const handleAnswer = (index: number) => {
        setSelectedTechnique(index);
        if (index === situations[currentSituation].correct) {
            setScore(score + 1);
        }

        setTimeout(() => {
            if (currentSituation < situations.length - 1) {
                setCurrentSituation(currentSituation + 1);
                setSelectedTechnique(null);
            } else {
                setGameOver(true);
            }
        }, 1500);
    };

    const startGame = () => {
        setGameStarted(true);
    };

    const resetGame = () => {
        setScore(0);
        setCurrentSituation(0);
        setSelectedTechnique(null);
        setGameStarted(false);
        setGameOver(false);
    };

    if (!gameStarted) {
        return (
            <div className="p-8 text-center">
                <div className="mb-6">
                    <FiTarget className="w-16 h-16 text-secondary-green mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Anxiety Management Challenge</h2>
                    <p className="text-slate-300">Learn effective techniques to manage anxiety and panic!</p>
                </div>
                <div className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">How to Play:</h3>
                        <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Read each anxiety situation</li>
                            <li>• Choose the best coping technique</li>
                            <li>• Learn practical anxiety management</li>
                            <li>• Build your anxiety toolkit</li>
                        </ul>
                    </div>
                    <motion.button
                        onClick={startGame}
                        className="btn-primary px-8 py-3 text-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start Challenge
                    </motion.button>
                </div>
            </div>
        );
    }

    if (gameOver) {
        const percentage = Math.round((score / situations.length) * 100);
        return (
            <div className="p-8 text-center">
                <div className="mb-6">
                    <FiAward className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Challenge Complete!</h2>
                    <p className="text-slate-300">You scored {score}/{situations.length} ({percentage}%)</p>
                </div>
                <div className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Well done!</h3>
                        <p className="text-sm text-slate-300">
                            {percentage >= 80 ? "You have excellent anxiety management skills!" :
                                percentage >= 60 ? "Good understanding of anxiety techniques!" :
                                    "Keep practicing these anxiety management strategies!"}
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <motion.button
                            onClick={() => onComplete(score, 0)}
                            className="btn-primary px-6 py-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Continue Learning
                        </motion.button>
                        <motion.button
                            onClick={resetGame}
                            className="btn-secondary px-6 py-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Try Again
                        </motion.button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="text-white font-medium">
                    {currentSituation + 1}/{situations.length}
                </div>
                <div className="text-white font-medium">
                    Score: {score}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {situations[currentSituation].situation}
                </h3>
                <div className="space-y-3">
                    {situations[currentSituation].techniques.map((technique, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={selectedTechnique !== null}
                            className={`w-full p-4 rounded-lg text-left transition-all ${selectedTechnique === index
                                    ? index === situations[currentSituation].correct
                                        ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                                        : 'bg-red-500/20 border-2 border-red-500 text-red-300'
                                    : selectedTechnique !== null && index === situations[currentSituation].correct
                                        ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                                        : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border-2 border-transparent'
                                }`}
                            whileHover={{ scale: selectedTechnique === null ? 1.02 : 1 }}
                            whileTap={{ scale: selectedTechnique === null ? 0.98 : 1 }}
                        >
                            {technique}
                        </motion.button>
                    ))}
                </div>
            </div>

            {selectedTechnique !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-700/50 rounded-lg p-4 mb-4"
                >
                    <p className="text-sm text-slate-300">
                        {situations[currentSituation].explanation}
                    </p>
                </motion.div>
            )}

            <div className="flex justify-between">
                <motion.button
                    onClick={onSkip}
                    className="text-slate-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                >
                    Skip Challenge
                </motion.button>
            </div>
        </div>
    );
};

// Main MiniGame Component
const MiniGame: React.FC<{ gameType: GameType; onComplete: (score: number, time: number) => void; onSkip: () => void }> = ({
    gameType,
    onComplete,
    onSkip
}) => {
    const renderGame = () => {
        switch (gameType) {
            case 'budget':
                return <BudgetGame onComplete={onComplete} onSkip={onSkip} />;
            case 'speaking':
                return <SpeakingGame onComplete={onComplete} onSkip={onSkip} />;
            case 'cooking':
                return <CookingGame onComplete={onComplete} onSkip={onSkip} />;
            case 'photography':
                return <PhotographyGame onComplete={onComplete} onSkip={onSkip} />;
            case 'safety':
                return <SafetyGame onComplete={onComplete} onSkip={onSkip} />;
            case 'writing':
                return <WritingGame onComplete={onComplete} onSkip={onSkip} />;
            case 'time':
                return <TimeGame onComplete={onComplete} onSkip={onSkip} />;
            case 'coding':
                return <CodingGame onComplete={onComplete} onSkip={onSkip} />;
            case 'stress':
                return <StressGame onComplete={onComplete} onSkip={onSkip} />;
            case 'confidence':
                return <ConfidenceGame onComplete={onComplete} onSkip={onSkip} />;
            case 'anxiety':
                return <AnxietyGame onComplete={onComplete} onSkip={onSkip} />;
            default:
                return <BudgetGame onComplete={onComplete} onSkip={onSkip} />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-800/80 backdrop-blur-lg rounded-3xl border border-slate-700/50 overflow-hidden"
        >
            {renderGame()}
        </motion.div>
    );
};

export default MiniGame;
