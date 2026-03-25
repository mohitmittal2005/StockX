export const API_KEY_DEFAULT = 'd6tqs99r01qhkb458r0gd6tqs99r01qhkb458r10';

export const PORTFOLIO_DEFAULT = [
  { symbol: 'AAPL', name: 'Apple Inc.', color: '#555', emoji: '🍎', shares: 5 },
  { symbol: 'LYFT', name: 'Lyft Inc.', color: '#e8198b', emoji: '🚗', shares: 3 },
  { symbol: 'TSLA', name: 'Tesla Inc.', color: '#cc0000', emoji: '⚡', shares: 2 },
  { symbol: 'NVDA', name: 'Nvidia Corp.', color: '#76b900', emoji: '🎮', shares: 4 },
];

export const WATCHLIST_DEFAULT = [
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

export const STOCK_DB = [
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

export function getSimPrice(sym) {
  const SIM_PRICES = {
    AAPL: 189.50, LYFT: 14.82, TSLA: 175.20, NVDA: 875.40,
    MSFT: 415.10, GOOGL: 163.45, SPOT: 245.80, AMZN: 185.90,
    META: 495.20, AMD: 162.30, COIN: 255.40, NFLX: 620.10,
    PLTR: 22.50, JPM: 195.40
  };
  if (SIM_PRICES[sym]) return SIM_PRICES[sym];
  let hash = 0;
  for (let i = 0; i < sym.length; i++) hash += sym.charCodeAt(i);
  return Number((Math.abs(hash % 800) + 15.5).toFixed(2));
}

export function getSimChange(sym) {
  const SIM_CHANGES = {
    AAPL: 2.3, LYFT: 1.8, TSLA: -3.2, NVDA: 4.1,
    MSFT: 1.2, GOOGL: -0.8, SPOT: 2.5, AMZN: 0.9,
    META: 1.4, AMD: -1.2, COIN: 5.6, NFLX: 0.7,
    PLTR: -0.5, JPM: 0.3
  };
  if (SIM_CHANGES[sym] !== undefined) return SIM_CHANGES[sym];
  let hash = 0;
  for (let i = 0; i < sym.length; i++) hash += sym.charCodeAt(i);
  return Number(((Math.abs(hash % 1000) / 100) - 5).toFixed(2));
}
