import React from 'react';
import './KV.css';

export default function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="kvRow">
      <span className="kvRow__k">{k}</span>
      <span className="kvRow__v">{v}</span>
    </div>
  );
}
