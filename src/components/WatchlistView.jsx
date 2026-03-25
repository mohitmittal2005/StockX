import React from 'react';
import { useStock } from '../StockContext';
import { STOCK_DB } from '../config';
import Sparkline from './Sparkline';
import { Star, Trash2 } from 'lucide-react';

const WatchlistView = ({ onStockClick }) => {
  const { watchlist, liveData, toggleWatchlist } = useStock();

  const watchlistItems = watchlist.map(symbol => {
    const dbInfo = STOCK_DB.find(s => s.symbol === symbol) || { name: symbol, emoji: '📈' };
    const live = liveData[symbol] || { price: 0, change: 0 };
    return { symbol, ...dbInfo, ...live };
  });

  return (
    <div className="view-container fade-in">
      <div className="view-header">
        <h1 className="view-title">My Watchlist</h1>
        <p className="view-subtitle">Track your favorite stocks</p>
      </div>

      <div className="watchlist-list" style={{marginTop: '1.5rem'}}>
        {watchlistItems.length > 0 ? (
          watchlistItems.map((item, idx) => (
            <div 
              key={item.symbol} 
              className="watch-page-item slide-up" 
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => onStockClick(item.symbol)}
            >
              <div className="watch-logo" style={{background: 'rgba(255,255,255,0.04)', borderRadius:'14px'}}>
                <span style={{fontSize:'1.3rem'}}>{item.emoji}</span>
              </div>
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
              <button 
                className="watch-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(item.symbol);
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{marginTop:'4rem', textAlign:'center', opacity:0.5}}>
            <div style={{fontSize:'3rem', marginBottom:'1rem'}}>⭐</div>
            <h3>Your Watchlist is Empty</h3>
            <p>Bookmark stocks from the search or detail view to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistView;
