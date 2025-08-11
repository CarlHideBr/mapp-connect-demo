import React, { useEffect, useState } from 'react';
import './CanvasChart.css';

export default function CanvasChart({ title }: { title: string }) {
  const [points, setPoints] = useState<number[]>([]);
  useEffect(() => {
    const id = window.setInterval(() => {
      setPoints(p => {
        const next = [...p, (Math.sin((p.length / 10)) + 1) * 50 + Math.random() * 10];
        return next.slice(-200);
      });
    }, 500);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div>
      <div className="chartTitle">{title}</div>
      <canvas width={520} height={220} className="chartCanvas" ref={el => {
        if (!el) return;
        const ctx = el.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0,0,el.width, el.height);
        ctx.strokeStyle = '#9ecbff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        points.forEach((y, i) => {
          const x = (i / Math.max(1, points.length - 1)) * (el.width - 10) + 5;
          const yy = el.height - 5 - (y / 120) * (el.height - 10);
          if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        });
        ctx.stroke();
      }} />
    </div>
  );
}
