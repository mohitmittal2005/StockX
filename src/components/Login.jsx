import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-body">
      {/* Animated BG */}
      <div className="bg-canvas" aria-hidden="true">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-ticker">
            StockX&nbsp;&nbsp;&nbsp;StockX&nbsp;&nbsp;&nbsp;StockX&nbsp;&nbsp;&nbsp;StockX&nbsp;&nbsp;&nbsp;StockX&nbsp;&nbsp;&nbsp;StockX&nbsp;&nbsp;&nbsp;StockX&nbsp;&nbsp;&nbsp;StockX&nbsp;&nbsp;&nbsp;StockX&nbsp;&nbsp;&nbsp;StockX&nbsp;&nbsp;&nbsp;
          </div>
        ))}
      </div>

      <div className="vignette"></div>
      <div className="grid-overlay"></div>

      {/* Live Ticker Strip */}
      <div className="live-strip" aria-hidden="true">
        <div className="live-strip-inner">
          {[
            { name: 'RELIANCE', val: '₹2,841.50', change: '▲ 1.34%', up: true },
            { name: 'TCS', val: '₹3,512.00', change: '▲ 0.87%', up: true },
            { name: 'INFOSYS', val: '₹1,482.75', change: '▼ 0.52%', up: false },
            { name: 'HDFC BANK', val: '₹1,720.30', change: '▲ 2.11%', up: true },
            { name: 'BAJAJ FIN', val: '₹7,234.90', change: '▼ 1.05%', up: false },
            { name: 'WIPRO', val: '₹458.60', change: '▲ 0.43%', up: true },
            { name: 'NIFTY 50', val: '22,419.95', change: '▲ 0.76%', up: true },
            { name: 'SENSEX', val: '73,852.60', change: '▼ 0.22%', up: false },
          ].map((item, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-name">{item.name}</span>
              <span className="ticker-val">{item.val}</span>
              <span className={item.up ? 'ticker-up' : 'ticker-dn'}>{item.change}</span>
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {[
            { name: 'RELIANCE', val: '₹2,841.50', change: '▲ 1.34%', up: true },
            { name: 'TCS', val: '₹3,512.00', change: '▲ 0.87%', up: true },
            { name: 'INFOSYS', val: '₹1,482.75', change: '▼ 0.52%', up: false },
            { name: 'HDFC BANK', val: '₹1,720.30', change: '▲ 2.11%', up: true },
          ].map((item, i) => (
            <span key={`dup-${i}`} className="ticker-item">
              <span className="ticker-name">{item.name}</span>
              <span className="ticker-val">{item.val}</span>
              <span className={item.up ? 'ticker-up' : 'ticker-dn'}>{item.change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <main className="page">
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 50, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ animation: 'none' }}
        >
          <motion.div 
            className="logo"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.div 
              className="logo-icon"
              initial={{ opacity: 0, scale: 0, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 15 }}
              whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
            >
              S
            </motion.div>
            <motion.span 
              className="logo-text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              StockX
            </motion.span>
          </motion.div>

          <motion.p 
            className="tagline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            Trade Smarter. Live Bolder.
          </motion.p>

          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              <label>Email / Username</label>
              <input 
                type="text" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off" 
              />
            </motion.div>
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75, duration: 0.4 }}
            >
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>

            <motion.button 
              type="submit" 
              className="btn-primary" 
              disabled={isLoading} 
              style={{marginTop:'0.6rem'}}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Signing in…
                </motion.span>
              ) : (
                'Sign In'
              )}
            </motion.button>
            {error && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.7rem' }}>{error}</p>}
          </motion.form>

          <motion.div 
            className="divider"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            or
          </motion.div>

          <motion.button 
            className="btn-skip" 
            onClick={() => onLogin('guest@stockx.app', 'guest123')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.4 }}
            whileHover={{ scale: 1.02, borderColor: 'var(--red)', color: 'var(--red)' }}
            whileTap={{ scale: 0.98 }}
          >
            Skip for now
            <motion.svg 
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"/>
            </motion.svg>
          </motion.button>

          <motion.p 
            className="footer-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.4 }}
          >
            Don't have an account? <a href="#">Create one free</a>
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;
