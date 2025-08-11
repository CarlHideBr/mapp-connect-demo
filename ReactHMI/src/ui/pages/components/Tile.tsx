import React from 'react';
import './Tile.css';

export default function Tile({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="tile">
      <h3 className="tile__title">{title}</h3>
      <div>{children}</div>
    </section>
  );
}
