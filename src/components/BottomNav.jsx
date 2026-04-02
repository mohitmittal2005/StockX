import React from 'react';
import { motion } from 'framer-motion';
import { Home, BarChart2, Star, User, Search } from 'lucide-react';

const navItems = [
  { key: 'homeView', icon: Home, label: 'Home' },
  { key: 'paperTradingView', icon: BarChart2, label: 'Trade' },
  { key: '__search__', icon: Search, label: '' },
  { key: 'watchlistView', icon: Star, label: 'Watchlist' },
  { key: 'profileView', icon: User, label: 'Profile' },
];

const BottomNav = ({ activeNav, onNav, onOpenSearch }) => {
  return (
    <motion.div 
      className="bottom-nav"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {navItems.map((item, i) => {
        if (item.key === '__search__') {
          return (
            <motion.div 
              key="search-center"
              className="nav-center" 
              onClick={onOpenSearch}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88, rotate: -10 }}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 15 }}
            >
              <div className="nav-center-inner">
                <Search size={28} />
              </div>
            </motion.div>
          );
        }
        
        const Icon = item.icon;
        const isActive = activeNav === item.key;
        
        return (
          <motion.div
            key={item.key}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onNav(item.key)}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.06, duration: 0.4 }}
          >
            <motion.div
              animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={isActive ? { duration: 0.3 } : {}}
            >
              <Icon />
            </motion.div>
            <span>{item.label}</span>
            {isActive && (
              <motion.div
                className="nav-active-indicator"
                layoutId="navIndicator"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default BottomNav;
