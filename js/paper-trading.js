//  PAPER TRADING ENGINE
// ══════════════════════════════════════════

const PT_INITIAL_BALANCE = 100000;

function getPT() {
  try {
    const s = localStorage.getItem('stockx_paper_trading');
    if (s) {
      const data = JSON.parse(s);
      if (data && typeof data.cash === 'number') return data;
    }
  } catch (e) { }
  return { cash: PT_INITIAL_BALANCE, holdings: {}, trades: [] };
}

function savePT(pt) {
  localStorage.setItem('stockx_paper_trading', JSON.stringify(pt));
}

function resetPaperTrading() {
  if (!confirm('Reset your paper trading account? All holdings and trade history will be lost.')) return;
  localStorage.removeItem('stockx_paper_trading');
  renderPaperTradingView();
}

// Update order total in stock detail modal
function updateOrderTotal() {
  if (!detailSymbol) return;
  const qty = parseInt(document.getElementById('sdQtyInput').value) || 0;
  const d = liveData[detailSymbol];
  const price = d ? d.price : 0;
  const total = qty * price;
  document.getElementById('sdOrderTotal').innerHTML = qty > 0 ? `Total: <b>$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>` : '';

  // Update buy/sell button states
  const pt = getPT();
  const buyBtn = document.getElementById('sdBuyBtn');
  const sellBtn = document.getElementById('sdSellBtn');
  const holding = pt.holdings[detailSymbol];
  buyBtn.disabled = qty <= 0 || total > pt.cash;
  sellBtn.disabled = qty <= 0 || !holding || holding.qty < qty;
}

function setQty(n) {
  document.getElementById('sdQtyInput').value = n;
  updateOrderTotal();
}

function updateDetailTradeInfo() {
  if (!detailSymbol) return;
  const pt = getPT();
  document.getElementById('sdWalletBal').textContent = '$' + pt.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const holding = pt.holdings[detailSymbol];
  const infoEl = document.getElementById('sdHoldingInfo');
  if (holding && holding.qty > 0) {
    infoEl.style.display = 'flex';
    document.getElementById('sdOwnedQty').textContent = holding.qty + ' share' + (holding.qty > 1 ? 's' : '');
    document.getElementById('sdAvgPrice').textContent = '$' + holding.avgPrice.toFixed(2);
  } else {
    infoEl.style.display = 'none';
  }
  updateOrderTotal();
}

function executeTrade(type) {
  if (!detailSymbol) return;
  const qty = parseInt(document.getElementById('sdQtyInput').value) || 0;
  if (qty <= 0) return;

  const d = liveData[detailSymbol];
  if (!d) return;
  const price = d.price;
  const total = qty * price;
  const pt = getPT();
  const msgEl = document.getElementById('sdTradeMsg');

  if (type === 'buy') {
    if (total > pt.cash) {
      msgEl.className = 'sd-trade-msg error';
      msgEl.textContent = '❌ Insufficient funds!';
      setTimeout(() => { msgEl.textContent = ''; }, 2500);
      return;
    }
    pt.cash -= total;
    if (!pt.holdings[detailSymbol]) {
      pt.holdings[detailSymbol] = { qty: 0, avgPrice: 0, totalCost: 0, name: document.getElementById('sdName').textContent, emoji: document.getElementById('sdEmoji').textContent };
    }
    const h = pt.holdings[detailSymbol];
    h.totalCost += total;
    h.qty += qty;
    h.avgPrice = h.totalCost / h.qty;

    pt.trades.unshift({
      type: 'buy',
      symbol: detailSymbol,
      name: h.name,
      emoji: h.emoji,
      qty: qty,
      price: price,
      total: total,
      time: Date.now()
    });

    savePT(pt);
    msgEl.className = 'sd-trade-msg success';
    msgEl.textContent = `✅ Bought ${qty} ${detailSymbol} @ $${price.toFixed(2)}`;
  }
  else if (type === 'sell') {
    const h = pt.holdings[detailSymbol];
    if (!h || h.qty < qty) {
      msgEl.className = 'sd-trade-msg error';
      msgEl.textContent = '❌ Not enough shares to sell!';
      setTimeout(() => { msgEl.textContent = ''; }, 2500);
      return;
    }
    pt.cash += total;
    const costBasis = h.avgPrice * qty;
    const pnl = total - costBasis;
    h.qty -= qty;
    h.totalCost = h.qty * h.avgPrice;
    if (h.qty <= 0) {
      delete pt.holdings[detailSymbol];
    }

    pt.trades.unshift({
      type: 'sell',
      symbol: detailSymbol,
      name: document.getElementById('sdName').textContent,
      emoji: document.getElementById('sdEmoji').textContent,
      qty: qty,
      price: price,
      total: total,
      pnl: pnl,
      time: Date.now()
    });

    savePT(pt);
    const pnlStr = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
    msgEl.className = 'sd-trade-msg ' + (pnl >= 0 ? 'success' : 'error');
    msgEl.textContent = `✅ Sold ${qty} ${detailSymbol} @ $${price.toFixed(2)} (${pnlStr})`;
  }

  setTimeout(() => { msgEl.textContent = ''; }, 3500);
  updateDetailTradeInfo();
}

// Hook into openStockDetail to also update trade info
const _origOpenStockDetail = openStockDetail;
openStockDetail = async function (symbol, name, emoji) {
  await _origOpenStockDetail(symbol, name, emoji);
  document.getElementById('sdQtyInput').value = 1;
  document.getElementById('sdTradeMsg').textContent = '';
  updateDetailTradeInfo();
};

// ── Paper Trading View Rendering ──
let ptUpdateInterval = null;

function renderPaperTradingView() {
  updatePTWallet();
  renderPTHoldings();
  renderPTTrades();

  // Live update holdings P&L
  if (ptUpdateInterval) clearInterval(ptUpdateInterval);
  ptUpdateInterval = setInterval(() => {
    if (document.getElementById('paperTradingView').style.display !== 'none') {
      updatePTWallet();
      updatePTHoldingsLive();
    }
  }, 1500);
}

function updatePTWallet() {
  const pt = getPT();
  let investedValue = 0;
  let totalCost = 0;
  Object.keys(pt.holdings).forEach(sym => {
    const h = pt.holdings[sym];
    const d = liveData[sym];
    const currentPrice = d ? d.price : getSimPrice(sym);
    investedValue += currentPrice * h.qty;
    totalCost += h.avgPrice * h.qty;
  });
  const totalValue = pt.cash + investedValue;
  const totalPnl = totalValue - PT_INITIAL_BALANCE;

  document.getElementById('ptTotalValue').textContent = '$' + totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('ptCashBal').textContent = '$' + pt.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('ptInvested').textContent = '$' + investedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const pnlEl = document.getElementById('ptTotalPnl');
  pnlEl.textContent = (totalPnl >= 0 ? '+' : '') + '$' + totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  pnlEl.className = 'pt-wallet-stat-val ' + (totalPnl >= 0 ? 'up' : 'dn');
}

function renderPTHoldings() {
  const pt = getPT();
  const wrap = document.getElementById('ptHoldingsList');
  const syms = Object.keys(pt.holdings);

  if (!syms.length) {
    wrap.innerHTML = `
          <div class="pt-empty">
            <div class="pt-empty-icon">📭</div>
            <div class="pt-empty-title">No Holdings Yet</div>
            <div class="pt-empty-desc">Click on any stock and use the Buy button to start paper trading!</div>
          </div>`;
    return;
  }

  let html = '';
  for (let i = 0; i < syms.length; i++) {
    let sym = syms[i];
    let h = pt.holdings[sym];
    let d = liveData[sym];
    let currentPrice = getSimPrice(sym);
    if (d) {
      currentPrice = d.price;
    }
    let currentValue = currentPrice * h.qty;
    let pnl = currentValue - (h.avgPrice * h.qty);
    let pnlPct = ((pnl / (h.avgPrice * h.qty)) * 100).toFixed(2);
    let isUp = false;
    if (pnl >= 0) {
      isUp = true;
    }
    let emoji = h.emoji;
    if (!emoji) {
      emoji = getEmojiForSymbol(sym);
    }

    if (!liveData[sym]) {
      let simP = getSimPrice(sym);
      let simC = getSimChange(sym);
      liveData[sym] = { price: simP, change: simC, prevClose: simP, realPrice: simP, basePrice: simP };
    }

    let found = false;
    for (let j = 0; j < ALL_SYMBOLS.length; j++) {
      if (ALL_SYMBOLS[j] === sym) {
        found = true;
        break;
      }
    }
    if (!found) {
      ALL_SYMBOLS.push(sym);
    }

    let htmlName = h.name;
    if (!htmlName) htmlName = sym;
    htmlName = htmlName.replace(/'/g, "\\'");

    let upArrow = '▼';
    if (isUp) upArrow = '▲';
    let upClass = 'dn';
    if (isUp) upClass = 'up';

    html = html + '<div class="pt-holding" onclick="openStockDetail(\'' + sym + '\', \'' + htmlName + '\', \'' + emoji + '\')">';
    html = html + '<div class="pt-holding-emoji">' + emoji + '</div>';
    html = html + '<div class="pt-holding-info">';
    html = html + '<div class="pt-holding-ticker">' + sym + '</div>';
    html = html + '<div class="pt-holding-shares">' + h.qty + ' shares · Avg $' + h.avgPrice.toFixed(2) + '</div>';
    html = html + '</div>';
    html = html + '<div class="pt-holding-right">';
    html = html + '<div class="pt-holding-value" id="ptv-' + sym + '">$' + currentValue.toFixed(2) + '</div>';
    html = html + '<div class="pt-holding-pnl ' + upClass + '" id="ptp-' + sym + '">';
    html = html + upArrow + ' $' + Math.abs(pnl).toFixed(2) + ' (' + pnlPct + '%)';
    html = html + '</div>';
    html = html + '</div>';
    html = html + '</div>';
  }
  wrap.innerHTML = html;
}

function updatePTHoldingsLive() {
  const pt = getPT();
  Object.keys(pt.holdings).forEach(sym => {
    const h = pt.holdings[sym];
    const d = liveData[sym];
    if (!d) return;
    const currentValue = d.price * h.qty;
    const pnl = currentValue - (h.avgPrice * h.qty);
    const pnlPct = ((pnl / (h.avgPrice * h.qty)) * 100).toFixed(2);
    const isUp = pnl >= 0;
    const valEl = document.getElementById('ptv-' + sym);
    const pnlEl = document.getElementById('ptp-' + sym);
    if (valEl) valEl.textContent = '$' + currentValue.toFixed(2);
    if (pnlEl) {
      pnlEl.className = 'pt-holding-pnl ' + (isUp ? 'up' : 'dn');
      pnlEl.textContent = `${isUp ? '▲' : '▼'} $${Math.abs(pnl).toFixed(2)} (${pnlPct}%)`;
    }
  });
}

function renderPTTrades() {
  const pt = getPT();
  const wrap = document.getElementById('ptTradesList');

  if (!pt.trades.length) {
    wrap.innerHTML = `
          <div class="pt-empty">
            <div class="pt-empty-icon">📋</div>
            <div class="pt-empty-title">No Trades Yet</div>
            <div class="pt-empty-desc">Your trade history will appear here after your first trade.</div>
          </div>`;
    return;
  }

  let html = '';
  for (let i = 0; i < pt.trades.length; i++) {
    let t = pt.trades[i];
    let time = new Date(t.time);
    let timeStr = time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' + time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    let pnlStr = '';
    if (t.type === 'sell' && t.pnl !== undefined) {
      let pClass = 'dn';
      let pSign = '';
      if (t.pnl >= 0) {
        pClass = 'up';
        pSign = '+';
      }
      pnlStr = ' <span class="' + pClass + '">(' + pSign + '$' + t.pnl.toFixed(2) + ')</span>';
    }

    let em = t.emoji;
    if (!em) em = '📈';

    html = html + '<div class="pt-trade">';
    html = html + '<div class="pt-trade-type ' + t.type + '">' + t.type + '</div>';
    html = html + '<div class="pt-trade-info">';
    html = html + '<div class="pt-trade-sym">' + em + ' ' + t.symbol + '</div>';
    html = html + '<div class="pt-trade-detail">' + t.qty + ' shares @ $' + t.price.toFixed(2) + '</div>';
    html = html + '</div>';
    html = html + '<div class="pt-trade-right">';
    html = html + '<div class="pt-trade-amount">$' + t.total.toFixed(2) + pnlStr + '</div>';
    html = html + '<div class="pt-trade-time">' + timeStr + '</div>';
    html = html + '</div>';
    html = html + '</div>';
  }
  wrap.innerHTML = html;
}

function setPtTab(tab, btn) {
  document.querySelectorAll('.pt-tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('ptHoldingsTab').style.display = tab === 'holdings' ? 'block' : 'none';
  document.getElementById('ptTradesTab').style.display = tab === 'trades' ? 'block' : 'none';
}

// ══════════════════════════════════════════
