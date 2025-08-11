import React from 'react';

export function ChartPanel({ title }: { title: string }) {
  return (
    <div style={{ background: '#0c1020', border: '1px solid #1b2742', borderRadius: 6, padding: 8, color: '#8ea0b8' }}>
      {title}
    </div>
  );
}
