import { STOCK_DB, getBasePrice } from "./data.js";

const marketState = new Map();

function ensureSymbolState(symbol) {
  if (!marketState.has(symbol)) {
    const base = getBasePrice(symbol);
    marketState.set(symbol, {
      price: base,
      prevClose: base * 0.995
    });
  }
  return marketState.get(symbol);
}

function nextSymbolTick(symbolInfo) {
  const state = ensureSymbolState(symbolInfo.symbol);
  const drift = (Math.random() - 0.48) * (state.price * 0.006);
  const nextPrice = Math.max(0.1, state.price + drift);
  const prevClose = state.prevClose;
  const change = ((nextPrice - prevClose) / prevClose) * 100;

  state.price = nextPrice;
  state.prevClose = prevClose;

  return {
    ...symbolInfo,
    price: Number(nextPrice.toFixed(2)),
    prevClose: Number(prevClose.toFixed(2)),
    change: Number(change.toFixed(2)),
    open: Number((prevClose * 1.002).toFixed(2)),
    high: Number((Math.max(nextPrice, prevClose) * 1.005).toFixed(2)),
    low: Number((Math.min(nextPrice, prevClose) * 0.995).toFixed(2)),
    volume: Math.floor(Math.random() * 5000000)
  };
}

export function getMarketSnapshot() {
  const statuses = [
    "Market is Open",
    "Markets are Stable",
    "Market Activity High",
    "Monitoring Exchanges"
  ];
  return {
    marketStatus: statuses[Math.floor(Math.random() * statuses.length)],
    lastUpdated: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    }).toLowerCase(),
    stocks: STOCK_DB.map(nextSymbolTick)
  };
}

export function buildSimCandles(symbol, period, currentPrice) {
  const seed = symbol.split("").reduce((a, b) => a + b.charCodeAt(0), 0) + period.length;
  const count = 42;
  const step = 300;
  const now = Math.floor(Date.now() / 1000);
  const o = [];
  const h = [];
  const l = [];
  const c = [];
  const v = [];
  const t = [];
  let price = (currentPrice > 0 ? currentPrice : getBasePrice(symbol)) * 0.96;

  const seededRandom = (n) => {
    const x = Math.sin(n) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i += 1) {
    const open = price;
    const rng = seededRandom(seed + i);
    const change = (rng - 0.45) * (open * 0.015);
    const close = open + change;
    const high = Math.max(open, close) + (seededRandom(seed * 2 + i) * (open * 0.005));
    const low = Math.min(open, close) - (seededRandom(seed * 3 + i) * (open * 0.005));

    o.push(open);
    c.push(close);
    h.push(high);
    l.push(low);
    v.push(Math.floor(seededRandom(seed + i) * 1000000));
    t.push(now - (count - i) * step);
    price = close;
  }

  return { o, h, l, c, v, t, s: "ok" };
}
