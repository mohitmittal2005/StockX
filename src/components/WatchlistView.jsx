import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStock } from '../StockContext';
import { STOCK_DB } from '../config';
import Sparkline from './Sparkline';
import { Star, Trash2 } from 'lucide-react';

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0, x: -60, scale: 0.9,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
};

const WatchlistView = ({ onStockClick }) => {
  const { watchlist, liveData, toggleWatchlist } = useStock();

  const watchlistItems = watchlist.map(symbol => {
    const dbInfo = STOCK_DB.find(s => s.symbol === symbol) || { name: symbol, emoji: '📈' };
    const live = liveData[symbol] || { price: 0, change: 0 };
    return { symbol, ...dbInfo, ...live };
  });

  return (
    <div className="view-container">
      <div className="view-header">
        <motion.h1 
          className="view-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          My Watchlist
        </motion.h1>
        <motion.p 
          className="view-subtitle"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Track your favorite stocks
        </motion.p>
      </div>

      <motion.div 
        className="watchlist-list" 
        style={{marginTop: '1.5rem'}}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {watchlistItems.length > 0 ? (
            watchlistItems.map((item, idx) => (
              <motion.div 
                key={item.symbol} 
                className="watch-page-item"
                variants={itemVariants}
                exit="exit"
                layout
                onClick={() => onStockClick(item.symbol)}
                whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="watch-logo" 
                  style={{background: 'rgba(255,255,255,0.04)', borderRadius:'14px'}}
                  whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
                >
                  <span style={{fontSize:'1.3rem'}}>{item.emoji}</span>
                </motion.div>
                <div className="watch-info">
                  <div className="watch-ticker" style={{fontSize:'1.1rem', fontWeight:800}}>{item.symbol}</div>
                  <div className="watch-name" style={{fontSize:'0.85rem', color:'var(--muted)'}}>{item.name}</div>
                </div>
                <div style={{height:'40px', width:'80px'}}>
                   <Sparkline symbol={item.symbol} isUp={item.change >= 0} />
                </div>
                <div className="watch-right" style={{textAlign:'right', minWidth:'80px'}}>
                  <div className="watch-price" style={{fontSize:'1rem', fontWeight:800}}>${item.price.toFixed(2)}</div>
                  <div className={`watch-change ${item.change >= 0 ? 'up' : 'dn'}`} style={{fontSize:'0.85rem', fontWeight:700}}>
                     {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                  </div>
                </div>
                <motion.button 
                  className="watch-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWatchlist(item.symbol);
                  }}
                  whileHover={{ scale: 1.15, backgroundColor: '#ff2d46', color: '#fff' }}
                  whileTap={{ scale: 0.85 }}
                >
                  <Trash2 size={18} />
                </motion.button>
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="empty-state" 
              style={{marginTop:'4rem', textAlign:'center', opacity:0.5}}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                style={{fontSize:'3rem', marginBottom:'1rem'}}
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                ⭐
              </motion.div>
              <h3>Your Watchlist is Empty</h3>
              <p>Bookmark stocks from the search or detail view to see them here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default WatchlistView;
