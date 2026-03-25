import React from 'react';

const HistoryView = ({ searchHistory, onStockClick }) => {
  return (
    <div id="historyView" style={{ paddingTop: '1rem' }}>
      <div className="section-header">
        <span className="section-title" style={{ fontSize: '1.6rem' }}>Search History</span>
        <span className="view-all">Clear All</span>
      </div>
      <div className="watchlist" style={{ maxWidth: '800px', marginTop: '1rem' }}>
        {searchHistory.length > 0 ? (
          searchHistory.map(sym => (
            <div key={sym} className="watch-item" onClick={() => onStockClick(sym)}>
              <div className="watch-ticker">{sym}</div>
            </div>
          ))
        ) : (
          <div className="search-hint">No search history yet. Start searching to see recent tickers.</div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
