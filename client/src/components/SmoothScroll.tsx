import React, { useEffect } from 'react';
import { smoothScrollTo } from './PerformanceOptimizer';

interface SmoothScrollProps {
    children: React.ReactNode;
    className?: string;
}

// Smooth scroll wrapper component
export const SmoothScrollWrapper: React.FC<SmoothScrollProps> = ({
    children,
    className = ''
}) => {
    useEffect(() => {
        // Add smooth scrolling behavior to all anchor links
        const handleAnchorClick = (e: Event) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a[href^="#"]') as HTMLAnchorElement;

            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href')?.substring(1);
                if (targetId) {
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        smoothScrollTo(targetElement, 80); // 80px offset for header
                    }
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);
        return () => document.removeEventListener('click', handleAnchorClick);
    }, []);

    return (
        <div className={`smooth-scroll ${className}`}>
            {children}
        </div>
    );
};

// Smooth scroll to top button
export const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = React.useState(false);

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
        <button
            onClick={scrollToTop}
            className={`fixed bottom-20 right-4 z-40 p-3 bg-slate-800/90 backdrop-blur-lg rounded-full border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/90 transition-all duration-300 shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
            title="Scroll to top"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </button>
    );
};

// Smooth scroll navigation component
export const SmoothScrollNav: React.FC<{
    items: Array<{ id: string; label: string; offset?: number }>;
    className?: string;
}> = ({ items, className = '' }) => {
    const handleNavClick = (item: { id: string; label: string; offset?: number }) => {
        const element = document.getElementById(item.id);
        if (element) {
            smoothScrollTo(element, item.offset || 80);
        }
    };

    return (
        <nav className={`smooth-scroll-nav ${className}`}>
            <ul className="flex space-x-4">
                {items.map((item) => (
                    <li key={item.id}>
                        <button
                            onClick={() => handleNavClick(item)}
                            className="text-slate-300 hover:text-white transition-colors duration-300 font-medium"
                        >
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default SmoothScrollWrapper;
