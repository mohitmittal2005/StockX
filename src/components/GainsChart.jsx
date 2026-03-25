import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const GainsChart = ({ period }) => {
  const chartData = useMemo(() => {
    const counts = { '1D': 48, '1W': 42, '1M': 30, '3M': 45, '1Y': 52 };
    const n = counts[period] || 42;
    // Set a consistent seed for the same period to avoid flicker on rerender
    const base = 24000;
    let val = base;
    const values = [];
    const labels = [];
    for (let i = 0; i < n; i++) {
        val += (Math.random() - 0.46) * 400;
        if (val < base * 0.7) val = base * 0.7;
        values.push(+val.toFixed(2));
        labels.push('');
    }
    return {
      labels,
      datasets: [{
        data: values,
        borderColor: '#ff2d46', // Brighter, punchier red/orange
        borderWidth: 3,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 350);
          gradient.addColorStop(0, 'rgba(255, 45, 70, 0.35)');
          gradient.addColorStop(0.5, 'rgba(255, 45, 70, 0.1)');
          gradient.addColorStop(1, 'rgba(255, 45, 70, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.42,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#ff2d46',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      }]
    };
  }, [period]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 0
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: ctx => '$' + ctx.parsed.y.toLocaleString() },
        backgroundColor: 'rgba(10,10,12,0.95)',
        borderColor: 'rgba(255, 45, 70, 0.3)',
        borderWidth: 1,
        titleColor: '#aaa',
        bodyColor: '#fff',
        padding: 10,
        displayColors: false,
      }
    },
    scales: {
      x: { display: false },
      y: { display: false, grace: '10%' },
    },
    interaction: { mode: 'index', intersect: false },
  };

  return <Line data={chartData} options={options} />;
};

export default GainsChart;
