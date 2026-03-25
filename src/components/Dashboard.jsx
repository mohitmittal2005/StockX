import React, { useMemo, useState } from 'react';
import { useStock } from '../StockContext';
import { WATCHLIST_DEFAULT } from '../config';
import GainsChart from './GainsChart';
import MiniChart from './MiniChart';
import Sparkline from './Sparkline';

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
          <div className="gains-card fade-in">
            <div className="gains-top">
              <div>
                <div className="gains-label">Portfolio Value</div>
                <div className="gains-amount" id="totalValue">
                  ${totalInvestedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`gains-change ${totalChange >= 0 ? 'up' : 'dn'}`}>
                  {totalChange >= 0 ? '+' : ''}${Math.abs(totalChange).toFixed(2)} ({totalChange >= 0 ? '+' : ''}{totalChangePct}%) today
                </div>
              </div>
              {/* Period indicator (Now hidden via CSS as per user request, but keeping the state for chart) */}
              <div className="gains-period" style={{display: 'none'}}>
                <span id="periodLabel">{period}</span>
              </div>
            </div>
            <div className="chart-wrap">
              <GainsChart period={period} />
            </div>
          </div>

          <div className="period-tabs">
            {['1D', '1W', '1M', '3M', '1Y'].map(p => (
              <button 
                key={p} 
                className={`period-tab ${p === period ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Portfolio Section */}
          <div className="section-header">
            <span className="section-title">Portfolio</span>
            <span className="view-all">View all ›</span>
          </div>
          <div className="portfolio-scroll">
            {holdings.length > 0 ? (
              holdings.map((h, idx) => {
                const data = liveData[h.symbol] || { price: 0, change: 0 };
                const isUp = data.change >= 0;
                return (
                  <div key={h.symbol} className={`port-card ${idx === 0 ? 'active-card' : ''}`} onClick={() => onStockClick(h.symbol)}>
                    <div className="port-card-top">
                      <div className="port-logo" style={{background:`${h.color || '#555'}22`, borderColor:`${h.color || '#555'}44`}}>
                        <span style={{fontSize:'1.3rem'}}>{h.emoji}</span>
                      </div>
                      <MiniChart symbol={h.symbol} isUp={isUp} />
                    </div>
                    <div className="port-ticker">{h.symbol}</div>
                    <div className="port-name">{h.name || h.symbol}</div>
                    <div className="port-price" id={`pp-${h.symbol}`}>${data.price.toFixed(2)}</div>
                    <div className={`port-change ${isUp ? 'up' : 'dn'}`} id={`pc-${h.symbol}`}>
                      {isUp ? '▲' : '▼'} {Math.abs(data.change).toFixed(2)}%
                    </div>
                  </div>
                );
              })
            ) : (
                <div className="port-card" style={{opacity: 0.6, cursor: 'default'}}>
                  <div className="port-info" style={{padding: '1rem'}}>Empty Portfolio</div>
                </div>
            )}
          </div>
        </div>

        <div className="dash-side">
          {!isLive && (
            <div className="api-nudge">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="api-nudge-text">Showing simulated data. Add API key for live prices.</div>
            </div>
          )}

          {/* Watchlist Section */}
          <div className="section-header" style={{ paddingTop: '0.4rem' }}>
            <span className="section-title">Popular Stocks</span>
            <span className="view-all" onClick={onOpenSearch}>›</span>
          </div>
          <div className="watchlist">
             {WATCHLIST_DEFAULT.map((item, idx) => {
                const data = liveData[item.symbol] || { price: 0, change: 0 };
                const isUp = data.change >= 0;
                return (
                  <div key={item.symbol} className="watch-item" onClick={() => onStockClick(item.symbol)}>
                    <div className="watch-logo" style={{background:`${item.color}22`, borderColor:`${item.color}44`, width:'48px', height:'48px'}}>
                      <span style={{fontSize:'1.3rem'}}>{item.emoji}</span>
                    </div>
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
                  </div>
                );
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
