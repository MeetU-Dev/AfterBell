import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronUp } from 'react-icons/fi';

// Scroll to Top Button
const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <motion.button
            onClick={scrollToTop}
            className={`fixed bottom-4 right-4 z-40 p-3 bg-slate-800/90 backdrop-blur-lg rounded-full border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/90 transition-all duration-300 shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Scroll to top"
        >
            <FiChevronUp className="w-5 h-5" />
        </motion.button>
    );
};

// Main Floating Action Buttons Container
export const FloatingActionButtons: React.FC = () => {
    return (
        <>
            <ScrollToTopButton />
        </>
    );
};

export default FloatingActionButtons;
