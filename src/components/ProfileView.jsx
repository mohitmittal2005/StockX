import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  })
};

const featureVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  show: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: 0.4 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  })
};

const ProfileView = ({ onLogout, onOpenApiKey }) => {
  const [isProfileEdit, setIsProfileEdit] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isNotifOn, setIsNotifOn] = useState(true);

  const settingsItems = [
    { 
      icon: '🌙', bg: 'rgba(255,200,0,0.1)', 
      title: 'Dark Mode', desc: 'Toggle light/dark theme',
      toggle: true, isOn: isDarkMode, onToggle: () => setIsDarkMode(!isDarkMode)
    },
    { 
      icon: '🔔', bg: 'rgba(34,197,94,0.1)', 
      title: 'Notifications', desc: 'Price alerts & trade updates',
      toggle: true, isOn: isNotifOn, onToggle: () => setIsNotifOn(!isNotifOn)
    },
    { 
      icon: '🔑', bg: 'rgba(99,102,241,0.1)', 
      title: 'API Key', desc: 'Manage your Finnhub API key',
      arrow: true, onClick: onOpenApiKey
    },
  ];

  const supportItems = [
    { icon: '📧', bg: 'rgba(59,130,246,0.1)', title: 'Contact Us', desc: 'Get help & support' },
    { icon: '📄', bg: 'rgba(168,85,247,0.1)', title: 'Terms & Conditions', desc: 'Legal agreements & policies' },
  ];

  const upcomingFeatures = [
    {icon:'🤖', name:'AI Advisor', status:'Coming Soon'},
    {icon:'📱', name:'Mobile App', status:'In Development'},
    {icon:'🌐', name:'Global Markets', status:'Q3 2026'},
    {icon:'📊', name:'Options Trading', status:'Coming Soon'},
  ];

  return (
    <div id="profileView" style={{ paddingTop: '1rem' }}>
      <div className="pf-view">
        {/* Profile Header */}
        <motion.div 
          className="pf-header-card"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div 
            className="pf-avatar-wrap"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 18 }}
          >
            <motion.div 
              className="pf-avatar" 
              onClick={() => document.getElementById('pfAvatarInput').click()}
              whileHover={{ scale: 1.08, borderColor: 'var(--red)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span id="pfAvatarText">👤</span>
            </motion.div>
            <motion.div 
              className="pf-avatar-edit" 
              onClick={() => document.getElementById('pfAvatarInput').click()}
              whileHover={{ scale: 1.2, rotate: 15 }}
              whileTap={{ scale: 0.85 }}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </motion.div>
            <input type="file" id="pfAvatarInput" accept="image/*" style={{display:'none'}} />
          </motion.div>
          <motion.div 
            className="pf-username"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            StockX User
          </motion.div>
          <motion.div 
            className="pf-email"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            user@stockx.com
          </motion.div>
          <motion.div 
            className="pf-member-badge"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 15 }}
          >
            ⭐ PRO MEMBER
          </motion.div>

          <motion.button 
            className="pf-edit-btn" 
            onClick={() => setIsProfileEdit(!isProfileEdit)}
            whileHover={{ scale: 1.05, borderColor: 'var(--red)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            {isProfileEdit ? '✕ Cancel' : '✏️ Edit Profile'}
          </motion.button>

          <AnimatePresence>
            {isProfileEdit && (
              <motion.div 
                className="pf-edit-form" 
                style={{ display: 'block' }}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="pf-edit-row">
                  <div className="pf-edit-label">Full Name</div>
                  <input className="pf-edit-input" placeholder="Your name" />
                </div>
                <div className="pf-edit-row">
                  <div className="pf-edit-label">Email</div>
                  <input className="pf-edit-input" type="email" placeholder="your@email.com" />
                </div>
                <motion.button 
                  className="pf-save-btn" 
                  onClick={() => setIsProfileEdit(false)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Changes
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Settings */}
        <motion.div 
          className="pf-section-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Settings
        </motion.div>
        <div className="pf-menu">
          {settingsItems.map((item, i) => (
            <motion.div 
              key={item.title}
              className="pf-menu-item" 
              onClick={item.onToggle || item.onClick}
              custom={i}
              variants={menuItemVariants}
              initial="hidden"
              animate="show"
              whileHover={{ x: 4, borderColor: 'rgba(232,0,29,0.3)', transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="pf-menu-icon" 
                style={{background: item.bg}}
                whileHover={{ rotate: 15, scale: 1.1 }}
              >
                {item.icon}
              </motion.div>
              <div className="pf-menu-text">
                <div className="pf-menu-title">{item.title}</div>
                <div className="pf-menu-desc">{item.desc}</div>
              </div>
              {item.toggle && (
                <motion.div 
                  className={`pf-menu-toggle ${item.isOn ? 'on' : ''}`}
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              {item.arrow && <span className="pf-menu-arrow">›</span>}
            </motion.div>
          ))}
        </div>

        {/* Support */}
        <motion.div 
          className="pf-section-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          Support
        </motion.div>
        <div className="pf-menu">
          {supportItems.map((item, i) => (
            <motion.div 
              key={item.title}
              className="pf-menu-item"
              custom={i + 3}
              variants={menuItemVariants}
              initial="hidden"
              animate="show"
              whileHover={{ x: 4, borderColor: 'rgba(232,0,29,0.3)', transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="pf-menu-icon" 
                style={{background: item.bg}}
                whileHover={{ rotate: 15, scale: 1.1 }}
              >
                {item.icon}
              </motion.div>
              <div className="pf-menu-text">
                <div className="pf-menu-title">{item.title}</div>
                <div className="pf-menu-desc">{item.desc}</div>
              </div>
              <span className="pf-menu-arrow">›</span>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Features */}
        <motion.div 
          className="pf-section-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          Upcoming Features
        </motion.div>
        <div className="pf-features">
          {upcomingFeatures.map((f, i) => (
            <motion.div 
              key={f.name} 
              className="pf-feature"
              custom={i}
              variants={featureVariants}
              initial="hidden"
              animate="show"
              whileHover={{ y: -4, scale: 1.04, borderColor: 'rgba(232,0,29,0.3)', transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.96 }}
            >
              <motion.div 
                className="pf-feature-icon"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 + i * 0.5 }}
              >
                {f.icon}
              </motion.div>
              <div className="pf-feature-name">{f.name}</div>
              <div className="pf-feature-status">{f.status}</div>
            </motion.div>
          ))}
        </div>

        <motion.button 
          className="pf-logout-btn" 
          onClick={onLogout}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          whileHover={{ scale: 1.02, borderColor: 'var(--red)', backgroundColor: 'rgba(232,0,29,0.08)' }}
          whileTap={{ scale: 0.97 }}
        >
          🚶 Logout
        </motion.button>
        <motion.div 
          className="pf-version"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          StockX
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileView;
