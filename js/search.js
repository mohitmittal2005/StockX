// ── Nav ──
function setNav(el, targetId) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el && el.classList) el.classList.add('active');

  // View switching
  const views = ['homeView', 'historyView', 'paperTradingView', 'profileView'];
  views.forEach(v => {
    const elView = document.getElementById(v);
    if (elView) elView.style.display = 'none';
  });
  
  const target = document.getElementById(targetId);
  if (target) target.style.display = 'block';

  if (targetId === 'historyView') {
    renderHistoryView();
  }
  if (targetId === 'paperTradingView') {
    renderPaperTradingView();
  }
  if (targetId === 'profileView') {
    loadProfile();
  }
}

// ── Search Overlay ──
let searchTimer = null;

function openSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  setTimeout(() => {
    const input = document.getElementById('searchInput');
    if (input) input.focus();
  }, 150);
  document.body.style.overflow = 'hidden';
  showDefaultSearchResults();
}

function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (overlay) overlay.classList.remove('open');
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('searchOverlay')) closeSearch();
}

document.addEventListener('keydown', e => { 
  if (e.key === 'Escape') closeSearch(); 
});

function showDefaultSearchResults() {
  // Show a mix of popular stocks
  const defaults = [
    { symbol: 'AAPL', name: 'Apple Inc.', emoji: '🍎' },
    { symbol: 'TSLA', name: 'Tesla Inc.', emoji: '⚡' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', emoji: '🪟' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', emoji: '🔍' },
    { symbol: 'AMZN', name: 'Amazon.com', emoji: '📦' },
    { symbol: 'META', name: 'Meta Platforms', emoji: '👥' },
    { symbol: 'NFLX', name: 'Netflix', emoji: '🎬' },
    { symbol: 'NVDA', name: 'NVIDIA', emoji: '🎮' },
  ];
  renderSearchItems(defaults, true);
}

// ── Search Logic ──
async function doSearch(query) {
  const q = query.trim();
  const res = document.getElementById('searchResults');
  if (!res) return;
  
  clearTimeout(searchTimer);

  if (!q) {
    showDefaultSearchResults();
    return;
  }

  // Show loading
  res.innerHTML = `
    <div class="search-hint">
      <div class="search-spinner"></div>
      Searching for "${q}"…
    </div>`;

  // Debounce 400ms
  searchTimer = setTimeout(async () => {
    let items = [];

    // 1) Try Finnhub API
    try {
      const resp = await fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${API_KEY}`
      );
      const data = await resp.json();

      if (data.result && data.result.length > 0) {
        items = data.result
          .slice(0, 15)
          .map(r => ({
            symbol: r.symbol,
            name: r.description || r.displaySymbol,
            emoji: getEmojiForSymbol(r.symbol),
          }));
      }
    } catch (err) {
      console.error('Search API failed:', err);
    }

    // 2) Fallback to local filtering if needed (using config data)
    if (items.length === 0) {
      // Very basic local fallback
      items = [
        ...PORTFOLIO, ...WATCHLIST
      ].filter(s => s.symbol.includes(q.toUpperCase()) || s.name.toLowerCase().includes(q.toLowerCase()));
    }

    if (items.length === 0) {
      res.innerHTML = `<div class="search-hint">No results found for "<b style="color:var(--text)">${q}</b>"</div>`;
      return;
    }

    // Fetch live quotes for top few
    const top = items.slice(0, 5);
    await Promise.allSettled(top.map(async (s) => {
      if (!liveData[s.symbol]) {
        try {
          const qr = await fetch(`https://finnhub.io/api/v1/quote?symbol=${s.symbol}&token=${API_KEY}`);
          const qd = await qr.json();
          if (qd && qd.c > 0) {
            liveData[s.symbol] = { price: qd.c, change: qd.dp || 0, prevClose: qd.pc || qd.c };
          }
        } catch (_) {}
      }
    }));

    renderSearchItems(items, false);
  }, 400);
}

function renderSearchItems(items, isDefault) {
  const res = document.getElementById('searchResults');
  if (!res) return;

  let html = isDefault ? '<div class="search-section-label">Popular Stocks</div>' : '';

  items.forEach((s, i) => {
    let d = liveData[s.symbol];
    if (!d || !d.price) {
      const sp = getSimPrice(s.symbol);
      d = { price: sp, change: getSimChange(s.symbol), prevClose: sp };
      liveData[s.symbol] = d;
    }

    const price = '$' + d.price.toFixed(2);
    const isUp = d.change >= 0;
    const delay = (i * 0.04) + 's';
    const safeName = s.name.replace(/'/g, "\\'");

    html += `
      <div class="search-result-item" style="animation-delay:${delay}" onclick="handleSearchSelectAndOpen('${s.symbol}', '${safeName}', '${s.emoji}')">
        <div class="sr-emoji">${s.emoji}</div>
        <div class="sr-info">
          <div class="sr-ticker">${s.symbol}</div>
          <div class="sr-name">${s.name}</div>
        </div>
        <div class="sr-right">
          <div class="sr-price" id="sp-${s.symbol}">${price}</div>
          <span class="sr-change ${isUp ? 'up' : 'dn'}">${isUp ? '▲' : '▼'} ${Math.abs(d.change).toFixed(2)}%</span>
        </div>
      </div>`;
  });

  res.innerHTML = html;
}

function getEmojiForSymbol(sym) {
  const map = {
    AAPL:'🍎', MSFT:'🪟', GOOGL:'🔍', GOOG:'🔍', AMZN:'📦', TSLA:'⚡', META:'👥', NVDA:'🎮', NFLX:'🎬', SPOT:'🎵', COIN:'🪙', AMD:'💻'
  };
  return map[sym] || '📈';
}

function handleSearchSelectAndOpen(symbol, name, emoji) {
  closeSearch();
  let hist = getHistory();
  hist = hist.filter(h => h.symbol !== symbol);
  hist.unshift({ symbol, name, emoji });
  if (hist.length > 15) hist = hist.slice(0, 15);
  localStorage.setItem('stockx_history', JSON.stringify(hist));
  
  if (typeof openStockDetail === 'function') {
    openStockDetail(symbol, name, emoji);
  }
}

function getHistory() {
  try {
    const hist = JSON.parse(localStorage.getItem('stockx_history'));
    return Array.isArray(hist) ? hist : [];
  } catch (e) { return []; }
}

function clearHistory() {
  localStorage.removeItem('stockx_history');
  renderHistoryView();
}

function renderHistoryView() {
  const wrap = document.getElementById('historyList');
  if (!wrap) return;
  const hist = getHistory();
  wrap.innerHTML = '';

  if (!hist.length) {
    wrap.innerHTML = '<div class="search-hint" style="margin-top:4rem">Your search history is empty.</div>';
    return;
  }

  hist.forEach((s, idx) => {
    let d = liveData[s.symbol];
    if (!d) {
       const sp = getSimPrice(s.symbol);
       d = { price: sp, change: getSimChange(s.symbol), prevClose: sp };
       liveData[s.symbol] = d;
    }
    const isUp = d.change >= 0;
    
    const item = document.createElement('div');
    item.className = 'watch-item fade-in';
    item.style.animationDelay = (idx * 0.06) + 's';
    item.onclick = () => {
      if (typeof openStockDetail === 'function') openStockDetail(s.symbol, s.name, s.emoji);
    };

    item.innerHTML = `
      <div class="watch-logo" style="background:#555222;border-color:#555444">
        <span style="font-size:1.1rem">${s.emoji}</span>
      </div>
      <div class="watch-info">
        <div class="watch-ticker">${s.symbol}</div>
        <div class="watch-name">${s.name}</div>
      </div>
      <canvas class="watch-spark" id="hspark-${s.symbol}"></canvas>
      <div class="watch-right">
        <div class="watch-price" id="hp-${s.symbol}">$${d.price.toFixed(2)}</div>
        <div class="watch-change ${isUp ? 'up' : 'dn'}" id="hc-${s.symbol}">${isUp ? '▲' : '▼'} ${Math.abs(d.change).toFixed(2)}%</div>
      </div>
    `;
    wrap.appendChild(item);
    requestAnimationFrame(() => drawSparklineForCanvas('hspark-' + s.symbol, isUp));
  });
}

function drawSparklineForCanvas(canvasId, isUp) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = 70, h = canvas.height = 38;
  const pts = 20;
  const vals = [];
  let v = 50;
  for (let i = 0; i < pts; i++) {
    v += (Math.random() - (isUp ? 0.42 : 0.58)) * 8;
    v = Math.max(5, Math.min(95, v));
    vals.push(v);
  }
  const min = Math.min(...vals), max = Math.max(...vals);
  const color = isUp ? '#22c55e' : '#e8001d';
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + '44');
  grad.addColorStop(1, color + '00');
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = grad;
  ctx.beginPath();
  vals.forEach((v, i) => {
    const x = (i / (pts - 1)) * w;
    const y = h - ((v - min) / (max - min + 1)) * (h - 4) - 2;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  vals.forEach((v, i) => {
    const x = (i / (pts - 1)) * w;
    const y = h - ((v - min) / (max - min + 1)) * (h - 4) - 2;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
}