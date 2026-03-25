import React, { useState } from 'react';
import Login from './components/Login';
import Home from './components/Home';
import { StockProvider } from './StockContext';
import './styles/base.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <StockProvider>
      <div className="app-container">
        {isLoggedIn ? (
          <Home onLogout={() => setIsLoggedIn(false)} />
        ) : (
          <Login onLogin={() => setIsLoggedIn(true)} />
        )}
      </div>
    </StockProvider>
  );
};

export default App;
