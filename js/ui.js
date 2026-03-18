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

  for (let i = 0; i < PORTFOLIO.length; i++) {
    let s = PORTFOLIO[i];
    let d = liveData[s.symbol];
    if (d) {
      total = total + (d.price * s.shares);
      let prev = d.prevClose;
      if (!prev) {
        prev = d.price / (1 + (d.change / 100));
      }
      totalPrev = totalPrev + (prev * s.shares);
    }
  }

  if (total === 0) {
    return;
  }

  let change = total - totalPrev;
  let pct = (change / totalPrev) * 100;
  pct = pct.toFixed(2);

  document.getElementById('totalValue').innerHTML = '<span>$</span>' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let chEl = document.getElementById('totalChange');
  if (change >= 0) {
    chEl.className = 'gains-change up';
    chEl.textContent = '+$' + Math.abs(change).toFixed(2) + ' (+' + pct + '%) today';
  } else {
    chEl.className = 'gains-change dn';
    chEl.textContent = '-$' + Math.abs(change).toFixed(2) + ' (-' + Math.abs(pct) + '%) today';
  }
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
    card.onclick = () => openStockDetail(s.symbol, s.name, s.emoji);
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
  let canvas = document.getElementById('portmini-' + symbol);
  if (!canvas) {
    return;
  }
  let ctx = canvas.getContext('2d');
  let w = canvas.width;
  let h = canvas.height;

  let pts = 12;
  let vals = [];
  let v = 50;
  for (let i = 0; i < pts; i++) {
    let rand = Math.random();
    if (isUp) {
      rand = rand - 0.4;
    } else {
      rand = rand - 0.6;
    }
    v = v + (rand * 10);
    if (v < 10) v = 10;
    if (v > 90) v = 90;
    vals.push(v);
  }

  let min = vals[0];
  let max = vals[0];
  for (let i = 1; i < vals.length; i++) {
    if (vals[i] < min) min = vals[i];
    if (vals[i] > max) max = vals[i];
  }

  let color = '#e8001d';
  if (isUp) {
    color = '#22c55e';
  }

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();

  for (let i = 0; i < vals.length; i++) {
    let x = (i / (pts - 1)) * w;
    let y = h - ((vals[i] - min) / (max - min + 1)) * h;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
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
    item.onclick = () => openStockDetail(s.symbol, s.name, s.emoji);
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
  let canvas = document.getElementById('wspark-' + symbol);
  if (!canvas) {
    return;
  }
  let ctx = canvas.getContext('2d');
  let w = 70;
  let h = 38;
  canvas.width = w;
  canvas.height = h;

  let pts = 20;
  let vals = [];
  let v = 50;
  for (let i = 0; i < pts; i++) {
    let rand = Math.random();
    if (isUp) {
      rand = rand - 0.42;
    } else {
      rand = rand - 0.58;
    }
    v = v + (rand * 8);
    if (v < 5) v = 5;
    if (v > 95) v = 95;
    vals.push(v);
  }

  let min = vals[0];
  let max = vals[0];
  for (let i = 1; i < vals.length; i++) {
    if (vals[i] < min) min = vals[i];
    if (vals[i] > max) max = vals[i];
  }

  let color = '#e8001d';
  if (isUp) {
    color = '#22c55e';
  }

  let grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + '44');
  grad.addColorStop(1, color + '00');
  ctx.clearRect(0, 0, w, h);

  // fill
  ctx.fillStyle = grad;
  ctx.beginPath();
  for (let i = 0; i < vals.length; i++) {
    let x = (i / (pts - 1)) * w;
    let y = h - ((vals[i] - min) / (max - min + 1)) * (h - 4) - 2;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // line
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < vals.length; i++) {
    let x = (i / (pts - 1)) * w;
    let y = h - ((vals[i] - min) / (max - min + 1)) * (h - 4) - 2;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
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
