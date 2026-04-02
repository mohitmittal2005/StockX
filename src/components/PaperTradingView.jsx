import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStock } from '../StockContext';

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  }
};

const PaperTradingView = ({ onStockClick }) => {
  const { cashBalance, holdings, tradeLog, liveData } = useStock();
  const [ptTab, setPtTab] = useState('holdings');

  const investedValue = holdings.reduce((sum, h) => sum + (h.shares * (liveData[h.symbol]?.price || 0)), 0);

  return (
    <div id="paperTradingView" style={{ paddingTop: '1rem' }}>
      <div className="pt-view">
        <motion.div 
          className="section-header" 
          style={{ paddingInline: 0 }}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-title" style={{ fontSize: '1.6rem' }}>📝 Paper Trading</span>
          <span className="view-all" style={{ color: 'var(--muted)' }}>Reset Account</span>
        </motion.div>
        
        <motion.div 
          className="pt-wallet-card"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ borderColor: 'rgba(232, 0, 29, 0.4)', transition: { duration: 0.2 } }}
        >
          <motion.div 
            className="pt-wallet-label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Total Portfolio Value
          </motion.div>
          <motion.div 
            className="pt-wallet-balance"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            ${(cashBalance + investedValue).toLocaleString()}
          </motion.div>
          <motion.div 
            className="pt-wallet-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            <div className="pt-wallet-stat">
              <div className="pt-wallet-stat-label">Cash Balance</div>
              <div className="pt-wallet-stat-val">${cashBalance.toLocaleString()}</div>
            </div>
            <div className="pt-wallet-stat">
              <div className="pt-wallet-stat-label">Invested</div>
              <div className="pt-wallet-stat-val">${investedValue.toLocaleString()}</div>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="pt-tabs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <motion.button 
            className={`pt-tab-btn ${ptTab === 'holdings' ? 'active' : ''}`} 
            onClick={() => setPtTab('holdings')}
            whileTap={{ scale: 0.95 }}
          >
            Holdings
          </motion.button>
          <motion.button 
            className={`pt-tab-btn ${ptTab === 'trades' ? 'active' : ''}`} 
            onClick={() => setPtTab('trades')}
            whileTap={{ scale: 0.95 }}
          >
            Trade Log
          </motion.button>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {ptTab === 'holdings' && (
            <motion.div 
              id="ptHoldingsTab"
              key="holdings"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            >
              {holdings.length > 0 ? (
                holdings.map(h => (
                  <motion.div 
                    key={h.symbol} 
                    className="watch-item" 
                    onClick={() => onStockClick(h.symbol)}
                    variants={itemVariants}
                    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.04)', transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="watch-info">
                      <div className="watch-ticker">{h.symbol}</div>
                      <div className="watch-name">{h.shares} Shares</div>
                    </div>
                    <div className="watch-right">
                      <div className="watch-price">${(liveData[h.symbol]?.price || 0).toFixed(2)}</div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="search-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  No holdings yet. Start buying stocks to build your portfolio.
                </motion.div>
              )}
            </motion.div>
          )}
          {ptTab === 'trades' && (
            <motion.div 
              id="ptTradesTab"
              key="trades"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
            >
              {tradeLog.length > 0 ? (
                tradeLog.map((log, i) => (
                  <motion.div 
                    key={i} 
                    className="watch-item"
                    variants={itemVariants}
                    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.04)', transition: { duration: 0.15 } }}
                  >
                    <div className="watch-info">
                      <div className="watch-ticker">{log.type.toUpperCase()} {log.symbol}</div>
                      <div className="watch-name">{log.qty} shares @ ${log.price.toFixed(2)}</div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="search-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  No trades recorded yet. Your journey starts here!
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaperTradingView;
