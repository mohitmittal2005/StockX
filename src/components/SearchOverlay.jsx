import React from 'react';

const SearchOverlay = ({ isOpen, onClose, searchQuery, onSearchQueryChange, searchResults, onStockClick }) => {
  if (!isOpen) return null;

  return (
    <div className={`search-overlay open`} onClick={onClose}>
      <div className="search-box" onClick={e => e.stopPropagation()}>
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input 
          className="search-input" 
          value={searchQuery} 
          onChange={e => onSearchQueryChange(e.target.value)} 
          placeholder="Search stocks — AAPL, TSLA, MSFT…" 
          autoFocus 
        />
        <button className="search-close" onClick={onClose}>✕</button>
      </div>
      <div className="search-results">
        {searchResults.length > 0 ? (
          searchResults.map(s => (
            <div key={s.symbol} className="search-result-item" onClick={() => onStockClick(s.symbol)}>
              <div className="sr-emoji">{s.emoji}</div>
              <div className="sr-info">
                <div className="sr-ticker">{s.symbol}</div>
                <div className="sr-name">{s.name}</div>
              </div>
            </div>
          ))
        ) : (
          searchQuery && <div className="search-hint">No stocks found for "{searchQuery}"</div>
        )}
        {!searchQuery && <div className="search-hint">Type a ticker or company name to search</div>}
      </div>
    </div>
  );
};

export default SearchOverlay;
