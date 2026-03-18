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
  if (day === 0) {
    return false;
  }
  if (day === 6) {
    return false;
  }
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();
  const mins = (hour * 60) + minute;

  const marketOpen = (14 * 60) + 30;
  const marketClose = 21 * 60;

  if (mins >= marketOpen && mins < marketClose) {
    return true;
  } else {
    return false;
  }
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
  for (let i = 0; i < ALL_SYMBOLS.length; i++) {
    await fetchQuote(ALL_SYMBOLS[i]);
  }
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
  if (simInterval) {
    clearInterval(simInterval);
  }
  simInterval = setInterval(() => {
    let changed = false;
    for (let i = 0; i < ALL_SYMBOLS.length; i++) {
      let sym = ALL_SYMBOLS[i];
      let d = liveData[sym];
      if (!d) {
        continue;
      }

      let randomFactor = Math.random() - 0.499;
      let delta = d.price * randomFactor * 0.0008;
      let newPrice = d.price + delta;
      newPrice = Number(newPrice.toFixed(4));

      let drift = Math.abs((newPrice - d.realPrice) / d.realPrice);

      if (drift > 0.008) {
        let correction = (d.realPrice - d.price) * 0.15;
        d.price = Number((d.price + correction).toFixed(4));
      } else {
        d.price = newPrice;
      }

      let pc = d.prevClose;
      if (!pc) {
        pc = d.realPrice;
      }

      let changePercent = ((d.price - pc) / pc) * 100;
      d.change = Number(changePercent.toFixed(3));

      if (Math.random() > 0.65) {
        if (delta > 0) {
          flashPrice(sym, 'up');
        } else {
          flashPrice(sym, 'dn');
        }
      }
      changed = true;
    }
    if (changed) {
      updateAllUI();
    }
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
