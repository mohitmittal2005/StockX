import React, { useState } from 'react';

const ProfileView = ({ onLogout, onOpenApiKey }) => {
  const [isProfileEdit, setIsProfileEdit] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isNotifOn, setIsNotifOn] = useState(true);

  return (
    <div id="profileView" style={{ paddingTop: '1rem' }}>
      <div className="pf-view">
        {/* Profile Header */}
        <div className="pf-header-card">
          <div className="pf-avatar-wrap">
            <div className="pf-avatar" onClick={() => document.getElementById('pfAvatarInput').click()}>
              <span id="pfAvatarText">👤</span>
            </div>
            <div className="pf-avatar-edit" onClick={() => document.getElementById('pfAvatarInput').click()}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <input type="file" id="pfAvatarInput" accept="image/*" style={{display:'none'}} />
          </div>
          <div className="pf-username">StockX User</div>
          <div className="pf-email">user@stockx.com</div>
          <div className="pf-member-badge">⭐ PRO MEMBER</div>

          <button className="pf-edit-btn" onClick={() => setIsProfileEdit(!isProfileEdit)}>
            {isProfileEdit ? '✕ Cancel' : '✏️ Edit Profile'}
          </button>

          {isProfileEdit && (
            <div className="pf-edit-form" style={{ display: 'block' }}>
              <div className="pf-edit-row">
                <div className="pf-edit-label">Full Name</div>
                <input className="pf-edit-input" placeholder="Your name" />
              </div>
              <div className="pf-edit-row">
                <div className="pf-edit-label">Email</div>
                <input className="pf-edit-input" type="email" placeholder="your@email.com" />
              </div>
              <button className="pf-save-btn" onClick={() => setIsProfileEdit(false)}>Save Changes</button>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="pf-section-label">Settings</div>
        <div className="pf-menu">
          <div className="pf-menu-item" onClick={() => setIsDarkMode(!isDarkMode)}>
            <div className="pf-menu-icon" style={{background:'rgba(255,200,0,0.1)'}}>🌙</div>
            <div className="pf-menu-text">
              <div className="pf-menu-title">Dark Mode</div>
              <div className="pf-menu-desc">Toggle light/dark theme</div>
            </div>
            <div className={`pf-menu-toggle ${isDarkMode ? 'on' : ''}`}></div>
          </div>
          <div className="pf-menu-item" onClick={() => setIsNotifOn(!isNotifOn)}>
            <div className="pf-menu-icon" style={{background:'rgba(34,197,94,0.1)'}}>🔔</div>
            <div className="pf-menu-text">
              <div className="pf-menu-title">Notifications</div>
              <div className="pf-menu-desc">Price alerts & trade updates</div>
            </div>
            <div className={`pf-menu-toggle ${isNotifOn ? 'on' : ''}`}></div>
          </div>
          <div className="pf-menu-item" onClick={onOpenApiKey}>
            <div className="pf-menu-icon" style={{background:'rgba(99,102,241,0.1)'}}>🔑</div>
            <div className="pf-menu-text">
              <div className="pf-menu-title">API Key</div>
              <div className="pf-menu-desc">Manage your Finnhub API key</div>
            </div>
            <span className="pf-menu-arrow">›</span>
          </div>
        </div>

        {/* Support */}
        <div className="pf-section-label">Support</div>
        <div className="pf-menu">
            <div className="pf-menu-item">
              <div className="pf-menu-icon" style={{background:'rgba(59,130,246,0.1)'}}>📧</div>
              <div className="pf-menu-text">
                <div className="pf-menu-title">Contact Us</div>
                <div className="pf-menu-desc">Get help & support</div>
              </div>
              <span className="pf-menu-arrow">›</span>
            </div>
            <div className="pf-menu-item">
              <div className="pf-menu-icon" style={{background:'rgba(168,85,247,0.1)'}}>📄</div>
              <div className="pf-menu-text">
                <div className="pf-menu-title">Terms & Conditions</div>
                <div className="pf-menu-desc">Legal agreements & policies</div>
              </div>
              <span className="pf-menu-arrow">›</span>
            </div>
        </div>

        {/* Upcoming Features */}
        <div className="pf-section-label">Upcoming Features</div>
        <div className="pf-features">
          {[
            {icon:'🤖', name:'AI Advisor', status:'Coming Soon'},
            {icon:'📱', name:'Mobile App', status:'In Development'},
            {icon:'🌐', name:'Global Markets', status:'Q3 2026'},
            {icon:'📊', name:'Options Trading', status:'Coming Soon'},
          ].map(f => (
            <div key={f.name} className="pf-feature">
              <div className="pf-feature-icon">{f.icon}</div>
              <div className="pf-feature-name">{f.name}</div>
              <div className="pf-feature-status">{f.status}</div>
            </div>
          ))}
        </div>

        <button className="pf-logout-btn" onClick={onLogout}>🚶 Logout</button>
        <div className="pf-version">StockX v2.0 · Made with ❤️</div>
      </div>
    </div>
  );
};

export default ProfileView;
