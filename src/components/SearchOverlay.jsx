import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const searchBoxVariants = {
  hidden: { opacity: 0, y: -30, scale: 0.95 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0, y: -20, scale: 0.95,
    transition: { duration: 0.25 }
  }
};

const resultVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  })
};

const SearchOverlay = ({ isOpen, onClose, searchQuery, onSearchQueryChange, searchResults, onStockClick }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="search-overlay open"
          onClick={onClose}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          style={{ opacity: 1 }}
        >
          <motion.div 
            className="search-box" 
            onClick={e => e.stopPropagation()}
            variants={searchBoxVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transform: 'none' }}
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              className="search-input" 
              value={searchQuery} 
              onChange={e => onSearchQueryChange(e.target.value)} 
              placeholder="Search stocks — AAPL, TSLA, MSFT…" 
              autoFocus 
            />
            <motion.button 
              className="search-close" 
              onClick={onClose}
              whileHover={{ scale: 1.15, backgroundColor: 'var(--red)', color: '#fff' }}
              whileTap={{ scale: 0.85, rotate: 90 }}
            >
              ✕
            </motion.button>
          </motion.div>
          <div className="search-results" onClick={e => e.stopPropagation()}>
            <AnimatePresence mode="popLayout">
              {searchResults.length > 0 ? (
                searchResults.map((s, i) => (
                  <motion.div 
                    key={s.symbol} 
                    className="search-result-item" 
                    onClick={() => onStockClick(s.symbol)}
                    custom={i}
                    variants={resultVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                    layout
                    whileHover={{ x: 6, borderColor: 'rgba(232, 0, 29, 0.4)', backgroundColor: 'rgba(232, 0, 29, 0.05)', transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.div 
                      className="sr-emoji"
                      whileHover={{ rotate: [0, -12, 12, 0], transition: { duration: 0.35 } }}
                    >
                      {s.emoji}
                    </motion.div>
                    <div className="sr-info">
                      <div className="sr-ticker">{s.symbol}</div>
                      <div className="sr-name">{s.name}</div>
                    </div>
                  </motion.div>
                ))
              ) : (
                searchQuery && (
                  <motion.div 
                    className="search-hint"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    No stocks found for "{searchQuery}"
                  </motion.div>
                )
              )}
            </AnimatePresence>
            {!searchQuery && (
              <motion.div 
                className="search-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                Type a ticker or company name to search
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
