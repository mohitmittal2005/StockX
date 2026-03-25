import React, { useState, useMemo } from 'react';
import { useStock } from '../StockContext';
import { STOCK_DB } from '../config';

// Components
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import Dashboard from './Dashboard';
import WatchlistView from './WatchlistView';
import PaperTradingView from './PaperTradingView';
import ProfileView from './ProfileView';
import SearchOverlay from './SearchOverlay';
import StockDetailModal from './StockDetailModal';
import ApiBanner from './ApiBanner';

// Styles
import '../styles/base.css';
import '../styles/profile.css';
import '../styles/stock-detail.css';

const Home = ({ onLogout }) => {
  const [nav, setNav] = useState('homeView');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [isApiBannerHidden, setIsApiBannerHidden] = useState(true);

  const { addToHistory, saveKey, marketStatus, lastUpdated } = useStock();

  const handleNav = (target) => setNav(target);
  const openSearch = () => setShowSearch(true);
  const closeSearch = () => setShowSearch(false);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toUpperCase();
    return STOCK_DB.filter(s => 
      s.symbol.includes(query) || 
      s.name.toUpperCase().includes(query)
    );
  }, [searchQuery]);

  const handleStockClick = (symbol) => {
    setSelectedStock(symbol);
    addToHistory(symbol);
    closeSearch();
  };

  const renderView = () => {
    switch (nav) {
      case 'homeView':
        return <Dashboard onStockClick={handleStockClick} onOpenSearch={openSearch} />;
      case 'paperTradingView':
        return <PaperTradingView onStockClick={handleStockClick} />;
      case 'watchlistView':
        return <WatchlistView onStockClick={handleStockClick} />;
      case 'profileView':
        return <ProfileView onLogout={onLogout} onOpenApiKey={() => setIsApiBannerHidden(false)} />;
      default:
        return <Dashboard onStockClick={handleStockClick} onOpenSearch={openSearch} />;
    }
  };

  return (
    <div className="app">
      <div className="main-scroll">
        <ApiBanner 
          isHidden={isApiBannerHidden} 
          onClose={() => setIsApiBannerHidden(true)} 
          onSave={saveKey} 
        />
        <Topbar onNav={handleNav} />
        <div className="market-status-bar" style={{marginTop: '-1rem', marginBottom: '0.5rem'}}>
          <span id="marketStatus">● {marketStatus}</span>
          <span id="lastUpdated" style={{marginLeft: '10px'}}>Updated {lastUpdated}</span>
        </div>
        {renderView()}
        <div style={{ height: '5rem' }}></div>
      </div>
      <BottomNav activeNav={nav} onNav={handleNav} onOpenSearch={openSearch} />
      <SearchOverlay 
        isOpen={showSearch} 
        onClose={closeSearch} 
        searchQuery={searchQuery} 
        onSearchQueryChange={setSearchQuery} 
        searchResults={searchResults} 
        onStockClick={handleStockClick} 
      />
      {selectedStock && <StockDetailModal symbol={selectedStock} onClose={() => setSelectedStock(null)} />}
    </div>
  );
};

export default Home;
