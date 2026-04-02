import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './components/Login';
import Home from './components/Home';
import { StockProvider } from './StockContext';
import './styles/base.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
              <Home onLogout={() => setIsLoggedIn(false)} />
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
              <Login onLogin={() => setIsLoggedIn(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StockProvider>
  );
};

export default App;
