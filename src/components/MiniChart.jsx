import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const MiniChart = ({ symbol, isUp, width = 60, height = 30 }) => {
  const points = useMemo(() => {
    const pts = 12;
    const vals = [];
    let v = 50;
    for (let i = 0; i < pts; i++) {
      let rand = Math.random();
      if (isUp) rand -= 0.4;
      else rand -= 0.6;
      v += (rand * 10);
      if (v < 10) v = 10;
      if (v > 90) v = 90;
      vals.push(v);
    }

    const min = Math.min(...vals);
    const max = Math.max(...vals);

    return vals.map((val, i) => {
      const x = (i / (pts - 1)) * width;
      const y = height - ((val - min) / (max - min + 1)) * height;
      return `${x},${y}`;
    }).join(' ');
  }, [symbol, isUp, width, height]);

  const color = isUp ? '#22c55e' : '#e8001d';

  return (
    <svg width={width} height={height} className="port-mini-chart">
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
      />
    </svg>
  );
};

export default MiniChart;
