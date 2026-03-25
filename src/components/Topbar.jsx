import React from 'react';
import { useStock } from '../StockContext';

const Topbar = ({ onNav }) => {
  const { isLive } = useStock();

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="greeting">Hi there,</div>
        <div className="username">
          Welcome to StockX 
          {isLive && (
            <span id="liveBadge" className="live-badge" style={{ display: 'inline-flex' }}>
              <span className="live-dot"></span>LIVE
            </span>
          )}
        </div>
      </div>
      <div className="topbar-right">
        <div className="icon-btn pt-btn" onClick={() => onNav('paperTradingView')} title="Paper Trading">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span className="pt-badge">PAPER</span>
        </div>
        <div className="icon-btn" title="Notifications" onClick={() => onNav('profileView')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div className="bell-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
