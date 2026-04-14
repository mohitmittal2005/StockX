export const STOCK_DB = [
  { symbol: "AAPL", name: "Apple Inc.", emoji: "🍎", color: "#555" },
  { symbol: "MSFT", name: "Microsoft Corp.", emoji: "🪟", color: "#00a1f1" },
  { symbol: "GOOGL", name: "Alphabet Inc.", emoji: "🔍", color: "#4285f4" },
  { symbol: "AMZN", name: "Amazon.com Inc.", emoji: "📦", color: "#ff9900" },
  { symbol: "META", name: "Meta Platforms", emoji: "👥", color: "#1877f2" },
  { symbol: "TSLA", name: "Tesla Inc.", emoji: "⚡", color: "#cc0000" },
  { symbol: "NVDA", name: "Nvidia Corp.", emoji: "🎮", color: "#76b900" },
  { symbol: "AMD", name: "Advanced Micro Devices", emoji: "💻", color: "#ed1c24" },
  { symbol: "NFLX", name: "Netflix Inc.", emoji: "🎬", color: "#e50914" },
  { symbol: "INTC", name: "Intel Corp.", emoji: "🔵", color: "#0071c5" },
  { symbol: "LYFT", name: "Lyft Inc.", emoji: "🚗", color: "#e8198b" },
  { symbol: "SPOT", name: "Spotify Tech.", emoji: "🎵", color: "#1db954" },
  { symbol: "COIN", name: "Coinbase Global", emoji: "🪙", color: "#0052ff" },
  { symbol: "PLTR", name: "Palantir Tech.", emoji: "🔭", color: "#1a1a1a" },
  { symbol: "JPM", name: "JPMorgan Chase", emoji: "🏦", color: "#211F20" }
];

const BASE_PRICES = {
  AAPL: 189.5, LYFT: 14.82, TSLA: 175.2, NVDA: 875.4,
  MSFT: 415.1, GOOGL: 163.45, SPOT: 245.8, AMZN: 185.9,
  META: 495.2, AMD: 162.3, COIN: 255.4, NFLX: 620.1,
  PLTR: 22.5, JPM: 195.4, INTC: 32.4
};

export function getBasePrice(symbol) {
  if (BASE_PRICES[symbol]) return BASE_PRICES[symbol];
  let hash = 0;
  for (let i = 0; i < symbol.length; i += 1) hash += symbol.charCodeAt(i);
  return Number((Math.abs(hash % 800) + 15.5).toFixed(2));
}

export function getDefaultUserState() {
  return {
    cashBalance: 100000,
    holdings: {},
    tradeLog: [],
    searchHistory: [],
    watchlist: [],
    apiKey: ""
  };
}
