//  PROFILE PAGE
// ══════════════════════════════════════════

function getProfile() {
  try {
    const s = localStorage.getItem('stockx_profile');
    if (s) return JSON.parse(s);
  } catch (e) { }
  return { name: 'StockX User', email: 'user@stockx.com', avatar: '', notifications: true, darkMode: true };
}

// Apply dark mode on load
function initTheme() {
  let p = getProfile();
  if (p.darkMode === false) {
    document.body.classList.add('light-mode');
  }
}
initTheme();

function saveProfileData(data) {
  localStorage.setItem('stockx_profile', JSON.stringify(data));
}

function loadProfile() {
  const p = getProfile();
  document.getElementById('pfUsername').textContent = p.name;
  document.getElementById('pfEmail').textContent = p.email;
  document.getElementById('pfNameInput').value = p.name;
  document.getElementById('pfEmailInput').value = p.email;

  // Avatar
  let avatarEl = document.getElementById('pfAvatar');
  let avatarText = document.getElementById('pfAvatarText');
  if (p.avatar) {
    avatarText.innerHTML = '<img src="' + p.avatar + '" alt="avatar" />';
  } else {
    let words = p.name.split(' ');
    let initials = '';
    for (let i = 0; i < words.length; i++) {
      if (words[i] && words[i].length > 0) {
        initials = initials + words[i][0];
      }
      if (initials.length >= 2) break;
    }
    initials = initials.toUpperCase();

    if (initials) {
      avatarText.textContent = initials;
      avatarText.style.fontSize = '1.8rem';
    } else {
      avatarText.textContent = '👤';
      avatarText.style.fontSize = '2.4rem';
    }
  }

  // Notification toggle
  const notifToggle = document.getElementById('pfNotifToggle');
  notifToggle.className = 'pf-menu-toggle' + (p.notifications !== false ? ' on' : '');

  // Setup dark mode toggle state
  const darkToggle = document.getElementById('pfDarkToggle');
  darkToggle.className = 'pf-menu-toggle' + (p.darkMode !== false ? ' on' : '');

  // Close edit form
  document.getElementById('pfEditForm').classList.remove('open');
  document.getElementById('pfEditToggle').textContent = '✏️ Edit Profile';
}

function toggleProfileEdit() {
  const form = document.getElementById('pfEditForm');
  const btn = document.getElementById('pfEditToggle');
  form.classList.toggle('open');
  btn.textContent = form.classList.contains('open') ? '✖ Cancel' : '✏️ Edit Profile';
}

function saveProfile() {
  const p = getProfile();
  p.name = document.getElementById('pfNameInput').value.trim() || 'StockX User';
  p.email = document.getElementById('pfEmailInput').value.trim() || 'user@stockx.com';
  saveProfileData(p);
  loadProfile();
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const p = getProfile();
    p.avatar = e.target.result;
    saveProfileData(p);
    loadProfile();
  };
  reader.readAsDataURL(file);
}

function toggleDarkMode() {
  const p = getProfile();
  p.darkMode = !p.darkMode;
  saveProfileData(p);

  const t = document.getElementById('pfDarkToggle');
  t.className = 'pf-menu-toggle' + (p.darkMode ? ' on' : '');

  if (p.darkMode) {
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
  }

  // We may want to redraw charts if needed, but css vars handle most
}

function toggleNotifications() {
  const p = getProfile();
  p.notifications = !p.notifications;
  saveProfileData(p);
  const t = document.getElementById('pfNotifToggle');
  t.className = 'pf-menu-toggle' + (p.notifications ? ' on' : '');
}

function logoutUser() {
  if (!confirm('Are you sure you want to logout?')) return;
  window.location.href = 'login.html';
}

// Profile Modals
function openPfModal(type) {
  const overlay = document.getElementById('pfModalOverlay');
  const content = document.getElementById('pfModalContent');
  let html = '';

  if (type === 'contact') {
    html = `
          <div class="pf-modal-header">
            <div class="pf-modal-title">📧 Contact Us</div>
            <button class="pf-modal-close" onclick="closePfModal()">✕</button>
          </div>
          <div class="pf-modal-body">
            <p>We'd love to hear from you! Reach out through any of these channels:</p>
            <div class="pf-contact-item">
              <span class="pf-contact-icon">📧</span>
              <div>
                <div class="pf-contact-label">Email</div>
                <div class="pf-contact-val">support@stockx-app.com</div>
              </div>
            </div>
            <div class="pf-contact-item">
              <span class="pf-contact-icon">📞</span>
              <div>
                <div class="pf-contact-label">Phone</div>
                <div class="pf-contact-val">+91 98765 43210</div>
              </div>
            </div>
            <div class="pf-contact-item">
              <span class="pf-contact-icon">📍</span>
              <div>
                <div class="pf-contact-label">Office</div>
                <div class="pf-contact-val">New Delhi, India</div>
              </div>
            </div>
            <div class="pf-contact-item">
              <span class="pf-contact-icon">🐦</span>
              <div>
                <div class="pf-contact-label">Twitter</div>
                <div class="pf-contact-val">@StockXApp</div>
              </div>
            </div>
            <p style="margin-top:1rem;font-size:0.78rem;color:#555">Response time: Usually within 24 hours</p>
          </div>`;
  }
  else if (type === 'terms') {
    html = `
          <div class="pf-modal-header">
            <div class="pf-modal-title">📄 Terms & Conditions</div>
            <button class="pf-modal-close" onclick="closePfModal()">✕</button>
          </div>
          <div class="pf-modal-body">
            <p><b>Effective Date:</b> March 1, 2026</p>
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing and using StockX, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use this application.</p>
            <h3>2. Paper Trading Disclaimer</h3>
            <p>StockX provides paper trading (simulated trading) services only. <b>No real money is involved.</b> All trades are simulated using virtual currency and do not represent actual market transactions.</p>
            <h3>3. Not Financial Advice</h3>
            <p>The information provided on StockX is for educational and entertainment purposes only. It should not be construed as financial advice. Always consult a qualified financial advisor before making investment decisions.</p>
            <h3>4. Data Accuracy</h3>
            <p>Stock prices are sourced from third-party providers (Finnhub) and may have slight delays. We do not guarantee the accuracy, completeness, or timeliness of any data displayed.</p>
            <h3>5. User Account</h3>
            <p>Your profile data and trading history are stored locally on your device. We are not responsible for any data loss due to browser cache clearing or device changes.</p>
            <h3>6. Modifications</h3>
            <p>We reserve the right to modify these terms at any time. Continued use of the app constitutes acceptance of the updated terms.</p>
          </div>`;
  }
  else if (type === 'privacy') {
    html = `
          <div class="pf-modal-header">
            <div class="pf-modal-title">🔒 Privacy Policy</div>
            <button class="pf-modal-close" onclick="closePfModal()">✕</button>
          </div>
          <div class="pf-modal-body">
            <p><b>Last Updated:</b> March 1, 2026</p>
            <h3>Data Collection</h3>
            <p>StockX stores all user data <b>locally in your browser</b> using localStorage. We do not collect, transmit, or store any personal data on external servers.</p>
            <h3>What We Store Locally</h3>
            <p>• Profile name and email<br>• Profile picture (as base64)<br>• Paper trading history and holdings<br>• Search history<br>• API key preferences</p>
            <h3>Third-Party Services</h3>
            <p>We use Finnhub API for real-time stock data. Your API key is stored locally and sent directly to Finnhub. Please review <a href="https://finnhub.io/privacy" target="_blank" style="color:var(--red)">Finnhub's privacy policy</a>.</p>
            <h3>Data Deletion</h3>
            <p>You can delete all your data at any time by clearing your browser's localStorage or using the "Reset Account" option in Paper Trading.</p>
          </div>`;
  }

  content.innerHTML = html;
  overlay.classList.add('open');
}

function closePfModal() {
  document.getElementById('pfModalOverlay').classList.remove('open');
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePfModal();
});
