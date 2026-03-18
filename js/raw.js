/* ═══════════════════════════════════════════════════════
       STOCKX — Home Page Script
       Real-time via Finnhub API (https://finnhub.io)
    ═══════════════════════════════════════════════════════ */

    let API_KEY = localStorage.getItem('stockx_api_key') || 'd6side9r01qj447br9vg';
    let ws = null;
    let gainsChart = null;
    let currentPeriod = '1W';
    let liveData = {};

    // ── Stocks Config ──
    const PORTFOLIO = [
      { symbol: 'AAPL', name: 'Apple Inc.', color: '#555', emoji: '🍎', shares: 5 },
      { symbol: 'LYFT', name: 'Lyft Inc.', color: '#e8198b', emoji: '🚗', shares: 3 },
      { symbol: 'TSLA', name: 'Tesla Inc.', color: '#cc0000', emoji: '⚡', shares: 2 },
      { symbol: 'NVDA', name: 'Nvidia Corp.', color: '#76b900', emoji: '🎮', shares: 4 },
    ];
    const WATCHLIST = [
      { symbol: 'MSFT', name: 'Microsoft Corp.', color: '#00a1f1', emoji: '🪟' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', color: '#4285f4', emoji: '🔍' },
      { symbol: 'SPOT', name: 'Spotify Tech.', color: '#1db954', emoji: '🎵' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', color: '#ff9900', emoji: '📦' },
      { symbol: 'META', name: 'Meta Platforms', color: '#1877f2', emoji: '👥' },
      { symbol: 'AMD', name: 'Adv. Micro Dev.', color: '#ed1c24', emoji: '💻' },
      { symbol: 'COIN', name: 'Coinbase Global', color: '#0052ff', emoji: '🪙' },
      { symbol: 'NFLX', name: 'Netflix Inc.', color: '#e50914', emoji: '🎬' },
      { symbol: 'PLTR', name: 'Palantir Tech.', color: '#1a1a1a', emoji: '🔭' },
      { symbol: 'JPM', name: 'JPMorgan Chase', color: '#211F20', emoji: '🏦' },
    ];
    const ALL_SYMBOLS = [...PORTFOLIO, ...WATCHLIST].map(s => s.symbol);

    // Simulated data for when no API key
    function rnd(base, pct = 0.015) {
      return +(base * (1 + (Math.random() - 0.5) * pct * 2)).toFixed(2);
    }
    const SIM_PRICES = {AAPL:189.50, LYFT:14.82, TSLA:175.20, NVDA:875.40, MSFT:415.10, GOOGL:163.45, SPOT:245.80, AMZN:185.90, META:495.20, AMD:162.30, COIN:255.40, NFLX:620.10, PLTR:22.50, JPM:195.40};
    const SIM_CHANGES = {AAPL:2.3, LYFT:1.8, TSLA:-3.2, NVDA:4.1, MSFT:1.2, GOOGL:-0.8, SPOT:2.5, AMZN:0.9, META:1.4, AMD:-1.2, COIN:5.6, NFLX:0.7, PLTR:-0.5, JPM:0.3};

    function getSimPrice(sym) {
      if (SIM_PRICES[sym]) return SIM_PRICES[sym];
      let h = 0; for(let i=0;i<sym.length;i++) h = sym.charCodeAt(i) + ((h<<5)-h);
      return +(Math.abs(h % 800) + 15.5).toFixed(2);
    }

    function getSimChange(sym) {
      if (SIM_CHANGES[sym] !== undefined) return SIM_CHANGES[sym];
      let h = 0; for(let i=0;i<sym.length;i++) h = sym.charCodeAt(i) + ((h<<5)-h);
      return +((Math.abs(h % 1000) / 100) - 5).toFixed(2);
    }

    // ── Init ──
    window.addEventListener('DOMContentLoaded', () => {
      // API key is pre-configured
      document.getElementById('apiBanner').classList.add('hidden');
      document.getElementById('apiNudge').classList.add('hidden');
      document.getElementById('liveBadge').style.display = 'inline-flex';
      localStorage.setItem('stockx_api_key', API_KEY);
      startLiveData();
      initGainsChart();
      renderPortfolioCards();
      renderWatchlist();
      updateMarketStatus();
      setInterval(updateMarketStatus, 60000);
    });

    // ── API Key ──
    function saveApiKey() {
      const key = document.getElementById('apiKeyInput').value.trim();
      if (!key) return;
      API_KEY = key;
      localStorage.setItem('stockx_api_key', key);
      document.getElementById('apiBanner').classList.add('hidden');
      document.getElementById('apiNudge').classList.add('hidden');
      document.getElementById('liveBadge').style.display = 'inline-flex';
      if (ws) { ws.close(); ws = null; }
      startLiveData();
    }

    // ── Market Status ──
    function isNYSEOpen() {
      const now = new Date();
      const day = now.getUTCDay();
      if (day === 0 || day === 6) return false;
      const mins = now.getUTCHours() * 60 + now.getUTCMinutes();
      return mins >= (14 * 60 + 30) && mins < (21 * 60);
    }

    function updateMarketStatus() {
      const el = document.getElementById('marketStatus');
      const now = new Date();
      if (isNYSEOpen()) {
        el.innerHTML = '<span style="color:var(--green)">● NYSE Live</span>';
      } else {
        // Show IST time when market opens
        const openIST = '7:00 PM IST';
        el.innerHTML = `<span style="color:var(--muted)">● NYSE Closed &nbsp;·&nbsp; Opens ${openIST}</span>`;
      }
      document.getElementById('lastUpdated').textContent = 'Updated ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // ── Data Engine ──
    // Base prices from Finnhub REST — stays accurate
    // Micro-simulation runs on top so UI is always alive
    // WebSocket overrides with real trades when NYSE is open

    let simInterval = null;
    let restInterval = null;
    let wsReconnectTimer = null;

    async function startLiveData() {
      document.getElementById('liveBadge').style.display = 'inline-flex';

      // 1. Fetch real prices immediately
      await fetchAllQuotes();
      updateAllUI();

      // 2. Always run micro-simulation (1.5s ticks) so UI is alive
      startMicroSimulation();

      // 3. Refresh real base prices every 15 seconds
      restInterval = setInterval(async () => {
        await fetchAllQuotes();
        updateAllUI();
        document.getElementById('lastUpdated').textContent =
          'Updated ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }, 15000);

      // 4. WebSocket for real ticks when market is open
      startWebSocket();
    }

    async function fetchAllQuotes() {
      // Fetch all symbols in parallel
      await Promise.allSettled(ALL_SYMBOLS.map(fetchQuote));
    }

    async function fetchQuote(symbol) {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
        );
        const d = await res.json();
        if (d && d.c && d.c > 0) {
          // Store real data — simulation will use d.c as base
          liveData[symbol] = {
            price: d.c,
            basePrice: d.c,        // anchor for simulation
            change: d.dp || 0,
            open: d.o || d.c,
            high: d.h || d.c,
            low: d.l || d.c,
            prevClose: d.pc || d.c,
            realPrice: d.c,        // last confirmed real price
          };
        } else if (!liveData[symbol]) {
          // Fallback to sim prices if Finnhub returns nothing
          const sp = getSimPrice(symbol);
          liveData[symbol] = { price: sp, basePrice: sp, change: getSimChange(symbol), prevClose: sp, realPrice: sp };
        }
      } catch (e) {
        if (!liveData[symbol]) {
          const sp = getSimPrice(symbol);
          liveData[symbol] = { price: sp, basePrice: sp, change: getSimChange(symbol), prevClose: sp, realPrice: sp };
        }
      }
    }

    // Micro-simulation: applies tiny ±0.04% random walk every 1.5s
    // Makes UI feel alive even when market is closed
    function startMicroSimulation() {
      if (simInterval) clearInterval(simInterval);
      simInterval = setInterval(() => {
        let changed = false;
        ALL_SYMBOLS.forEach(sym => {
          const d = liveData[sym];
          if (!d) return;
          // Small random walk: ±0.04% per tick
          const delta = d.price * (Math.random() - 0.499) * 0.0008;
          const newPrice = +(d.price + delta).toFixed(4);
          // Don't drift more than 0.8% from real base price
          const drift = Math.abs((newPrice - d.realPrice) / d.realPrice);
          d.price = drift > 0.008
            ? +(d.price + (d.realPrice - d.price) * 0.15).toFixed(4)  // pull back toward real
            : newPrice;
          const pc = d.prevClose || d.realPrice;
          d.change = +((d.price - pc) / pc * 100).toFixed(3);
          // Flash a random subset for visual interest
          if (Math.random() > 0.65) {
            flashPrice(sym, delta > 0 ? 'up' : 'dn');
          }
          changed = true;
        });
        if (changed) updateAllUI();
      }, 1500);
    }

    function startWebSocket() {
      if (ws) { try { ws.close(); } catch (_) { } }
      ws = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);
      ws.onopen = () => {
        console.log('WS connected');
        ALL_SYMBOLS.forEach(sym =>
          ws.send(JSON.stringify({ type: 'subscribe', symbol: sym }))
        );
      };
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'trade' && data.data) {
            data.data.forEach(t => {
              const sym = t.s;
              if (liveData[sym] && t.p > 0) {
                const old = liveData[sym].price;
                // Real trade overrides simulation
                liveData[sym].price = t.p;
                liveData[sym].realPrice = t.p;   // update anchor
                liveData[sym].basePrice = t.p;
                const pc = liveData[sym].prevClose || t.p;
                liveData[sym].change = +((t.p - pc) / pc * 100).toFixed(3);
                flashPrice(sym, t.p > old ? 'up' : 'dn');
              }
            });
            updateAllUI();
          }
        } catch (_) { }
      };
      ws.onerror = () => { };
      ws.onclose = () => {
        // Reconnect after 4s
        if (wsReconnectTimer) clearTimeout(wsReconnectTimer);
        wsReconnectTimer = setTimeout(() => {
          if (API_KEY) startWebSocket();
        }, 4000);
      };
    }

    // ── UI Updates ──
    function updateAllUI() {
      updateTotalValue();
      updatePortfolioCards();
      updateWatchlistPrices();
      if (document.getElementById('historyView').style.display === 'block') {
         updateHistoryPrices(); 
      }
    }

    function updateHistoryPrices() {
      const hist = getHistory();
      hist.forEach(s => {
        const d = liveData[s.symbol];
        if (!d) return;
        const pEl = document.getElementById('hp-' + s.symbol);
        const cEl = document.getElementById('hc-' + s.symbol);
        if (pEl) pEl.textContent = '$' + d.price.toFixed(2);
        if (cEl) {
          const isUp = d.change >= 0;
          cEl.className = 'watch-change ' + (isUp ? 'up' : 'dn');
          cEl.textContent = (isUp ? '▲ ' : '▼ ') + Math.abs(d.change).toFixed(2) + '%';
        }
      });
    }

    function updateTotalValue() {
      let total = 0;
      let totalPrev = 0;
      PORTFOLIO.forEach(s => {
        const d = liveData[s.symbol];
        if (d) {
          total += d.price * s.shares;
          const prev = d.prevClose || (d.price / (1 + d.change / 100));
          totalPrev += prev * s.shares;
        }
      });
      if (total === 0) return;
      const change = total - totalPrev;
      const pct = ((change / totalPrev) * 100).toFixed(2);
      document.getElementById('totalValue').innerHTML =
        `<span>$</span>${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const chEl = document.getElementById('totalChange');
      chEl.className = 'gains-change ' + (change >= 0 ? 'up' : 'dn');
      chEl.textContent = (change >= 0 ? '+' : '') + `$${Math.abs(change).toFixed(2)} (${change >= 0 ? '+' : ''}${pct}%) today`;
    }

    // ── Gains Chart ──
    function initGainsChart() {
      const ctx = document.getElementById('gainsChart').getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 110);
      grad.addColorStop(0, 'rgba(232,0,29,0.35)');
      grad.addColorStop(1, 'rgba(232,0,29,0)');
      const data = genChartData(currentPeriod);
      gainsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.values,
            borderColor: '#e8001d',
            borderWidth: 2.5,
            backgroundColor: grad,
            fill: true,
            tension: 0.45,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#e8001d',
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: { duration: 600, easing: 'easeInOutQuart' },
          plugins: {
            legend: { display: false }, tooltip: {
              callbacks: { label: ctx => '$' + ctx.parsed.y.toLocaleString() },
              backgroundColor: 'rgba(20,20,20,0.9)',
              borderColor: 'rgba(232,0,29,0.4)', borderWidth: 1,
              titleColor: '#aaa', bodyColor: '#fff',
            }
          },
          scales: {
            x: { display: false },
            y: { display: false },
          },
          interaction: { mode: 'index', intersect: false },
        }
      });
    }

    function genChartData(period) {
      const counts = { '1D': 48, '1W': 42, '1M': 30, '3M': 45, '1Y': 52 };
      const n = counts[period] || 42;
      const base = 24000 + Math.random() * 2000;
      let val = base;
      const values = [];
      const labels = [];
      for (let i = 0; i < n; i++) {
        val += (Math.random() - 0.46) * 300;
        if (val < base * 0.85) val = base * 0.85;
        values.push(+val.toFixed(2));
        labels.push('');
      }
      return { values, labels };
    }

    function setPeriod(p, btn) {
      currentPeriod = p;
      document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('periodLabel').textContent = p;
      const data = genChartData(p);
      gainsChart.data.labels = data.labels;
      gainsChart.data.datasets[0].data = data.values;
      gainsChart.update();
    }

    function cyclePeriod() {
      const periods = ['1D', '1W', '1M', '3M', '1Y'];
      const i = periods.indexOf(currentPeriod);
      const next = periods[(i + 1) % periods.length];
      const btn = [...document.querySelectorAll('.period-tab')].find(b => b.textContent === next);
      if (btn) setPeriod(next, btn);
    }

    // ── Portfolio Cards ──
    const portMiniCharts = {};
    function renderPortfolioCards() {
      const wrap = document.getElementById('portfolioCards');
      wrap.innerHTML = '';
      PORTFOLIO.forEach((s, idx) => {
        const d = liveData[s.symbol] || {};
        const price = d.price || SIM_PRICES[s.symbol] || '—';
        const change = d.change || SIM_CHANGES[s.symbol] || 0;
        const isUp = change >= 0;
        const card = document.createElement('div');
        card.className = 'port-card fade-in' + (idx === 0 ? ' active-card' : '');
        card.style.animationDelay = (idx * 0.08) + 's';
        card.id = 'portcard-' + s.symbol;
        card.innerHTML = `
      <div class="port-card-top">
        <div class="port-logo" style="background:${s.color}22;border-color:${s.color}44">
          <span style="font-size:1.2rem">${s.emoji}</span>
        </div>
        <canvas class="port-mini-chart" id="portmini-${s.symbol}"></canvas>
      </div>
      <div class="port-ticker">${s.symbol}</div>
      <div class="port-name">${s.name}</div>
      <div class="port-price" id="pp-${s.symbol}">$${typeof price === 'number' ? price.toFixed(2) : price}</div>
      <div class="port-change ${isUp ? 'up' : 'dn'}" id="pc-${s.symbol}">${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%</div>
    `;
        wrap.appendChild(card);
        // draw mini chart after DOM insert
        requestAnimationFrame(() => drawMiniChart(s.symbol, isUp));
      });
    }

    function drawMiniChart(symbol, isUp) {
      const canvas = document.getElementById('portmini-' + symbol);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height;
      // Generate small sparkline
      const pts = 12;
      const vals = [];
      let v = 50;
      for (let i = 0; i < pts; i++) {
        v += (Math.random() - (isUp ? 0.4 : 0.6)) * 10;
        v = Math.max(10, Math.min(90, v));
        vals.push(v);
      }
      const min = Math.min(...vals), max = Math.max(...vals);
      const color = isUp ? '#22c55e' : '#e8001d';
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      vals.forEach((v, i) => {
        const x = (i / (pts - 1)) * w;
        const y = h - ((v - min) / (max - min + 1)) * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      portMiniCharts[symbol] = vals;
    }

    function updatePortfolioCards() {
      PORTFOLIO.forEach(s => {
        const d = liveData[s.symbol];
        if (!d) return;
        const pEl = document.getElementById('pp-' + s.symbol);
        const cEl = document.getElementById('pc-' + s.symbol);
        if (pEl) pEl.textContent = '$' + d.price.toFixed(2);
        if (cEl) {
          const isUp = d.change >= 0;
          cEl.className = 'port-change ' + (isUp ? 'up' : 'dn');
          cEl.textContent = (isUp ? '▲ ' : '▼ ') + Math.abs(d.change).toFixed(2) + '%';
        }
      });
    }

    // ── Watchlist ──
    const watchSparkCharts = {};
    function renderWatchlist() {
      const wrap = document.getElementById('watchlist');
      wrap.innerHTML = '';
      WATCHLIST.forEach((s, idx) => {
        const d = liveData[s.symbol] || {};
        const price = d.price || SIM_PRICES[s.symbol] || '—';
        const change = d.change || SIM_CHANGES[s.symbol] || 0;
        const isUp = change >= 0;
        const item = document.createElement('div');
        item.className = 'watch-item fade-in';
        item.style.animationDelay = (idx * 0.09) + 's';
        item.id = 'witem-' + s.symbol;
        item.innerHTML = `
      <div class="watch-logo" style="background:${s.color}22;border-color:${s.color}44">
        <span style="font-size:1.1rem">${s.emoji}</span>
      </div>
      <div class="watch-info">
        <div class="watch-ticker">${s.symbol}</div>
        <div class="watch-name">${s.name}</div>
      </div>
      <canvas class="watch-spark" id="wspark-${s.symbol}"></canvas>
      <div class="watch-right">
        <div class="watch-price" id="wp-${s.symbol}">$${typeof price === 'number' ? price.toFixed(2) : price}</div>
        <div class="watch-change ${isUp ? 'up' : 'dn'}" id="wc-${s.symbol}">${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%</div>
      </div>
    `;
        wrap.appendChild(item);
        requestAnimationFrame(() => drawSparkline(s.symbol, isUp));
      });
    }

    function drawSparkline(symbol, isUp) {
      const canvas = document.getElementById('wspark-' + symbol);
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
      // fill
      ctx.fillStyle = grad;
      ctx.beginPath();
      vals.forEach((v, i) => {
        const x = (i / (pts - 1)) * w;
        const y = h - ((v - min) / (max - min + 1)) * (h - 4) - 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.fill();
      // line
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

    function updateWatchlistPrices() {
      WATCHLIST.forEach(s => {
        const d = liveData[s.symbol];
        if (!d) return;
        const pEl = document.getElementById('wp-' + s.symbol);
        const cEl = document.getElementById('wc-' + s.symbol);
        if (pEl) pEl.textContent = '$' + d.price.toFixed(2);
        if (cEl) {
          const isUp = d.change >= 0;
          cEl.className = 'watch-change ' + (isUp ? 'up' : 'dn');
          cEl.textContent = (isUp ? '▲ ' : '▼ ') + Math.abs(d.change).toFixed(2) + '%';
        }
      });
    }

    // ── Flash price on change ──
    function flashPrice(symbol, dir) {
      const el = document.getElementById('wp-' + symbol) || document.getElementById('pp-' + symbol) || document.getElementById('hp-' + symbol) || document.getElementById('sp-' + symbol);
      if (!el) return;
      el.classList.remove('price-up-flash', 'price-dn-flash');
      void el.offsetWidth;
      el.classList.add(dir === 'up' ? 'price-up-flash' : 'price-dn-flash');
    }

    // ── Nav ──
    function setNav(el, targetId) {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      el.classList.add('active');
      
      // View switching
      document.getElementById('homeView').style.display = 'none';
      document.getElementById('historyView').style.display = 'none';
      document.getElementById(targetId).style.display = 'block';
      
      if (targetId === 'historyView') {
        renderHistoryView();
      }
    }

    // ── Search ── (Powered by Finnhub real symbol search)
    let searchTimer = null;

    function openSearch() {
      document.getElementById('searchOverlay').classList.add('open');
      setTimeout(() => document.getElementById('searchInput').focus(), 150);
      document.body.style.overflow = 'hidden';
      showDefaultSearchResults();
    }

    function closeSearch() {
      document.getElementById('searchOverlay').classList.remove('open');
      document.getElementById('searchInput').value = '';
      document.body.style.overflow = '';
    }

    function handleOverlayClick(e) {
      if (e.target === document.getElementById('searchOverlay')) closeSearch();
    }

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

    function showDefaultSearchResults() {
      // Show all tracked stocks on open (before any search)
      const defaults = [
        ...PORTFOLIO, ...WATCHLIST,
        { symbol: 'AMZN', name: 'Amazon.com', emoji: '📦' },
        { symbol: 'META', name: 'Meta Platforms', emoji: '👥' },
        { symbol: 'NFLX', name: 'Netflix', emoji: '🎬' },
        { symbol: 'AMD', name: 'AMD', emoji: '💻' },
      ];
      renderSearchItems(defaults, true);
    }

    async function doSearch(query) {
      const q = query.trim();
      const res = document.getElementById('searchResults');
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
        try {
          // Use Finnhub symbol search API — searches ALL companies worldwide
          const resp = await fetch(
            `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${API_KEY}`
          );
          const data = await resp.json();

          if (!data.result || data.result.length === 0) {
            res.innerHTML = `<div class="search-hint">No results found for "<b style="color:#fff">${q}</b>"</div>`;
            return;
          }

          // Filter to common stock (type=Common Stock) and limit to 15
          const items = data.result
            .filter(r => r.type === 'Common Stock' || r.type === '' || r.type === 'EQS')
            .slice(0, 15)
            .map(r => ({
              symbol: r.symbol,
              name: r.description || r.displaySymbol,
              emoji: getEmojiForSymbol(r.symbol),
            }));

          // Fetch live quotes for the top 5 results in parallel
          const top5 = items.slice(0, 5);
          await Promise.all(top5.map(async (s) => {
            if (!liveData[s.symbol]) {
              try {
                const qr = await fetch(
                  `https://finnhub.io/api/v1/quote?symbol=${s.symbol}&token=${API_KEY}`
                );
                const qd = await qr.json();
                if (qd && qd.c && qd.c > 0) {
                  liveData[s.symbol] = { price: qd.c, change: qd.dp || 0, prevClose: qd.pc };
                } else {
                  liveData[s.symbol] = { price: getSimPrice(s.symbol), change: getSimChange(s.symbol), prevClose: getSimPrice(s.symbol) };
                }
              } catch (_) {
                liveData[s.symbol] = { price: getSimPrice(s.symbol), change: getSimChange(s.symbol), prevClose: getSimPrice(s.symbol) };
              }
            }
          }));

          renderSearchItems(items, false);
        } catch (err) {
          res.innerHTML = `<div class="search-hint">Error fetching results. Check connection.</div>`;
        }
      }, 400);
    }

    function renderSearchItems(items, isDefault) {
      const res = document.getElementById('searchResults');
      if (!items.length) {
        res.innerHTML = '<div class="search-hint">No results found</div>';
        return;
      }
      const label = isDefault ? '<div class="search-section-label">Popular Stocks</div>' : '';
      res.innerHTML = label + items.map((s, i) => {
        let d = liveData[s.symbol];
        // GUARANTEE: If Finnhub failed, rate-limited, or this is > top 5, generate realistic fallback immediately
        if (!d || typeof d.price !== 'number' || d.price <= 0) {
          const sp = getSimPrice(s.symbol);
          d = { price: sp, change: getSimChange(s.symbol), prevClose: sp, realPrice: sp };
          liveData[s.symbol] = d; // save it so the micro-simulator starts ticking it immediately
        }
        
        const price = '$' + d.price.toFixed(2);
        const change = d.change || 0;
        const isUp = change >= 0;
        const chStr = `<span class="sr-change ${isUp ? 'up' : 'dn'}">${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%</span>`;
        
        return `
      <div class="search-result-item" style="animation-delay:${i * 0.04}s" onclick="handleSearchSelect('${s.symbol}', '${s.name.replace(/'/g, "\\'")}', '${s.emoji}')">
        <div class="sr-emoji">${s.emoji}</div>
        <div class="sr-info">
          <div class="sr-ticker">${s.symbol}</div>
          <div class="sr-name">${s.name}</div>
        </div>
        <div class="sr-right">
          <div class="sr-price" id="sp-${s.symbol}">${price}</div>
          ${chStr}
        </div>
      </div>`;
      }).join('');
    }

    function getEmojiForSymbol(sym) {
      const map = {
        AAPL: '🍎', MSFT: '🪟', GOOGL: '🔍', GOOG: '🔍', AMZN: '📦',
        TSLA: '⚡', META: '👥', NVDA: '🎮', NFLX: '🎬', SPOT: '🎵',
        LYFT: '🚗', UBER: '🚕', AMD: '💻', INTC: '🔵', BABA: '🛍️',
        DIS: '🏰', BRKB: '💼', JPM: '🏦', BAC: '🏦', WMT: '🛒',
        V: '💳', MA: '💳', PFE: '💊', JNJ: '💉', KO: '🥤',
        PEP: '🥤', SBUX: '☕', MCD: '🍔', PYPL: '💸', SQ: '💸',
        COIN: '🪙', HOOD: '🏹', PLTR: '🔭', SOFI: '📱', GME: '🎲',
        AMC: '🎭', BB: '📟', NOK: '📞', T: '📡', VZ: '📶',
        BA: '✈️', GE: '⚙️', F: '🚙', GM: '🚗', RIVN: '🚐',
        LCID: '🔋', NIO: '🚘', TM: '🏎️', TSM: '🔬', ASML: '🔬',
      };
      return map[sym] || '📈';
    }

    // ── Search History ──
    function getHistory() {
      try {
        const hist = JSON.parse(localStorage.getItem('stockx_history'));
        return Array.isArray(hist) ? hist : [];
      } catch (e) { return []; }
    }

    function handleSearchSelect(symbol, name, emoji) {
      closeSearch();
      let hist = getHistory();
      
      // Remove if already exists to move it to the top
      hist = hist.filter(h => h.symbol !== symbol);
      
      // Add to front
      hist.unshift({ symbol, name, emoji });
      
      // Keep max 15
      if (hist.length > 15) hist = hist.slice(0, 15);
      
      localStorage.setItem('stockx_history', JSON.stringify(hist));
      
      // Navigate to History Tab immediately
      const historyNavBtn = document.querySelectorAll('.nav-item')[3]; // 4th item is history
      if (historyNavBtn) setNav(historyNavBtn, 'historyView');
    }

    function clearHistory() {
      localStorage.removeItem('stockx_history');
      renderHistoryView();
    }

    function renderHistoryView() {
      const wrap = document.getElementById('historyList');
      const hist = getHistory();
      wrap.innerHTML = '';
      
      if (!hist.length) {
        wrap.innerHTML = '<div class="search-hint" style="margin-top:4rem">Your search history is empty.</div>';
        return;
      }

      hist.forEach((s, idx) => {
        const d = liveData[s.symbol] || {};
        const price = d.price || getSimPrice(s.symbol);
        const change = d.change || getSimChange(s.symbol);
        const isUp = change >= 0;
        
        // Ensure it's in liveData so it updates globally
        if (!liveData[s.symbol]) liveData[s.symbol] = { price, change, prevClose: price, realPrice: price, basePrice: price };
        if (!ALL_SYMBOLS.includes(s.symbol)) {
          ALL_SYMBOLS.push(s.symbol);
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'subscribe', symbol: s.symbol }));
          }
        }

        const item = document.createElement('div');
        item.className = 'watch-item fade-in';
        item.style.animationDelay = (idx * 0.06) + 's';
        item.id = 'hitem-' + s.symbol;
        
        // Use a default color for random stocks
        const color = '#555';

        item.innerHTML = `
          <div class="watch-logo" style="background:${color}22;border-color:${color}44">
            <span style="font-size:1.1rem">${s.emoji}</span>
          </div>
          <div class="watch-info">
            <div class="watch-ticker">${s.symbol}</div>
            <div class="watch-name">${s.name}</div>
          </div>
          <canvas class="watch-spark" id="hspark-${s.symbol}"></canvas>
          <div class="watch-right">
            <div class="watch-price" id="hp-${s.symbol}">$${price.toFixed(2)}</div>
            <div class="watch-change ${isUp ? 'up' : 'dn'}" id="hc-${s.symbol}">${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%</div>
          </div>
        `;
        wrap.appendChild(item);
        
        // Draw sparkline just like watchlist
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
      // fill
      ctx.fillStyle = grad;
      ctx.beginPath();
      vals.forEach((v, i) => {
        const x = (i / (pts - 1)) * w;
        const y = h - ((v - min) / (max - min + 1)) * (h - 4) - 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.fill();
      // line
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