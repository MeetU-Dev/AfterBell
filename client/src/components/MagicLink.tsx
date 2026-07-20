import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MagicLinkProps {
    to: string;
    children: React.ReactNode;
    icon?: React.ComponentType<{ size?: number }>;
    className?: string;
}

const MagicLink: React.FC<MagicLinkProps> = ({ to, children, icon: Icon, className = "" }) => {
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`relative inline-flex items-center px-6 py-3 font-medium text-white rounded-full overflow-hidden transition-all duration-300 hover:text-white ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Animated pill background */}
            <motion.div
                className="absolute inset-0 bg-secondary-green rounded-full"
                initial={{ scaleX: 0 }}
                animate={{
                    scaleX: isHovered || isActive ? 1 : 0,
                    transition: { duration: 0.3, ease: "easeOut" }
                }}
                style={{ transformOrigin: "left" }}
            />

            {/* Content */}
            <motion.div
                className="relative z-10 flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {Icon && (
                    <motion.div
                        animate={{
                            scale: isHovered ? 1.1 : 1,
                            rotate: isHovered ? 5 : 0
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <Icon size={16} />
                    </motion.div>
                )}
                {children}
            </motion.div>
        </Link>
    );
};

export default MagicLink; 