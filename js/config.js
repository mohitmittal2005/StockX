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

const ALL_SYMBOLS = [];
for (let i = 0; i < PORTFOLIO.length; i++) {
  ALL_SYMBOLS.push(PORTFOLIO[i].symbol);
}
for (let j = 0; j < WATCHLIST.length; j++) {
  ALL_SYMBOLS.push(WATCHLIST[j].symbol);
}

// Simulated data for when no API key
function rnd(base, pct) {
  if (pct === undefined) {
    pct = 0.015;
  }
  let randomFactor = Math.random() - 0.5;
  let change = randomFactor * pct * 2;
  let newValue = base * (1 + change);
  return Number(newValue.toFixed(2));
}

const SIM_PRICES = {
  AAPL: 189.50, LYFT: 14.82, TSLA: 175.20, NVDA: 875.40,
  MSFT: 415.10, GOOGL: 163.45, SPOT: 245.80, AMZN: 185.90,
  META: 495.20, AMD: 162.30, COIN: 255.40, NFLX: 620.10,
  PLTR: 22.50, JPM: 195.40
};

const SIM_CHANGES = {
  AAPL: 2.3, LYFT: 1.8, TSLA: -3.2, NVDA: 4.1,
  MSFT: 1.2, GOOGL: -0.8, SPOT: 2.5, AMZN: 0.9,
  META: 1.4, AMD: -1.2, COIN: 5.6, NFLX: 0.7,
  PLTR: -0.5, JPM: 0.3
};

function getSimPrice(sym) {
  if (SIM_PRICES[sym]) {
    return SIM_PRICES[sym];
  }
  let hash = 0;
  for (let i = 0; i < sym.length; i++) {
    hash = hash + sym.charCodeAt(i);
  }
  let basePrice = Math.abs(hash % 800) + 15.5;
  return Number(basePrice.toFixed(2));
}

function getSimChange(sym) {
  if (SIM_CHANGES[sym] !== undefined) {
    return SIM_CHANGES[sym];
  }
  let hash = 0;
  for (let i = 0; i < sym.length; i++) {
    hash = hash + sym.charCodeAt(i);
  }
  let change = (Math.abs(hash % 1000) / 100) - 5;
  return Number(change.toFixed(2));
}

const STOCK_DB = [
  { symbol: 'AAPL', name: 'Apple Inc.', emoji: '🍎' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', emoji: '🪟' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', emoji: '🔍' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', emoji: '📦' },
  { symbol: 'META', name: 'Meta Platforms', emoji: '👥' },
  { symbol: 'TSLA', name: 'Tesla Inc.', emoji: '⚡' },
  { symbol: 'NVDA', name: 'Nvidia Corp.', emoji: '🎮' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', emoji: '💻' },
  { symbol: 'NFLX', name: 'Netflix Inc.', emoji: '🎬' },
  { symbol: 'INTC', name: 'Intel Corp.', emoji: '🔵' }
];
