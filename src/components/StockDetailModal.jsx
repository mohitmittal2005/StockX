import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStock } from '../StockContext';
import { getSimPrice } from '../config';
import { api } from '../api';
import CandleChart from './CandleChart';
import { Star } from 'lucide-react';

const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const panelVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.92 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0, y: 40, scale: 0.95,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
};

const statVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.9 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: 0.3 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  })
};

const StockDetailModal = ({ symbol, onClose }) => {
  const { liveData, cashBalance, buyStock, sellStock, holdingsHash, apiKey, watchlist, toggleWatchlist } = useStock();
  const [period, setPeriod] = useState('1D');
  const [candleData, setCandleData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qtyInput, setQtyInput] = useState(''); // Empty by default per user request
  const [tradeMsg, setTradeMsg] = useState('');

  const stockInfo = useMemo(() => {
    return liveData[symbol] || { price: 0, change: 0, name: symbol, emoji: '📈', open: 0, high: 0, low: 0, prevClose: 0, volume: 0 };
  }, [liveData, symbol]);

  const holding = holdingsHash[symbol] || { qty: 0, avgPrice: 0 };
  const isBookmarked = watchlist.includes(symbol);
  
  const currentPrice = stockInfo.price || getSimPrice(symbol);
  const qty = parseInt(qtyInput) || 0;
  const totalCost = currentPrice * qty;
  const canBuy = qty > 0 && totalCost <= cashBalance;
  const canSell = qty > 0 && holding.qty >= qty;

  // Simulation seeding logic (Stability fix)
  const getStableCandles = (sym, per, basePrice) => {
    const seed = sym.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + per.length;
    let n = 42;
    let step = 300;
    const now = Math.floor(Date.now() / 1000);
    const o = [], h = [], l = [], c = [], v = [], t = [];
    let curPrice = (basePrice > 0 ? basePrice : getSimPrice(sym)) * 0.96;
    const seededRandom = (s) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
    };
    for (let i = 0; i < n; i++) {
        let open = curPrice;
        let rng = seededRandom(seed + i);
        let change = (rng - 0.45) * (open * 0.015);
        let close = open + change;
        let high = Math.max(open, close) + (seededRandom(seed * 2 + i) * (open * 0.005));
        let low = Math.min(open, close) - (seededRandom(seed * 3 + i) * (open * 0.005));
        o.push(open); c.push(close); h.push(high); l.push(low);
        v.push(Math.floor(seededRandom(seed + i) * 1000000));
        t.push(now - (n - i) * step);
        curPrice = close;
    }
    return { o, h, l, c, v, t, s: 'ok' };
  };

  useEffect(() => {
    const fetchCandles = async () => {
      setIsLoading(true);
      try {
        const data = await api.getCandles(symbol, period, apiKey);
        if (data.s === 'ok' && data.c && data.c.length > 0) setCandleData(data);
        else setCandleData(getStableCandles(symbol, period, stockInfo.price || getSimPrice(symbol)));
      } catch (e) {
        setCandleData(getStableCandles(symbol, period, stockInfo.price || getSimPrice(symbol)));
      }
      setIsLoading(false);
    };
    fetchCandles();
  }, [symbol, period, apiKey]);

  const handleBuy = async () => {
    if (!canBuy) return;
    const success = await buyStock(symbol, qty, currentPrice);
    setTradeMsg(success ? `Bought ${qty} shares!` : 'Insufficient balance!');
    setTimeout(() => setTradeMsg(''), 2500);
  };

  const handleSell = async () => {
    if (!canSell) return;
    const success = await sellStock(symbol, qty, currentPrice);
    setTradeMsg(success ? `Sold ${qty} shares!` : 'Insufficient shares!');
    setTimeout(() => setTradeMsg(''), 2500);
  };

  const formatVolume = (vol) => {
    if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M';
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K';
    return vol;
  };

  return (
    <motion.div 
      className="stock-detail-overlay open" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ opacity: 1 }}
    >
      <motion.div 
        className="stock-detail-modal" 
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ maxWidth: '600px', transform: 'none' }}
      >
        <div className="sd-header">
          <div className="sd-header-left">
            <motion.div 
              className="sd-logo-box"
              initial={{ opacity: 0, scale: 0, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 350, damping: 18 }}
            >
              <span style={{fontSize:'1.8rem'}}>{stockInfo.emoji || '📈'}</span>
            </motion.div>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                 <motion.div 
                   className="sd-ticker" 
                   style={{fontSize: '1.4rem', fontWeight: 900}}
                   initial={{ opacity: 0, x: -15 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.2, duration: 0.4 }}
                 >
                   {symbol}
                 </motion.div>
                 <motion.button 
                   className={`sd-watchlist-btn ${isBookmarked ? 'active' : ''}`} 
                   onClick={() => toggleWatchlist(symbol)}
                   whileHover={{ scale: 1.15 }}
                   whileTap={{ scale: 0.85, rotate: isBookmarked ? -20 : 20 }}
                   initial={{ opacity: 0, scale: 0 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.35, type: 'spring', stiffness: 400, damping: 15 }}
                 >
                   <Star fill={isBookmarked ? "var(--red)" : "none"} stroke={isBookmarked ? "var(--red)" : "currentColor"} />
                 </motion.button>
              </div>
              <motion.div 
                className="sd-name" 
                style={{fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px'}}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {stockInfo.name}
              </motion.div>
            </div>
          </div>
          <motion.button 
            className="sd-close" 
            onClick={onClose}
            whileHover={{ scale: 1.12, backgroundColor: 'var(--red)', color: '#fff', borderColor: 'var(--red)' }}
            whileTap={{ scale: 0.88, rotate: 90 }}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
          >
            ✕
          </motion.button>
        </div>

        <motion.div 
          className="sd-price-section" 
          style={{marginTop: '1.5rem'}}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div 
            className="sd-current-price" 
            style={{fontSize: '3.2rem', fontWeight: 900, letterSpacing:'-1.5px', color:'#fff'}}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            ${stockInfo.price.toFixed(2)}
          </motion.div>
          <motion.div 
            className="sd-price-change" 
            style={{display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px'}}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <span className={`sd-price-badge ${stockInfo.change >= 0 ? 'up' : 'dn'}`} style={{padding: '5px 12px', borderRadius: '10px', fontWeight:700, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'4px'}}>
              {stockInfo.change >= 0 ? '▲' : '▼'} ${Math.abs(stockInfo.price - (stockInfo.prevClose || stockInfo.price)).toFixed(2)} ({Math.abs(stockInfo.change).toFixed(2)}%)
            </span>
            <span className="sd-live-indicator" style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'0.75rem', fontWeight:800, color:'#22c55e', background:'rgba(34,197,94,0.1)', padding:'5px 12px', borderRadius:'10px'}}>
               <span className="live-dot" style={{width:'8px', height:'8px', background:'#22c55e', borderRadius:'50%', boxShadow:'0 0 10px #22c55e'}}></span> LIVE
            </span>
          </motion.div>
        </motion.div>

        <motion.div 
          className="sd-period-tabs" 
          style={{marginTop: '2rem', display:'flex', gap:'8px', justifyContent:'center'}}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          {['1D', '1W', '1M', '3M', '1Y'].map(p => (
            <motion.button 
              key={p} 
              className={`sd-period-pills ${period === p ? 'active' : ''}`} 
              onClick={() => setPeriod(p)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
            >
              {p}
            </motion.button>
          ))}
        </motion.div>

        <motion.div 
          className="sd-chart-container" 
          style={{height: '350px', marginTop: '1rem', background:'rgba(0,0,0,0.2)', borderRadius:'24px', padding:'1.2rem', border:'1px solid rgba(255,255,255,0.03)'}}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loader"
                className="search-spinner" 
                style={{margin:'150px auto'}}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              />
            ) : (
              candleData && (
                <motion.div
                  key={period}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ height: '100%' }}
                >
                  <CandleChart data={candleData} period={period} />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>

        <div className="sd-stats-grid" style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'0.6rem', marginTop:'1.2rem'}}>
           {[
             { label: 'Open', value: stockInfo.open },
             { label: 'High', value: stockInfo.high },
             { label: 'Low', value: stockInfo.low },
             { label: 'Prev Close', value: stockInfo.prevClose },
           ].map((stat, i) => (
             <motion.div 
               key={stat.label}
               className="sd-stat-card"
               custom={i}
               variants={statVariants}
               initial="hidden"
               animate="visible"
               whileHover={{ scale: 1.05, borderColor: 'rgba(232,0,29,0.25)', transition: { duration: 0.15 } }}
             >
               <span className="sd-stat-label">{stat.label}</span>
               <span className="sd-stat-val">${stat.value?.toFixed(2) || '—'}</span>
             </motion.div>
           ))}
        </div>

        <motion.div 
          className="sd-volume-section" 
          style={{marginTop: '1.2rem', padding:'0 10px'}}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
           <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--muted)', fontWeight:700, marginBottom:'6px'}}>
              <span>VOLUME</span><span>{formatVolume(stockInfo.volume || 1200000)}</span>
           </div>
           <div className="sd-volume-track" style={{height:'7px', background:'rgba(255,255,255,0.06)', borderRadius:'10px', overflow:'hidden'}}>
             <motion.div 
               className="sd-volume-fill" 
               style={{height:'100%', background:'linear-gradient(90deg, #ff2d46, #e8001d)', borderRadius:'10px'}}
               initial={{ width: '0%' }}
               animate={{ width: '65%' }}
               transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
             />
           </div>
        </motion.div>

        <motion.div 
          className="sd-trade-section" 
          style={{marginTop: '2rem', padding: '1.5rem', background:'rgba(255,255,255,0.03)', borderRadius:'24px', border:'1px solid rgba(255,255,255,0.05)'}}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
           <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                 <span style={{fontSize:'1.1rem', fontWeight:800}}>📝 PAPER TRADE</span>
                 <motion.span 
                   style={{fontSize:'0.7rem', fontWeight:900, background:'rgba(232,0,29,0.15)', color:'var(--red)', padding:'3px 10px', borderRadius:'6px'}}
                   animate={{ opacity: [1, 0.6, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                 >
                   VIRTUAL
                 </motion.span>
              </div>
              <div style={{fontSize:'0.85rem', color:'var(--muted)'}}>Limit: <b style={{color:'#fff'}}>${cashBalance.toLocaleString()}</b></div>
           </div>
           
           <div style={{display:'flex', gap:'20px', fontSize:'0.85rem', marginBottom:'1.2rem', padding:'10px 15px', background:'rgba(255,255,255,0.02)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.05)'}}>
              <span style={{color: holding.qty > 0 ? 'var(--green)' : 'var(--muted)'}}>Owned: <b style={{color:'#fff'}}>{holding.qty} shares</b></span>
              <span style={{color:'var(--muted)'}}>Avg Cost: <b style={{color:'#fff'}}>${holding.avgPrice.toFixed(2)}</b></span>
           </div>

           <div className="sd-qty-row" style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'1.8rem'}}>
              <span style={{fontSize:'0.9rem', fontWeight:700, color:'var(--muted)'}}>QTY</span>
              <input 
                 type="number" 
                 className="sd-qty-input-large" 
                 value={qtyInput} 
                 placeholder="0"
                 onChange={(e) => setQtyInput(e.target.value)} 
              />
              <div className="sd-qty-pills">
                 {[1, 5, 10, 25].map(v => (
                   <motion.button 
                     key={v} 
                     onClick={() => setQtyInput(v.toString())} 
                     className={qty === v ? 'active' : ''} 
                     style={{padding:'8px 12px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#fff', fontWeight:700}}
                     whileHover={{ scale: 1.1, borderColor: 'var(--red)' }}
                     whileTap={{ scale: 0.9 }}
                   >
                     {v}
                   </motion.button>
                 ))}
              </div>
           </div>
           
           <motion.div 
             className="sd-total-row" 
             style={{display:'flex', justifyContent:'space-between', fontSize:'1.2rem', fontWeight:900, marginBottom:'1.8rem', color:'#fff'}}
             animate={{ color: canBuy ? '#fff' : 'var(--red)' }}
           >
              <span style={{opacity:0.6, fontSize:'0.95rem'}}>Total Cost</span>
              <span style={{color: canBuy ? '#fff' : 'var(--red)'}}>${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
           </motion.div>

           <div className="sd-trade-btns" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
              <motion.button 
                className="sd-btn-buy" 
                onClick={handleBuy} 
                disabled={!canBuy}
                style={!canBuy ? { opacity: 0.3, cursor: 'not-allowed', filter: 'grayscale(1)' } : {}}
                whileHover={canBuy ? { scale: 1.04, y: -2, boxShadow: '0 12px 35px rgba(34, 197, 94, 0.45)' } : {}}
                whileTap={canBuy ? { scale: 0.96 } : {}}
              >
                ▲ BUY
              </motion.button>
              <motion.button 
                className="sd-btn-sell" 
                onClick={handleSell} 
                disabled={!canSell}
                style={!canSell ? { opacity: 0.3, cursor: 'not-allowed', filter: 'grayscale(1)' } : {}}
                whileHover={canSell ? { scale: 1.04, y: -2, boxShadow: '0 12px 35px rgba(232, 0, 29, 0.45)' } : {}}
                whileTap={canSell ? { scale: 0.96 } : {}}
              >
                ▼ SELL
              </motion.button>
           </div>
           <AnimatePresence>
             {tradeMsg && (
               <motion.div 
                 style={{textAlign:'center', marginTop:'1.5rem', color: tradeMsg.includes('Bought') || tradeMsg.includes('Sold') ? '#22c55e' : 'var(--red)', fontWeight:800}}
                 initial={{ opacity: 0, y: 10, scale: 0.9 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ type: 'spring', stiffness: 400, damping: 20 }}
               >
                 {tradeMsg}
               </motion.div>
             )}
           </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StockDetailModal;
