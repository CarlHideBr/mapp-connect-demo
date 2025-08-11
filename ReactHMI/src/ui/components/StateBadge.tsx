import React from 'react';
import './StateBadge.css';

export default function StateBadge({ state, substate }: { state: string; substate: string }) {
  return (
    <div className="stateBadge">
      <span className="stateBadge__state">{state}</span>
      <span className="stateBadge__sub">{substate}</span>
    </div>
  );
}
