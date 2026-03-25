import React from 'react';
import { useStock } from '../StockContext';

const ApiBanner = ({ isHidden, onClose, onSave }) => {
  if (isHidden) return null;

  return (
    <div id="apiBanner">
      <span>🔑 Enter your free <b>Finnhub API key</b> for real-time data → <a href="https://finnhub.io/register" target="_blank" rel="noreferrer" style={{color:'var(--red)'}}>Get free key</a></span>
      <input 
        id="apiKeyInput" 
        type="text" 
        placeholder="Paste your Finnhub API key here…" 
        onKeyDown={(e) => { if (e.key === 'Enter') { onSave(e.target.value); onClose(); } }} 
      />
      <button 
        id="saveApiBtn" 
        onClick={() => { onSave(document.getElementById('apiKeyInput').value); onClose(); }}
      >
        Connect Live Data
      </button>
      <button className="search-close" style={{position:'static', marginLeft:'10px'}} onClick={onClose}>✕</button>
    </div>
  );
};

export default ApiBanner;
