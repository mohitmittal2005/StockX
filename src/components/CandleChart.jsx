import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, TimeScale, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-luxon';

ChartJS.register(CategoryScale, LinearScale, BarElement, TimeScale, Tooltip, Legend);

const CandleChart = ({ data, period }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    
    // Prepare OHLC data
    const candles = data.t.map((timestamp, i) => ({
      x: timestamp * 1000,
      o: data.o[i],
      h: data.h[i],
      l: data.l[i],
      c: data.c[i]
    }));

    let minPrice = Math.min(...data.l);
    let maxPrice = Math.max(...data.h);
    let padding = (maxPrice - minPrice) * 0.1 || 1;

    const candlestickPlugin = {
      id: 'candlestick',
      afterDatasetsDraw(chart) {
        const { ctx, chartArea: { left, right, top, bottom }, scales: { x, y } } = chart;
        if (!candles.length) return;

        const totalWidth = right - left;
        const candleWidth = Math.max(2, Math.min(10, (totalWidth / candles.length) * 0.7));
        const wickWidth = Math.max(1, candleWidth * 0.1);

        candles.forEach((candle) => {
          const cx = x.getPixelForValue(candle.x);
          if (cx < left || cx > right) return;

          const oY = y.getPixelForValue(candle.o);
          const cY = y.getPixelForValue(candle.c);
          const hY = y.getPixelForValue(candle.h);
          const lY = y.getPixelForValue(candle.l);

          const isUp = candle.c >= candle.o;
          const bodyColor = isUp ? '#22c55e' : '#ff2d46';
          const wickColor = isUp ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 45, 70, 0.4)';

          // Wick
          ctx.beginPath();
          ctx.strokeStyle = wickColor;
          ctx.lineWidth = wickWidth;
          ctx.moveTo(cx, hY);
          ctx.lineTo(cx, lY);
          ctx.stroke();

          // Body
          const bodyTop = Math.min(oY, cY);
          const bodyHeight = Math.max(1, Math.abs(oY - cY));
          ctx.fillStyle = bodyColor;
          ctx.fillRect(cx - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

          // Subtle glow
          ctx.shadowColor = bodyColor;
          ctx.shadowBlur = 4;
          ctx.fillRect(cx - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
          ctx.shadowBlur = 0;
        });
      }
    };

    chartRef.current = new ChartJS(ctx, {
      type: 'bar',
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
                return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              },
              label: (item) => {
                const idx = item.dataIndex;
                const cd = candles[idx];
                return [
                  `Open:  $${cd.o.toFixed(2)}`,
                  `High:  $${cd.h.toFixed(2)}`,
                  `Low:   $${cd.l.toFixed(2)}`,
                  `Close: $${cd.c.toFixed(2)}`
                ];
              }
            },
            backgroundColor: 'rgba(10,10,12,0.95)',
            borderColor: 'rgba(255,45,70,0.3)',
            borderWidth: 1,
            titleColor: '#ff2d46',
            bodyColor: '#fff',
            padding: 12,
            displayColors: false,
          },
        },
        scales: {
          x: {
            type: 'time',
            grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
            ticks: { color: '#555', font: { size: 10 }, maxRotation: 0, maxTicksLimit: 6 },
            border: { display: false }
          },
          y: {
            min: minPrice - padding,
            max: maxPrice + padding,
            position: 'right',
            grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
            ticks: { color: '#555', font: { size: 10 }, callback: v => '$' + v.toFixed(0), maxTicksLimit: 6 },
            border: { display: false }
          }
        },
        interaction: { mode: 'index', intersect: false },
      },
      plugins: [candlestickPlugin]
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [data]);

  return <canvas ref={canvasRef} />;
};

export default CandleChart;
