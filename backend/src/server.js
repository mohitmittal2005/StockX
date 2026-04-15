import "dotenv/config";
import express from "express";
import cors from "cors";
import { STOCK_DB, getDefaultUserState } from "./data.js";
import { buildSimCandles, getMarketSnapshot } from "./market.js";
import { createSession, initStore, resolveUserByToken, upsertUserState } from "./store.js";

const app = express();
const PORT = process.env.PORT || 4000;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  await upsertUserState(email, (prev) => prev || getDefaultUserState());
  const token = createSession(email);
  return res.json({
    token,
    user: { email }
  });
});

function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const user = resolveUserByToken(token);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  return next();
}

app.get("/api/stocks", (req, res) => {
  const q = String(req.query.query || "").trim().toUpperCase();
  if (!q) return res.json({ items: STOCK_DB });
  const items = STOCK_DB.filter(
    (s) => s.symbol.includes(q) || s.name.toUpperCase().includes(q)
  );
  return res.json({ items });
});

app.get("/api/market/live", (_req, res) => {
  res.json(getMarketSnapshot());
});

app.get("/api/stocks/:symbol/candles", async (req, res) => {
  const symbol = String(req.params.symbol || "").toUpperCase();
  const period = String(req.query.period || "1D");
  const apiKey = String(req.headers["x-api-key"] || FINNHUB_API_KEY);
  const now = Math.floor(Date.now() / 1000);
  let resolution = "5";
  let from = now - 86400;
  if (period === "1W") { resolution = "15"; from = now - (7 * 86400); }
  if (period === "1M") { resolution = "60"; from = now - (30 * 86400); }
  if (period === "3M") { resolution = "D"; from = now - (90 * 86400); }
  if (period === "1Y") { resolution = "W"; from = now - (365 * 86400); }

  if (apiKey) {
    try {
      const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}&token=${apiKey}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json?.s === "ok" && Array.isArray(json?.c) && json.c.length > 0) {
        return res.json(json);
      }
    } catch {
      // Fallback to simulated candles below.
    }
  }

  const snapshot = getMarketSnapshot();
  const item = snapshot.stocks.find((s) => s.symbol === symbol);
  return res.json(buildSimCandles(symbol, period, item?.price || 0));
});

app.get("/api/user/state", auth, async (req, res) => {
  const { email } = req.user;
  const state = await upsertUserState(email, (prev) => prev);
  return res.json(state);
});

app.post("/api/user/api-key", auth, async (req, res) => {
  const { email } = req.user;
  const apiKey = String(req.body?.apiKey || "");
  const state = await upsertUserState(email, (prev) => ({ ...prev, apiKey }));
  return res.json(state);
});

app.post("/api/user/search-history", auth, async (req, res) => {
  const { email } = req.user;
  const symbol = String(req.body?.symbol || "").toUpperCase();
  if (!symbol) return res.status(400).json({ error: "symbol is required" });
  const state = await upsertUserState(email, (prev) => {
    const filtered = prev.searchHistory.filter((s) => s !== symbol);
    return { ...prev, searchHistory: [symbol, ...filtered].slice(0, 10) };
  });
  return res.json(state);
});

app.post("/api/user/watchlist/toggle", auth, async (req, res) => {
  const { email } = req.user;
  const symbol = String(req.body?.symbol || "").toUpperCase();
  if (!symbol) return res.status(400).json({ error: "symbol is required" });
  const state = await upsertUserState(email, (prev) => {
    const has = prev.watchlist.includes(symbol);
    return {
      ...prev,
      watchlist: has ? prev.watchlist.filter((s) => s !== symbol) : [...prev.watchlist, symbol]
    };
  });
  return res.json(state);
});

app.post("/api/trades/buy", auth, async (req, res) => {
  const { email } = req.user;
  const symbol = String(req.body?.symbol || "").toUpperCase();
  const qty = Number(req.body?.qty || 0);
  const price = Number(req.body?.price || 0);
  if (!symbol || qty <= 0 || price <= 0) {
    return res.status(400).json({ error: "symbol, qty, price are required" });
  }

  const state = await upsertUserState(email, (prev) => {
    const total = qty * price;
    if (total > prev.cashBalance) return prev;
    const holdings = { ...prev.holdings };
    const info = STOCK_DB.find((s) => s.symbol === symbol) || { symbol, name: symbol, emoji: "📈", color: "#555" };
    const h = holdings[symbol] || { qty: 0, avgPrice: 0, totalCost: 0, name: info.name, emoji: info.emoji, color: info.color };
    h.qty += qty;
    h.totalCost += total;
    h.avgPrice = h.totalCost / h.qty;
    holdings[symbol] = h;
    return {
      ...prev,
      cashBalance: prev.cashBalance - total,
      holdings,
      tradeLog: [{ type: "buy", symbol, qty, price, total, time: Date.now() }, ...prev.tradeLog]
    };
  });
  return res.json(state);
});

app.post("/api/trades/sell", auth, async (req, res) => {
  const { email } = req.user;
  const symbol = String(req.body?.symbol || "").toUpperCase();
  const qty = Number(req.body?.qty || 0);
  const price = Number(req.body?.price || 0);
  if (!symbol || qty <= 0 || price <= 0) {
    return res.status(400).json({ error: "symbol, qty, price are required" });
  }

  const state = await upsertUserState(email, (prev) => {
    const h = prev.holdings[symbol];
    if (!h || h.qty < qty) return prev;
    const holdings = { ...prev.holdings };
    const stock = { ...holdings[symbol] };
    const total = qty * price;
    const costBasis = stock.avgPrice * qty;
    stock.qty -= qty;
    if (stock.qty <= 0) {
      delete holdings[symbol];
    } else {
      stock.totalCost -= costBasis;
      holdings[symbol] = stock;
    }
    return {
      ...prev,
      cashBalance: prev.cashBalance + total,
      holdings,
      tradeLog: [{ type: "sell", symbol, qty, price, total, time: Date.now() }, ...prev.tradeLog]
    };
  });
  return res.json(state);
});

initStore().then(() => {
  app.listen(PORT, () => {
    console.log(`StockX backend running on http://localhost:${PORT}`);
  });
});
