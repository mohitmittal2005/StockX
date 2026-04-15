import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStock } from '../StockContext';
import { WATCHLIST_DEFAULT } from '../config';
import GainsChart from './GainsChart';
import MiniChart from './MiniChart';
import Sparkline from './Sparkline';

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

const watchItemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  }
};

const Dashboard = ({ onStockClick, onOpenSearch }) => {
  const { liveData, holdings, isLive } = useStock();
  const [period, setPeriod] = useState('1W');

  // Invested value calculation
  const totalInvestedValue = useMemo(() => {
    return holdings.reduce((sum, h) => sum + (h.shares * (liveData[h.symbol]?.price || 0)), 0);
  }, [holdings, liveData]);
  
  const totalPrevInvestedValue = useMemo(() => {
     return holdings.reduce((sum, h) => {
        const d = liveData[h.symbol] || { price: 0, change: 0 };
        const prev = d.prevClose || (d.price / (1 + (d.change / 100)));
        return sum + (prev * h.shares);
     }, 0);
  }, [holdings, liveData]);

  const totalChange = totalInvestedValue - totalPrevInvestedValue;
  const totalChangePct = totalPrevInvestedValue !== 0 ? ((totalChange / totalPrevInvestedValue) * 100).toFixed(2) : '0.00';

  return (
    <div id="homeView">
      <div className="dashboard-layout">
        <div className="dash-main">
          {/* Gains Card */}
          <motion.div 
            className="gains-card"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="gains-top">
              <div>
                <motion.div 
                  className="gains-label"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  Portfolio Value
                </motion.div>
                <motion.div 
                  className="gains-amount" 
                  id="totalValue"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  ${totalInvestedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </motion.div>
                <motion.div 
                  className={`gains-change ${totalChange >= 0 ? 'up' : 'dn'}`}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  {totalChange >= 0 ? '+' : ''}${Math.abs(totalChange).toFixed(2)} ({totalChange >= 0 ? '+' : ''}{totalChangePct}%) today
                </motion.div>
              </div>
              {/* Period indicator (Now hidden via CSS as per user request, but keeping the state for chart) */}
              <div className="gains-period" style={{display: 'none'}}>
                <span id="periodLabel">{period}</span>
              </div>
            </div>
            <motion.div 
              className="chart-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <GainsChart period={period} />
            </motion.div>
          </motion.div>

          <motion.div 
            className="period-tabs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {['1D', '1W', '1M', '3M', '1Y'].map(p => (
              <motion.button 
                key={p} 
                className={`period-tab ${p === period ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                layout
              >
                {p}
                {p === period && (
                  <motion.div
                    className="period-tab-glow"
                    layoutId="periodGlow"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Portfolio Section */}
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <span className="section-title">Portfolio</span>
            <span className="view-all">View all ›</span>
          </motion.div>
          <motion.div 
            className="portfolio-scroll"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {holdings.length > 0 ? (
              holdings.map((h, idx) => {
                const data = liveData[h.symbol] || { price: 0, change: 0 };
                const isUp = data.change >= 0;
                return (
                  <motion.div 
                    key={h.symbol} 
                    className={`port-card ${idx === 0 ? 'active-card' : ''}`} 
                    onClick={() => onStockClick(h.symbol)}
                    variants={itemVariants}
                    whileHover={{ y: -6, scale: 1.03, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="port-card-top">
                      <motion.div 
                        className="port-logo" 
                        style={{background:`${h.color || '#555'}22`, borderColor:`${h.color || '#555'}44`}}
                        whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
                      >
                        <span style={{fontSize:'1.3rem'}}>{h.emoji}</span>
                      </motion.div>
                      <MiniChart symbol={h.symbol} isUp={isUp} />
                    </div>
                    <div className="port-ticker">{h.symbol}</div>
                    <div className="port-name">{h.name || h.symbol}</div>
                    <div className="port-price" id={`pp-${h.symbol}`}>${data.price.toFixed(2)}</div>
                    <div className={`port-change ${isUp ? 'up' : 'dn'}`} id={`pc-${h.symbol}`}>
                      {isUp ? '▲' : '▼'} {Math.abs(data.change).toFixed(2)}%
                    </div>
                  </motion.div>
                );
              })
            ) : (
                <motion.div 
                  className="port-card" 
                  style={{opacity: 0.6, cursor: 'default'}}
                  variants={itemVariants}
                >
                  <div className="port-info" style={{padding: '1rem'}}>Empty Portfolio</div>
                </motion.div>
            )}
          </motion.div>

          {/* Market Indices (Fills gap below portfolio) */}
          <motion.div 
            className="section-header"
            style={{ marginTop: '2.5rem' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <span className="section-title">Market Indices</span>
          </motion.div>
          
          <motion.div 
            className="indices-grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {[
              { name: 'S&P 500', price: '5,087.03', change: '+0.03%', isUp: true },
              { name: 'NASDAQ', price: '15,996.82', change: '-0.28%', isUp: false },
              { name: 'Dow Jones', price: '39,131.53', change: '+0.16%', isUp: true }
            ].map((idx, i) => (
              <motion.div 
                key={idx.name}
                className="index-card"
                variants={itemVariants}
                whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="index-name">{idx.name}</div>
                <div className="index-price">{idx.price}</div>
                <div className={`index-change ${idx.isUp ? 'up' : 'dn'}`}>
                  {idx.isUp ? '▲' : '▼'} {idx.change}
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>

        <div className="dash-side">
          {!isLive && (
            <motion.div 
              className="api-nudge"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(232, 0, 29, 0.5)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="api-nudge-text">Showing simulated data. Add API key for live prices.</div>
            </motion.div>
          )}

          {/* Watchlist Section */}
          <motion.div 
            className="section-header" 
            style={{ paddingTop: '0.4rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="section-title">Popular Stocks</span>
            <span className="view-all" onClick={onOpenSearch}>›</span>
          </motion.div>
          <motion.div 
            className="watchlist"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
             {WATCHLIST_DEFAULT.map((item, idx) => {
                const data = liveData[item.symbol] || { price: 0, change: 0 };
                const isUp = data.change >= 0;
                return (
                  <motion.div 
                    key={item.symbol} 
                    className="watch-item" 
                    onClick={() => onStockClick(item.symbol)}
                    variants={watchItemVariants}
                    whileHover={{ x: 6, backgroundColor: 'rgba(255,255,255,0.04)', transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div 
                      className="watch-logo" 
                      style={{background:`${item.color}22`, borderColor:`${item.color}44`, width:'48px', height:'48px'}}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      <span style={{fontSize:'1.3rem'}}>{item.emoji}</span>
                    </motion.div>
                    <div className="watch-info">
                       <div className="watch-ticker" style={{fontSize:'1.05rem', fontWeight:'700'}}>{item.symbol}</div>
                       <div className="watch-name" style={{fontSize:'0.85rem'}}>{item.name}</div>
                    </div>
                    <Sparkline symbol={item.symbol} isUp={isUp} width={90} />
                    <div className="watch-right" style={{minWidth:'90px'}}>
                       <div className="watch-price" style={{fontSize:'1rem', fontWeight:'700'}}>${data.price.toFixed(2)}</div>
                       <div className={`watch-change ${isUp ? 'up' : 'dn'}`} style={{fontSize:'0.85rem', fontWeight:'600'}}>
                          {isUp ? '▲' : '▼'} {Math.abs(data.change).toFixed(2)}%
                       </div>
                    </div>
                  </motion.div>
                );
             })}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
