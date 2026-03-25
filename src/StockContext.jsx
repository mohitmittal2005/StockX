import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { STOCK_DB, API_KEY_DEFAULT, getSimPrice, PORTFOLIO_DEFAULT } from './config';

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('stockx_api_key') || '');
  const [liveData, setLiveData] = useState({});
  const [marketStatus, setMarketStatus] = useState('Market is Open');
  const [lastUpdated, setLastUpdated] = useState('');
  
  // Paper Trading & User State
  const [cashBalance, setCashBalance] = useState(100000);
  const [holdings, setHoldings] = useState(() => {
    const initial = {};
    PORTFOLIO_DEFAULT.forEach(s => {
      initial[s.symbol] = { 
        qty: s.shares, 
        avgPrice: getSimPrice(s.symbol), 
        totalCost: s.shares * getSimPrice(s.symbol), 
        name: s.name, 
        emoji: s.emoji, 
        color: s.color 
      };
    });
    return initial;
  });
  const [tradeLog, setTradeLog] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  // Load from LocalStorage
  useEffect(() => {
    const savedPT = localStorage.getItem('stockx_paper_trading');
    if (savedPT) {
      try {
        const data = JSON.parse(savedPT);
        if (data.cash !== undefined) setCashBalance(data.cash);
        if (data.holdings) setHoldings(data.holdings);
        if (data.trades) setTradeLog(data.trades);
      } catch (e) {}
    }

    const savedHistory = localStorage.getItem('stockx_search_history');
    if (savedHistory) {
        try { setSearchHistory(JSON.parse(savedHistory)); } catch(e) {}
    }

    const savedWatchlist = localStorage.getItem('stockx_watchlist');
    if (savedWatchlist) {
        try { setWatchlist(JSON.parse(savedWatchlist)); } catch(e) {}
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('stockx_paper_trading', JSON.stringify({ cash: cashBalance, holdings, trades: tradeLog }));
  }, [cashBalance, holdings, tradeLog]);

  useEffect(() => {
    localStorage.setItem('stockx_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('stockx_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToHistory = (symbol) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(s => s !== symbol);
      const newHistory = [symbol, ...filtered].slice(0, 10);
      return newHistory;
    });
  };

  const toggleWatchlist = (symbol) => {
     setWatchlist(prev => {
        if (prev.includes(symbol)) return prev.filter(s => s !== symbol);
        return [...prev, symbol];
     });
  };

  const saveKey = (key) => {
    setApiKey(key);
    localStorage.setItem('stockx_api_key', key);
  };

  const buyStock = (symbol, qty, price) => {
    const total = qty * price;
    if (total > cashBalance) return false;
    
    setCashBalance(prev => prev - total);
    setHoldings(prev => {
      const newHoldings = { ...prev };
      if (!newHoldings[symbol]) {
        const info = STOCK_DB.find(s => s.symbol === symbol) || { name: symbol, emoji: '📈' };
        newHoldings[symbol] = { qty: 0, avgPrice: 0, totalCost: 0, name: info.name, emoji: info.emoji };
      }
      const h = { ...newHoldings[symbol] };
      h.totalCost += total;
      h.qty += qty;
      h.avgPrice = h.totalCost / h.qty;
      newHoldings[symbol] = h;
      return newHoldings;
    });
    setTradeLog(prev => [{ type: 'buy', symbol, qty, price, total, time: Date.now() }, ...prev]);
    return true;
  };

  const sellStock = (symbol, qty, price) => {
    const h = holdings[symbol];
    if (!h || h.qty < qty) return false;
    
    const total = qty * price;
    const costBasis = h.avgPrice * qty;
    
    setCashBalance(prev => prev + total);
    setHoldings(prev => {
       const newHoldings = { ...prev };
       const stock = { ...newHoldings[symbol] };
       stock.qty -= qty;
       if (stock.qty <= 0) delete newHoldings[symbol];
       else {
          stock.totalCost -= costBasis;
          newHoldings[symbol] = stock;
       }
       return newHoldings;
    });
    setTradeLog(prev => [{ type: 'sell', symbol, qty, price, total, time: Date.now() }, ...prev]);
    return true;
  };

  // Live Data Simulation
  useEffect(() => {
    const updatePrices = () => {
      setLiveData(prev => {
        const next = { ...prev };
        STOCK_DB.forEach(s => {
          const base = next[s.symbol]?.price || getSimPrice(s.symbol);
          const change = (Math.random() - 0.48) * (base * 0.005);
          const newPrice = Math.max(0.1, base + change);
          const prevClose = next[s.symbol]?.prevClose || base;
          next[s.symbol] = {
            ...s,
            price: newPrice,
            prevClose: prevClose,
            change: ((newPrice - prevClose) / prevClose) * 100,
            open: prevClose * 1.002,
            high: Math.max(newPrice, prevClose) * 1.005,
            low: Math.min(newPrice, prevClose) * 0.995,
            volume: Math.floor(Math.random() * 5000000)
          };
        });
        return next;
      });
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toLowerCase());
    };

    updatePrices();
    const interval = setInterval(updatePrices, 3000);
    const mInterval = setInterval(() => {
        const statuses = ['Market is Open', 'Markets are Stable', 'Market Activity High', 'Monitoring Exchanges'];
        setMarketStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 60000);

    return () => { clearInterval(interval); clearInterval(mInterval); };
  }, []);

  const holdingsArray = useMemo(() => {
    return Object.entries(holdings).map(([symbol, data]) => ({
      symbol, shares: data.qty, avgPrice: data.avgPrice, totalCost: data.totalCost, name: data.name, emoji: data.emoji, color: data.color
    }));
  }, [holdings]);

  return (
    <StockContext.Provider value={{
      apiKey, saveKey,
      liveData, marketStatus, lastUpdated, isLive: !!apiKey,
      cashBalance, holdings: holdingsArray, holdingsHash: holdings, 
      tradeLog, searchHistory, watchlist,
      addToHistory, buyStock, sellStock, toggleWatchlist
    }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => useContext(StockContext);
