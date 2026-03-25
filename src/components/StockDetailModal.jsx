import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStock } from '../StockContext';
import { getSimPrice, API_KEY_DEFAULT } from '../config';
import CandleChart from './CandleChart';
import { Star } from 'lucide-react';

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
      const token = apiKey || API_KEY_DEFAULT;
      const now = Math.floor(Date.now() / 1000);
      let res, from;
      switch (period) {
        case '1D':  res = '5'; from = now - 86400; break;
        case '1W':  res = '15'; from = now - 7 * 86400; break;
        case '1M':  res = '60'; from = now - 30 * 86400; break;
        case '3M':  res = 'D'; from = now - 90 * 86400; break;
        case '1Y':  res = 'W'; from = now - 365 * 86400; break;
        default: res = '5'; from = now - 86400; break;
      }
      try {
        const resp = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${res}&from=${from}&to=${now}&token=${token}`);
        const data = await resp.json();
        if (data.s === 'ok' && data.c && data.c.length > 0) setCandleData(data);
        else setCandleData(getStableCandles(symbol, period, stockInfo.price || getSimPrice(symbol)));
      } catch (e) {
        setCandleData(getStableCandles(symbol, period, stockInfo.price || getSimPrice(symbol)));
      }
      setIsLoading(false);
    };
    fetchCandles();
  }, [symbol, period, apiKey]);

  const handleBuy = () => {
    if (!canBuy) return;
    const success = buyStock(symbol, qty, currentPrice);
    setTradeMsg(success ? `Bought ${qty} shares!` : 'Insufficient balance!');
    setTimeout(() => setTradeMsg(''), 2500);
  };

  const handleSell = () => {
    if (!canSell) return;
    const success = sellStock(symbol, qty, currentPrice);
    setTradeMsg(success ? `Sold ${qty} shares!` : 'Insufficient shares!');
    setTimeout(() => setTradeMsg(''), 2500);
  };

  const formatVolume = (vol) => {
    if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M';
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K';
    return vol;
  };

  return (
    <div className="stock-detail-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="stock-detail-modal fade-in" style={{maxWidth:'600px'}}>
        <div className="sd-header">
          <div className="sd-header-left">
            <div className="sd-logo-box">
              <span style={{fontSize:'1.8rem'}}>{stockInfo.emoji || '📈'}</span>
            </div>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                 <div className="sd-ticker" style={{fontSize: '1.4rem', fontWeight: 900}}>{symbol}</div>
                 <button className={`sd-watchlist-btn ${isBookmarked ? 'active' : ''}`} onClick={() => toggleWatchlist(symbol)}>
                   <Star fill={isBookmarked ? "var(--red)" : "none"} stroke={isBookmarked ? "var(--red)" : "currentColor"} />
                 </button>
              </div>
              <div className="sd-name" style={{fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px'}}>{stockInfo.name}</div>
            </div>
          </div>
          <button className="sd-close" onClick={onClose}>✕</button>
        </div>

        <div className="sd-price-section" style={{marginTop: '1.5rem'}}>
          <div className="sd-current-price" style={{fontSize: '3.2rem', fontWeight: 900, letterSpacing:'-1.5px', color:'#fff'}}>${stockInfo.price.toFixed(2)}</div>
          <div className="sd-price-change" style={{display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px'}}>
            <span className={`sd-price-badge ${stockInfo.change >= 0 ? 'up' : 'dn'}`} style={{padding: '5px 12px', borderRadius: '10px', fontWeight:700, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'4px'}}>
              {stockInfo.change >= 0 ? '▲' : '▼'} ${Math.abs(stockInfo.price - (stockInfo.prevClose || stockInfo.price)).toFixed(2)} ({Math.abs(stockInfo.change).toFixed(2)}%)
            </span>
            <span className="sd-live-indicator" style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'0.75rem', fontWeight:800, color:'#22c55e', background:'rgba(34,197,94,0.1)', padding:'5px 12px', borderRadius:'10px'}}>
               <span className="live-dot" style={{width:'8px', height:'8px', background:'#22c55e', borderRadius:'50%', boxShadow:'0 0 10px #22c55e'}}></span> LIVE
            </span>
          </div>
        </div>

        <div className="sd-period-tabs" style={{marginTop: '2rem', display:'flex', gap:'8px', justifyContent:'center'}}>
          {['1D', '1W', '1M', '3M', '1Y'].map(p => (
            <button key={p} className={`sd-period-pills ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>

        <div className="sd-chart-container" style={{height: '350px', marginTop: '1rem', background:'rgba(0,0,0,0.2)', borderRadius:'24px', padding:'1.2rem', border:'1px solid rgba(255,255,255,0.03)'}}>
          {isLoading ? (<div className="search-spinner" style={{margin:'150px auto'}}></div>) : ( candleData && <CandleChart data={candleData} period={period} /> )}
        </div>

        <div className="sd-stats-grid" style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'0.6rem', marginTop:'1.2rem'}}>
           <div className="sd-stat-card"><span className="sd-stat-label">Open</span><span className="sd-stat-val">${stockInfo.open?.toFixed(2) || '—'}</span></div>
           <div className="sd-stat-card"><span className="sd-stat-label">High</span><span className="sd-stat-val">${stockInfo.high?.toFixed(2) || '—'}</span></div>
           <div className="sd-stat-card"><span className="sd-stat-label">Low</span><span className="sd-stat-val">${stockInfo.low?.toFixed(2) || '—'}</span></div>
           <div className="sd-stat-card"><span className="sd-stat-label">Prev Close</span><span className="sd-stat-val">${stockInfo.prevClose?.toFixed(2) || '—'}</span></div>
        </div>

        <div className="sd-volume-section" style={{marginTop: '1.2rem', padding:'0 10px'}}>
           <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--muted)', fontWeight:700, marginBottom:'6px'}}>
              <span>VOLUME</span><span>{formatVolume(stockInfo.volume || 1200000)}</span>
           </div>
           <div className="sd-volume-track" style={{height:'7px', background:'rgba(255,255,255,0.06)', borderRadius:'10px', overflow:'hidden'}}><div className="sd-volume-fill" style={{width: '65%', height:'100%', background:'linear-gradient(90deg, #ff2d46, #e8001d)', borderRadius:'10px'}}></div>
           </div>
        </div>

        <div className="sd-trade-section" style={{marginTop: '2rem', padding: '1.5rem', background:'rgba(255,255,255,0.03)', borderRadius:'24px', border:'1px solid rgba(255,255,255,0.05)'}}>
           <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                 <span style={{fontSize:'1.1rem', fontWeight:800}}>📝 PAPER TRADE</span>
                 <span style={{fontSize:'0.7rem', fontWeight:900, background:'rgba(232,0,29,0.15)', color:'var(--red)', padding:'3px 10px', borderRadius:'6px'}}>VIRTUAL</span>
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
                   <button key={v} onClick={() => setQtyInput(v.toString())} className={qty === v ? 'active' : ''} style={{padding:'8px 12px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#fff', fontWeight:700}}>{v}</button>
                 ))}
              </div>
           </div>
           
           <div className="sd-total-row" style={{display:'flex', justifyContent:'space-between', fontSize:'1.2rem', fontWeight:900, marginBottom:'1.8rem', color:'#fff'}}>
              <span style={{opacity:0.6, fontSize:'0.95rem'}}>Total Cost</span>
              <span style={{color: canBuy ? '#fff' : 'var(--red)'}}>${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
           </div>

           <div className="sd-trade-btns" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
              <button 
                className="sd-btn-buy" onClick={handleBuy} disabled={!canBuy}
                style={!canBuy ? { opacity: 0.3, cursor: 'not-allowed', filter: 'grayscale(1)' } : {}}
              > ▲ BUY </button>
              <button 
                className="sd-btn-sell" onClick={handleSell} disabled={!canSell}
                style={!canSell ? { opacity: 0.3, cursor: 'not-allowed', filter: 'grayscale(1)' } : {}}
              > ▼ SELL </button>
           </div>
           {tradeMsg && <div style={{textAlign:'center', marginTop:'1.5rem', color: tradeMsg.includes('Bought') || tradeMsg.includes('Sold') ? '#22c55e' : 'var(--red)', fontWeight:800}}>{tradeMsg}</div>}
        </div>
      </div>
    </div>
  );
};

export default StockDetailModal;
