import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiZap, FiMonitor, FiX } from 'react-icons/fi';
import { usePerformanceMonitor } from './PerformanceOptimizer';

interface PerformanceMonitorProps {
    show?: boolean;
    onToggle?: () => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
    show = false,
    onToggle
}) => {
    const { fps, frameTime } = usePerformanceMonitor();
    const [isVisible, setIsVisible] = useState(show);

    useEffect(() => {
        setIsVisible(show);
    }, [show]);

    const getPerformanceColor = (fps: number) => {
        if (fps >= 55) return 'text-green-400';
        if (fps >= 45) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getPerformanceStatus = (fps: number) => {
        if (fps >= 55) return 'Excellent';
        if (fps >= 45) return 'Good';
        if (fps >= 30) return 'Fair';
        return 'Poor';
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 20 }}
                    className="fixed bottom-4 right-4 z-50 bg-slate-800/90 backdrop-blur-lg rounded-xl border border-slate-700/50 p-4 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <FiActivity className="w-4 h-4 text-secondary-green" />
                            <span className="text-sm font-semibold text-white">Performance</span>
                        </div>
                        {onToggle && (
                            <button
                                onClick={onToggle}
                                className="p-1 text-slate-400 hover:text-white transition-colors"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {/* FPS Display */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <FiZap className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-300">FPS</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`text-sm font-mono font-bold ${getPerformanceColor(fps)}`}>
                                    {fps}
                                </span>
                                <div className={`w-2 h-2 rounded-full ${fps >= 55 ? 'bg-green-400' :
                                        fps >= 45 ? 'bg-yellow-400' : 'bg-red-400'
                                    }`} />
                            </div>
                        </div>

                        {/* Frame Time */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <FiMonitor className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-300">Frame Time</span>
                            </div>
                            <span className="text-sm font-mono text-slate-300">
                                {frameTime.toFixed(1)}ms
                            </span>
                        </div>

                        {/* Performance Status */}
                        <div className="pt-2 border-t border-slate-700/50">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">Status</span>
                                <span className={`text-xs font-semibold ${getPerformanceColor(fps)}`}>
                                    {getPerformanceStatus(fps)}
                                </span>
                            </div>
                        </div>

                        {/* Performance Bar */}
                        <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                            <motion.div
                                className={`h-1.5 rounded-full ${fps >= 55 ? 'bg-green-400' :
                                        fps >= 45 ? 'bg-yellow-400' : 'bg-red-400'
                                    }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((fps / 60) * 100, 100)}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Performance Toggle Button
export const PerformanceToggle: React.FC = () => {
    const [showMonitor, setShowMonitor] = useState(false);

    return (
        <>
            <motion.button
                onClick={() => setShowMonitor(!showMonitor)}
                className="fixed bottom-4 right-4 z-50 p-3 bg-slate-800/90 backdrop-blur-lg rounded-full border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/90 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Toggle Performance Monitor"
            >
                <FiActivity className="w-5 h-5" />
            </motion.button>

            <PerformanceMonitor
                show={showMonitor}
                onToggle={() => setShowMonitor(false)}
            />
        </>
    );
};

export default PerformanceMonitor;
