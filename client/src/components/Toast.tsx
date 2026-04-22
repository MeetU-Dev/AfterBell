import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
    // Ensure toast has required properties
    if (!toast || !toast.type || !toast.title) {
        return null;
    }

    const icons = {
        success: FiCheckCircle,
        error: FiAlertCircle,
        warning: FiAlertCircle,
        info: FiInfo,
    };

    const colors = {
        success: {
            bg: 'bg-green-500/10',
            border: 'border-green-500/30',
            icon: 'text-green-400',
            title: 'text-green-300',
            message: 'text-green-200',
        },
        error: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            icon: 'text-red-400',
            title: 'text-red-300',
            message: 'text-red-200',
        },
        warning: {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
            icon: 'text-yellow-400',
            title: 'text-yellow-300',
            message: 'text-yellow-200',
        },
        info: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            icon: 'text-blue-400',
            title: 'text-blue-300',
            message: 'text-blue-200',
        },
    };

    // Safely get icon and color scheme with fallbacks
    const Icon = icons[toast.type as ToastType] || icons.info;
    const colorScheme = colors[toast.type as ToastType] || colors.info;

    return (
        <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative max-w-sm w-full ${colorScheme.bg} ${colorScheme.border} border backdrop-blur-lg rounded-xl p-4 shadow-lg`}
        >
            <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${colorScheme.icon} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm ${colorScheme.title}`}>
                        {toast.title}
                    </h4>
                    {toast.message && (
                        <p className={`text-xs mt-1 ${colorScheme.message}`}>
                            {toast.message}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => onRemove(toast.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
                >
                    <FiX className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastComponent
                        key={toast.id}
                        toast={toast}
                        onRemove={onRemove}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
