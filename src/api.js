const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("stockx_token") || "";
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || "Request failed");
  }
  return json;
}

export const api = {
  login(email, password) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  getState() {
    return request("/user/state");
  },
  getLiveMarket() {
    return request("/market/live");
  },
  getStocks(query) {
    const q = query ? `?query=${encodeURIComponent(query)}` : "";
    return request(`/stocks${q}`);
  },
  addHistory(symbol) {
    return request("/user/search-history", {
      method: "POST",
      body: JSON.stringify({ symbol })
    });
  },
  toggleWatchlist(symbol) {
    return request("/user/watchlist/toggle", {
      method: "POST",
      body: JSON.stringify({ symbol })
    });
  },
  saveApiKey(apiKey) {
    return request("/user/api-key", {
      method: "POST",
      body: JSON.stringify({ apiKey })
    });
  },
  buy(symbol, qty, price) {
    return request("/trades/buy", {
      method: "POST",
      body: JSON.stringify({ symbol, qty, price })
    });
  },
  sell(symbol, qty, price) {
    return request("/trades/sell", {
      method: "POST",
      body: JSON.stringify({ symbol, qty, price })
    });
  },
  async getCandles(symbol, period, apiKey) {
    return request(`/stocks/${encodeURIComponent(symbol)}/candles?period=${encodeURIComponent(period)}`, {
      headers: apiKey ? { "x-api-key": apiKey } : {}
    });
  }
};
