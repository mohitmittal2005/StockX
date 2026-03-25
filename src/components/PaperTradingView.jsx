import React, { useState } from 'react';
import { useStock } from '../StockContext';

const PaperTradingView = ({ onStockClick }) => {
  const { cashBalance, holdings, tradeLog, liveData } = useStock();
  const [ptTab, setPtTab] = useState('holdings');

  const investedValue = holdings.reduce((sum, h) => sum + (h.shares * (liveData[h.symbol]?.price || 0)), 0);

  return (
    <div id="paperTradingView" style={{ paddingTop: '1rem' }}>
      <div className="pt-view">
        <div className="section-header" style={{ paddingInline: 0 }}>
          <span className="section-title" style={{ fontSize: '1.6rem' }}>📝 Paper Trading</span>
          <span className="view-all" style={{ color: 'var(--muted)' }}>Reset Account</span>
        </div>
        <div className="pt-wallet-card">
          <div className="pt-wallet-label">Total Portfolio Value</div>
          <div className="pt-wallet-balance">${(cashBalance + investedValue).toLocaleString()}</div>
          <div className="pt-wallet-row">
            <div className="pt-wallet-stat">
              <div className="pt-wallet-stat-label">Cash Balance</div>
              <div className="pt-wallet-stat-val">${cashBalance.toLocaleString()}</div>
            </div>
            <div className="pt-wallet-stat">
              <div className="pt-wallet-stat-label">Invested</div>
              <div className="pt-wallet-stat-val">${investedValue.toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="pt-tabs">
          <button className={`pt-tab-btn ${ptTab === 'holdings' ? 'active' : ''}`} onClick={() => setPtTab('holdings')}>Holdings</button>
          <button className={`pt-tab-btn ${ptTab === 'trades' ? 'active' : ''}`} onClick={() => setPtTab('trades')}>Trade Log</button>
        </div>
        {ptTab === 'holdings' && (
          <div id="ptHoldingsTab">
            {holdings.length > 0 ? (
              holdings.map(h => (
                <div key={h.symbol} className="watch-item" onClick={() => onStockClick(h.symbol)}>
                  <div className="watch-info">
                    <div className="watch-ticker">{h.symbol}</div>
                    <div className="watch-name">{h.shares} Shares</div>
                  </div>
                  <div className="watch-right">
                    <div className="watch-price">${(liveData[h.symbol]?.price || 0).toFixed(2)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="search-hint">No holdings yet. Start buying stocks to build your portfolio.</div>
            )}
          </div>
        )}
        {ptTab === 'trades' && (
          <div id="ptTradesTab">
            {tradeLog.length > 0 ? (
              tradeLog.map((log, i) => (
                <div key={i} className="watch-item">
                  <div className="watch-info">
                    <div className="watch-ticker">{log.type.toUpperCase()} {log.symbol}</div>
                    <div className="watch-name">{log.qty} shares @ ${log.price.toFixed(2)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="search-hint">No trades recorded yet. Your journey starts here!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperTradingView;
