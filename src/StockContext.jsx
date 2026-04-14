import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from './api';

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState('');
  const [liveData, setLiveData] = useState({});
  const [marketStatus, setMarketStatus] = useState('Market is Open');
  const [lastUpdated, setLastUpdated] = useState('');
  const [cashBalance, setCashBalance] = useState(100000);
  const [holdings, setHoldings] = useState({});
  const [tradeLog, setTradeLog] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const loadState = () => {
      const token = localStorage.getItem('stockx_token');
      if (!token) return;
      api.getState().then((state) => {
        setApiKey(state.apiKey || '');
        setCashBalance(state.cashBalance ?? 100000);
        setHoldings(state.holdings || {});
        setTradeLog(state.tradeLog || []);
        setSearchHistory(state.searchHistory || []);
        setWatchlist(state.watchlist || []);
        setIsLive(true);
      }).catch(() => {});
    };
    loadState();
    const interval = setInterval(() => {
      if (!isLive && localStorage.getItem('stockx_token')) loadState();
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const hydrateUserState = (state) => {
    setApiKey(state.apiKey || '');
    setCashBalance(state.cashBalance ?? 100000);
    setHoldings(state.holdings || {});
    setTradeLog(state.tradeLog || []);
    setSearchHistory(state.searchHistory || []);
    setWatchlist(state.watchlist || []);
  };

  const addToHistory = async (symbol) => {
    if (!localStorage.getItem('stockx_token')) return;
    const state = await api.addHistory(symbol);
    hydrateUserState(state);
  };

  const toggleWatchlist = async (symbol) => {
    if (!localStorage.getItem('stockx_token')) return;
    const state = await api.toggleWatchlist(symbol);
    hydrateUserState(state);
  };

  const saveKey = async (key) => {
    setApiKey(key);
    if (!localStorage.getItem('stockx_token')) return;
    const state = await api.saveApiKey(key);
    hydrateUserState(state);
  };

  const buyStock = async (symbol, qty, price) => {
    if (!localStorage.getItem('stockx_token')) return false;
    try {
      const state = await api.buy(symbol, qty, price);
      hydrateUserState(state);
      return true;
    } catch {
      return false;
    }
  };

  const sellStock = async (symbol, qty, price) => {
    if (!localStorage.getItem('stockx_token')) return false;
    try {
      const state = await api.sell(symbol, qty, price);
      hydrateUserState(state);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    const updatePrices = async () => {
      const data = await api.getLiveMarket();
      if (!mounted) return;
      const map = {};
      data.stocks.forEach((s) => { map[s.symbol] = s; });
      setLiveData(map);
      setMarketStatus(data.marketStatus);
      setLastUpdated(data.lastUpdated);
    };
    updatePrices().catch(() => {});
    const interval = setInterval(() => updatePrices().catch(() => {}), 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const holdingsArray = useMemo(() => {
    return Object.entries(holdings).map(([symbol, data]) => ({
      symbol, shares: data.qty, avgPrice: data.avgPrice, totalCost: data.totalCost, name: data.name, emoji: data.emoji, color: data.color
    }));
  }, [holdings]);

  return (
    <StockContext.Provider value={{
      apiKey, saveKey,
      liveData, marketStatus, lastUpdated, isLive,
      cashBalance, holdings: holdingsArray, holdingsHash: holdings, 
      tradeLog, searchHistory, watchlist,
      addToHistory, buyStock, sellStock, toggleWatchlist, setIsLive
    }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => useContext(StockContext);
