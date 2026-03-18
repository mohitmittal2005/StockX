//  STOCK DETAIL VIEW — Candlestick Chart
    // ══════════════════════════════════════════

    let detailChart = null;
    let detailSymbol = null;
    let detailPeriod = '1D';
    let detailUpdateInterval = null;
    let candleData = null;

    function handleSearchSelectAndOpen(symbol, name, emoji) {
      handleSearchSelect(symbol, name, emoji);
      setTimeout(() => openStockDetail(symbol, name, emoji), 100);
    }

    async function openStockDetail(symbol, name, emoji) {
      detailSymbol = symbol;
      detailPeriod = '1D';

      // Populate header
      document.getElementById('sdEmoji').textContent = emoji;
      document.getElementById('sdTicker').textContent = symbol;
      document.getElementById('sdName').textContent = name;

      // Show modal
      document.getElementById('stockDetailOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';

      // Reset period tabs
      document.querySelectorAll('.sd-period-tab').forEach(b => b.classList.remove('active'));
      document.querySelector('.sd-period-tab').classList.add('active');

      // Update price immediately
      updateDetailPrice();

      // Fetch candle data
      await fetchAndRenderCandles(symbol, '1D');

      // Update OHLC stats
      updateDetailStats();

      // Start live price update for detail
      if (detailUpdateInterval) clearInterval(detailUpdateInterval);
      detailUpdateInterval = setInterval(() => {
        if (detailSymbol) updateDetailPrice();
      }, 1500);
    }

    function closeStockDetail() {
      document.getElementById('stockDetailOverlay').classList.remove('open');
      document.body.style.overflow = '';
      detailSymbol = null;
      if (detailUpdateInterval) {
        clearInterval(detailUpdateInterval);
        detailUpdateInterval = null;
      }
      if (detailChart) {
        detailChart.destroy();
        detailChart = null;
      }
    }

    function handleDetailOverlayClick(e) {
      if (e.target === document.getElementById('stockDetailOverlay')) closeStockDetail();
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && detailSymbol) closeStockDetail();
    });

    function updateDetailPrice() {
      if (!detailSymbol) return;
      const d = liveData[detailSymbol];
      if (!d) return;

      const priceEl = document.getElementById('sdPrice');
      const changeEl = document.getElementById('sdChange');

      const oldText = priceEl.textContent;
      const newText = '$' + d.price.toFixed(2);

      if (oldText !== newText) {
        priceEl.textContent = newText;
        // Flash effect 
        priceEl.style.color = d.change >= 0 ? 'var(--green)' : 'var(--red)';
        setTimeout(() => { priceEl.style.color = 'var(--text)'; }, 600);
      }

      const isUp = d.change >= 0;
      changeEl.className = 'sd-price-badge ' + (isUp ? 'up' : 'dn');
      changeEl.innerHTML = `${isUp ? '▲' : '▼'} $${Math.abs(d.price - (d.prevClose || d.price)).toFixed(2)} (${Math.abs(d.change).toFixed(2)}%)`;

      updateDetailStats();
    }

    function updateDetailStats() {
      if (!detailSymbol) return;
      const d = liveData[detailSymbol];
      if (!d) return;

      document.getElementById('sdOpen').textContent = d.open ? '$' + d.open.toFixed(2) : '—';
      document.getElementById('sdHigh').textContent = d.high ? '$' + d.high.toFixed(2) : '—';
      document.getElementById('sdLow').textContent = d.low ? '$' + d.low.toFixed(2) : '—';
      document.getElementById('sdPrevClose').textContent = d.prevClose ? '$' + d.prevClose.toFixed(2) : '—';
    }

    async function setDetailPeriod(period, btn) {
      detailPeriod = period;
      document.querySelectorAll('.sd-period-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      await fetchAndRenderCandles(detailSymbol, period);
    }

    async function fetchAndRenderCandles(symbol, period) {
      const loadingEl = document.getElementById('sdChartLoading');
      loadingEl.style.display = 'flex';

      // Determine resolution and time range for Finnhub candle API
      const now = Math.floor(Date.now() / 1000);
      let resolution, from;
      switch (period) {
        case '1D':  resolution = '5';  from = now - 86400; break;
        case '1W':  resolution = '15'; from = now - 7 * 86400; break;
        case '1M':  resolution = '60'; from = now - 30 * 86400; break;
        case '3M':  resolution = 'D';  from = now - 90 * 86400; break;
        case '1Y':  resolution = 'W';  from = now - 365 * 86400; break;
        default:    resolution = '5';  from = now - 86400; break;
      }

      try {
        const resp = await fetch(
          `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}&token=${API_KEY}`
        );
        const data = await resp.json();

        if (data && data.s === 'ok' && data.c && data.c.length > 0) {
          candleData = data;
          renderCandlestickChart(data, symbol);
          // Update volume
          if (data.v) {
            const totalVol = data.v.reduce((a, b) => a + b, 0);
            const maxVol = 200_000_000; // reference scale
            const pct = Math.min(100, (totalVol / maxVol) * 100);
            document.getElementById('sdVolumeFill').style.width = pct + '%';
            document.getElementById('sdVolume').textContent = formatVolume(totalVol);
          }
        } else {
          // Fallback: generate simulated candle data
          candleData = generateSimCandles(symbol, period);
          renderCandlestickChart(candleData, symbol);
          document.getElementById('sdVolumeFill').style.width = '40%';
          document.getElementById('sdVolume').textContent = '—';
        }
      } catch (e) {
        candleData = generateSimCandles(symbol, period);
        renderCandlestickChart(candleData, symbol);
        document.getElementById('sdVolumeFill').style.width = '40%';
        document.getElementById('sdVolume').textContent = '—';
      }

      loadingEl.style.display = 'none';
    }

    function generateSimCandles(symbol, period) {
  let n = 48;
  if (period === '1D') n = 48;
  if (period === '1W') n = 42;
  if (period === '1M') n = 30;
  if (period === '3M') n = 60;
  if (period === '1Y') n = 52;
  
  let base = getSimPrice(symbol);
  if (liveData[symbol] && liveData[symbol].price) {
    base = liveData[symbol].price;
  }
  
  let o = [];
  let h = [];
  let l = [];
  let c = [];
  let v = [];
  let t = [];
  
  let price = base * 0.97;
  let now = Math.floor(Date.now() / 1000);
  
  let step = 300;
  if (period === '1D') step = 300;
  if (period === '1W') step = 900;
  if (period === '1M') step = 3600;
  if (period === '3M') step = 86400;
  if (period === '1Y') step = 604800;

  for (let i = 0; i < n; i++) {
    let open = price;
    let changeFactor = Math.random() - 0.47;
    let close = open + (changeFactor * (base * 0.015));
    
    let maxOH = open;
    if (close > open) {
      maxOH = close;
    }
    let high = maxOH + (Math.random() * (base * 0.005));
    
    let minOH = open;
    if (close < open) {
      minOH = close;
    }
    let low = minOH - (Math.random() * (base * 0.005));
    
    o.push(Number(open.toFixed(2)));
    c.push(Number(close.toFixed(2)));
    h.push(Number(high.toFixed(2)));
    l.push(Number(low.toFixed(2)));
    v.push(Math.floor(Math.random() * 5000000));
    
    let timeAgo = (n - i) * step;
    t.push(now - timeAgo);
    
    price = close;
  }
  
  return { o: o, h: h, l: l, c: c, v: v, t: t, s: 'ok' };
}

    function renderCandlestickChart(data, symbol) {
      if (detailChart) {
        detailChart.destroy();
        detailChart = null;
      }

      const canvas = document.getElementById('stockDetailCandleChart');
      const ctx = canvas.getContext('2d');

      // Prepare OHLC data
      const candles = data.t.map((timestamp, i) => ({
        x: timestamp * 1000,
        o: data.o[i],
        h: data.h[i],
        l: data.l[i],
        c: data.c[i]
      }));

      // Custom candlestick plugin
      const candlestickPlugin = {
        id: 'candlestick',
        afterDatasetsDraw(chart) {
          const { ctx, chartArea: { left, right, top, bottom, width, height }, scales: { x, y } } = chart;
          if (!candles.length) return;

          const candleCount = candles.length;
          const totalWidth = right - left;
          const candleWidth = Math.max(2, Math.min(12, (totalWidth / candleCount) * 0.6));
          const wickWidth = Math.max(1, candleWidth * 0.15);

          candles.forEach((candle, i) => {
            const cx = x.getPixelForValue(candle.x);
            if (cx < left || cx > right) return;

            const oY = y.getPixelForValue(candle.o);
            const cY = y.getPixelForValue(candle.c);
            const hY = y.getPixelForValue(candle.h);
            const lY = y.getPixelForValue(candle.l);

            const isUp = candle.c >= candle.o;
            const bodyColor = isUp ? '#22c55e' : '#e8001d';
            const wickColor = isUp ? '#22c55e88' : '#e8001d88';

            // Wick (high-low line)
            ctx.beginPath();
            ctx.strokeStyle = wickColor;
            ctx.lineWidth = wickWidth;
            ctx.moveTo(cx, hY);
            ctx.lineTo(cx, lY);
            ctx.stroke();

            // Body (open-close rect)
            const bodyTop = Math.min(oY, cY);
            const bodyHeight = Math.max(1, Math.abs(oY - cY));
            ctx.fillStyle = bodyColor;
            ctx.fillRect(cx - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

            // Subtle glow on candle body
            ctx.shadowColor = bodyColor;
            ctx.shadowBlur = 3;
            ctx.fillRect(cx - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
            ctx.shadowBlur = 0;
          });
        }
      };

      // Find min/max for y-axis
let minPrice = candles[0].l;
let maxPrice = candles[0].h;
for (let i = 1; i < candles.length; i++) {
  if (candles[i].l < minPrice) {
    minPrice = candles[i].l;
  }
  if (candles[i].h > maxPrice) {
    maxPrice = candles[i].h;
  }
}

let padding = (maxPrice - minPrice) * 0.1;
if (!padding) {
  padding = 1;
}

      detailChart = new Chart(ctx, {
        type: 'bar', // dummy type, we draw candles via plugin
        data: {
          datasets: [{
            data: candles.map(c => ({ x: c.x, y: [c.o, c.c] })),
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              callbacks: {
                title: (items) => {
                  if (!items.length) return '';
                  const idx = items[0].dataIndex;
                  const d = new Date(candles[idx].x);
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                },
                label: (item) => {
                  const idx = item.dataIndex;
                  const cd = candles[idx];
                  return [
                    `Open: $${cd.o.toFixed(2)}`,
                    `High: $${cd.h.toFixed(2)}`,
                    `Low: $${cd.l.toFixed(2)}`,
                    `Close: $${cd.c.toFixed(2)}`
                  ];
                }
              },
              backgroundColor: 'rgba(20,20,20,0.95)',
              borderColor: 'rgba(232,0,29,0.4)',
              borderWidth: 1,
              titleColor: '#e8001d',
              bodyColor: '#fff',
              titleFont: { weight: 'bold' },
              padding: 12,
              cornerRadius: 12,
              displayColors: false,
            },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                tooltipFormat: 'MMM dd, yyyy HH:mm',
              },
              grid: {
                color: 'rgba(255,255,255,0.04)',
                drawBorder: false,
              },
              ticks: {
                color: '#555',
                font: { size: 10, family: 'Outfit' },
                maxRotation: 0,
                maxTicksLimit: 6,
              },
              border: { display: false },
            },
            y: {
              min: minPrice - padding,
              max: maxPrice + padding,
              position: 'right',
              grid: {
                color: 'rgba(255,255,255,0.04)',
                drawBorder: false,
              },
              ticks: {
                color: '#555',
                font: { size: 10, family: 'Outfit' },
                callback: v => '$' + v.toFixed(0),
                maxTicksLimit: 6,
              },
              border: { display: false },
            },
          },
          interaction: { mode: 'index', intersect: false },
        },
        plugins: [candlestickPlugin]
      });
    }

    function formatVolume(vol) {
  if (vol >= 1000000000) {
    return (vol / 1000000000).toFixed(2) + 'B';
  }
  if (vol >= 1000000) {
    return (vol / 1000000).toFixed(2) + 'M';
  }
  if (vol >= 1000) {
    return (vol / 1000).toFixed(1) + 'K';
  }
  return String(vol);
}

    // ══════════════════════════════════════════
