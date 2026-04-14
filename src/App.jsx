import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './components/Login';
import Home from './components/Home';
import { StockProvider } from './StockContext';
import { api } from './api';
import './styles/base.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('stockx_token'));

  const handleLogin = async (email, password) => {
    const safeEmail = email?.trim() || 'guest@stockx.app';
    const safePassword = password?.trim() || 'guest123';
    const result = await api.login(safeEmail, safePassword);
    localStorage.setItem('stockx_token', result.token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('stockx_token');
    setIsLoggedIn(false);
  };

  return (
    <StockProvider>
      <div className="app-container">
        <AnimatePresence mode="wait">
          {isLoggedIn ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: '100%', minHeight: '100vh' }}
            >
              <Home onLogout={handleLogout} />
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -40, filter: 'blur(8px)' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: '100%', minHeight: '100vh' }}
            >
              <Login onLogin={handleLogin} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StockProvider>
  );
};

export default App;
