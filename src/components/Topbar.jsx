import React from 'react';
import { motion } from 'framer-motion';
import { useStock } from '../StockContext';

const Topbar = ({ onNav }) => {
  const { isLive } = useStock();

  return (
    <motion.div 
      className="topbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="topbar-left">
        <motion.div 
          className="greeting"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          Hi there,
        </motion.div>
        <motion.div 
          className="username"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          Welcome to <span className="brand-glow">StockX</span> 
          {isLive && (
            <motion.span 
              id="liveBadge" 
              className="live-badge" 
              style={{ display: 'inline-flex' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 15 }}
            >
              <span className="live-dot"></span>LIVE
            </motion.span>
          )}
        </motion.div>
      </div>
      <div className="topbar-right">
        <motion.div 
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => onNav('paperTradingView')} 
          title="Paper Trading"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 15 }}
        >
          <div className="icon-btn pt-btn">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="pt-badge">PAPER</span>
        </motion.div>
        <motion.div 
          className="icon-btn" 
          title="Notifications" 
          onClick={() => onNav('profileView')}
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 15 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div className="bell-dot"></div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Topbar;
