import React, { useState } from 'react';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 900);
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
        <div className="card">
          <div className="logo">
            <div className="logo-icon">S</div>
            <span className="logo-text">StockX</span>
          </div>

          <p className="tagline">Trade Smarter. Live Bolder.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email / Username</label>
              <input 
                type="text" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off" 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading} style={{marginTop:'0.6rem'}}>
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="divider">or</div>

          <button className="btn-skip" onClick={onLogin}>
            Skip for now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          <p className="footer-hint">
            Don't have an account? <a href="#">Create one free</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
