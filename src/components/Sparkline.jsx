import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Sparkline = ({ symbol, isUp, width = 70, height = 38 }) => {
  const points = useMemo(() => {
    const pts = 20;
    const vals = [];
    let v = 50;
    for (let i = 0; i < pts; i++) {
        let rand = Math.random();
        if (isUp) rand -= 0.42;
        else rand -= 0.58;
        v += (rand * 8);
        if (v < 5) v = 5;
        if (v > 95) v = 95;
        vals.push(v);
    }
    const min = Math.min(...vals);
    const max = Math.max(...vals);

    const pathPoints = vals.map((val, i) => {
        const x = (i / (pts - 1)) * width;
        const y = height - ((val - min) / (max - min + 1)) * (height - 4) - 2;
        return { x, y };
    });

    const linePath = pathPoints.map(p => `${p.x},${p.y}`).join(' ');
    const fillPath = `${linePath} ${width},${height} 0,${height}`;

    return { linePath, fillPath };
  }, [symbol, isUp, width, height]);

  const color = isUp ? '#22c55e' : '#e8001d';

  return (
    <svg width={width} height={height} className="watch-spark">
      <defs>
        <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon 
        fill={`url(#grad-${symbol})`} 
        points={points.fillPath}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
      />
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points.linePath}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  );
};

export default Sparkline;
