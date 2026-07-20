import React from 'react';
import { motion } from 'framer-motion';

const rarityConfig: Record<string, { border: string; glow: string }> = {
    common: { border: 'border-slate-500/50', glow: 'shadow-slate-500/20' },
    rare: { border: 'border-blue-500/50', glow: 'shadow-blue-500/30' },
    epic: { border: 'border-purple-500/50', glow: 'shadow-purple-500/30' },
    legendary: { border: 'border-amber-400/50', glow: 'shadow-amber-400/40' },
};

interface EquippedBadgeProps {
    icon: string;
    rarity?: string;
    size?: 'sm' | 'xs';
}

const EquippedBadge: React.FC<EquippedBadgeProps> = ({ icon, rarity = 'common', size = 'sm' }) => {
    const rc = rarityConfig[rarity] || rarityConfig.common;
    const dim = size === 'xs' ? 'w-4 h-4 text-[8px]' : 'w-5 h-5 text-[10px]';

    return (
        <motion.span
            className={`inline-flex items-center justify-center ${dim} rounded-full bg-slate-800 border ${rc.border} ${rc.glow} shadow-sm flex-shrink-0`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            title="Equipped badge"
        >
            {icon}
        </motion.span>
    );
};

export default EquippedBadge;
