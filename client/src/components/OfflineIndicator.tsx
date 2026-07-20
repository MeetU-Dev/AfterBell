import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiWifi, FiWifiOff } from 'react-icons/fi';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const goOnline = () => { setIsOnline(true); setShow(true); setTimeout(() => setShow(false), 3000); };
    const goOffline = () => { setIsOnline(false); setShow(true); };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    if (!navigator.onLine) setShow(true);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-5 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 ${
            isOnline
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {isOnline ? (
            <><FiWifi className="w-4 h-4" /> Back online</>
          ) : (
            <><FiWifiOff className="w-4 h-4" /> You are offline</>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
