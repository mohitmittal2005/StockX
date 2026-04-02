import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

const pageVariants = {
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -16, filter: 'blur(4px)' },
};

const pageTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1],
};

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
        <motion.div 
          className="market-status-bar" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0 1.2rem', marginTop: '-0.5rem', marginBottom: '1.2rem'}}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="status-pill highlight">
            <span className="pulse-dot"></span>
            {marketStatus || 'Monitoring Exchanges'}
          </div>
          <div className="status-pill dimmed">
            <span>⏱</span> Updated {lastUpdated || 'Just now'}
          </div>
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.div
            key={nav}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
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
