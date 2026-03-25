import React from 'react';
import { Home, BarChart2, Star, User, Search } from 'lucide-react';

const BottomNav = ({ activeNav, onNav, onOpenSearch }) => {
  return (
    <div className="bottom-nav">
      <div 
        className={`nav-item ${activeNav === 'homeView' ? 'active' : ''}`} 
        onClick={() => onNav('homeView')}
      >
        <Home />
        <span>Home</span>
      </div>
      
      <div 
        className={`nav-item ${activeNav === 'paperTradingView' ? 'active' : ''}`} 
        onClick={() => onNav('paperTradingView')}
      >
        <BarChart2 />
        <span>Trade</span>
      </div>

      {/* Floating Center Button (Search) */}
      <div className="nav-center" onClick={onOpenSearch}>
        <div className="nav-center-inner">
          <Search size={28} />
        </div>
      </div>

      <div 
        className={`nav-item ${activeNav === 'watchlistView' ? 'active' : ''}`} 
        onClick={() => onNav('watchlistView')}
      >
        <Star />
        <span>Watchlist</span>
      </div>

      <div 
        className={`nav-item ${activeNav === 'profileView' ? 'active' : ''}`} 
        onClick={() => onNav('profileView')}
      >
        <User />
        <span>Profile</span>
      </div>
    </div>
  );
};

export default BottomNav;
