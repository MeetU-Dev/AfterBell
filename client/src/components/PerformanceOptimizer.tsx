import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

// Performance-optimized motion component
export const OptimizedMotion: React.FC<{
    children: React.ReactNode;
    className?: string;
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    whileInView?: any;
    viewport?: any;
    delay?: number;
    stagger?: number;
    once?: boolean;
}> = ({
    children,
    className = '',
    initial,
    animate,
    exit,
    transition,
    whileHover,
    whileTap,
    whileInView,
    viewport,
    delay = 0,
    stagger = 0,
    once = true
}) => {
        const ref = useRef(null);
        const isInView = useInView(ref, {
            once,
            margin: "-100px",
            ...viewport
        });
        const controls = useAnimation();

        useEffect(() => {
            if (isInView) {
                controls.start(animate);
            }
        }, [isInView, controls, animate]);

        return (
            <motion.div
                ref={ref}
                className={`gpu-accelerated ${className}`}
                initial={initial}
                animate={controls}
                exit={exit}
                transition={{
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1],
                    delay,
                    ...transition
                }}
                whileHover={whileHover}
                whileTap={whileTap}
                whileInView={whileInView}
                style={{
                    willChange: 'transform, opacity',
                    backfaceVisibility: 'hidden',
                    perspective: 1000
                }}
            >
                {children}
            </motion.div>
        );
    };

// Lazy loading component for images
export const LazyImage: React.FC<{
    src: string;
    alt: string;
    className?: string;
    placeholder?: string;
    onLoad?: () => void;
    onError?: () => void;
}> = ({ src, alt, className = '', placeholder, onLoad, onError }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        onError?.();
    };

    return (
        <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
            {!isLoaded && placeholder && (
                <div className="absolute inset-0 bg-slate-700/50 animate-pulse" />
            )}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`gpu-accelerated transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        } ${className}`}
                    loading="lazy"
                    decoding="async"
                />
            )}
        </div>
    );
};

// Virtual scrolling component for large lists
export const VirtualList: React.FC<{
    items: any[];
    itemHeight: number;
    containerHeight: number;
    renderItem: (item: any, index: number) => React.ReactNode;
    className?: string;
}> = ({ items, itemHeight, containerHeight, renderItem, className = '' }) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
        visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
    );

    const visibleItems = items.slice(visibleStart, visibleEnd);
    const totalHeight = items.length * itemHeight;
    const offsetY = visibleStart * itemHeight;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    return (
        <div
            ref={containerRef}
            className={`overflow-auto ${className}`}
            style={{ height: containerHeight }}
            onScroll={handleScroll}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div
                    style={{
                        transform: `translateY(${offsetY}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0
                    }}
                >
                    {visibleItems.map((item, index) =>
                        renderItem(item, visibleStart + index)
                    )}
                </div>
            </div>
        </div>
    );
};

// Debounced input component
export const DebouncedInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    delay?: number;
    type?: string;
}> = ({ value, onChange, placeholder, className = '', delay = 300, type = 'text' }) => {
    const [localValue, setLocalValue] = useState(value);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            onChange(localValue);
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [localValue, onChange, delay]);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <input
            type={type}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder={placeholder}
            className={`gpu-accelerated ${className}`}
        />
    );
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
    const [fps, setFps] = useState(60);
    const [frameTime, setFrameTime] = useState(16.67);

    useEffect(() => {
        let lastTime = performance.now();
        let frameCount = 0;
        let animationId: number;

        const measureFPS = (currentTime: number) => {
            frameCount++;

            if (currentTime - lastTime >= 1000) {
                const currentFPS = Math.round((frameCount * 1000) / (currentTime - lastTime));
                const currentFrameTime = (currentTime - lastTime) / frameCount;

                setFps(currentFPS);
                setFrameTime(currentFrameTime);

                frameCount = 0;
                lastTime = currentTime;
            }

            animationId = requestAnimationFrame(measureFPS);
        };

        animationId = requestAnimationFrame(measureFPS);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, []);

    return { fps, frameTime };
};

// Smooth scroll utility
export const smoothScrollTo = (element: HTMLElement | string, offset: number = 0) => {
    const target = typeof element === 'string'
        ? document.querySelector(element) as HTMLElement
        : element;

    if (target) {
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
};

// Intersection observer hook for animations
export const useIntersectionObserver = (
    threshold: number = 0.1,
    rootMargin: string = '0px'
) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            { threshold, rootMargin }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold, rootMargin]);

    return [ref, isIntersecting] as const;
};

// Throttle utility for scroll events
export const useThrottle = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T => {
    const lastRun = useRef(Date.now());

    return useRef((...args: Parameters<T>) => {
        if (Date.now() - lastRun.current >= delay) {
            callback(...args);
            lastRun.current = Date.now();
        }
    }).current as T;
};

// Memoized component wrapper
export const MemoizedComponent = React.memo<{
    children: React.ReactNode;
    className?: string;
}>(({ children, className = '' }) => (
    <div className={`gpu-accelerated ${className}`}>
        {children}
    </div>
));

MemoizedComponent.displayName = 'MemoizedComponent';

export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-slate-800/50 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-slate-700/50 animate-pulse h-full">
        <div className="flex items-start justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-700/50" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-700/50 rounded" />
              <div className="h-3 w-20 bg-slate-700/50 rounded" />
            </div>
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <div className="h-3 w-full bg-slate-700/50 rounded" />
          <div className="h-3 w-3/4 bg-slate-700/50 rounded" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-3 w-16 bg-slate-700/50 rounded" />
          <div className="h-3 w-16 bg-slate-700/50 rounded" />
          <div className="h-3 w-16 bg-slate-700/50 rounded" />
        </div>
      </div>
    ))}
  </>
);
