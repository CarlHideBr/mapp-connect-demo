import React from 'react';
import type { MachineHmiData } from '../../mc/types';
import './Status.css';
import Tile from './components/Tile';
import KV from './components/KV';
import CanvasChart from './components/CanvasChart';

export default function StatusPage({ machine }: { machine: MachineHmiData | null }) {
  return (
    <div className="statusGrid">
      <Tile title="Values">
        <KV k="LineRunning" v={String(!!machine?.LineRunning)} />
        <KV k="AnyFault" v={String(!!machine?.AnyFault)} />
        <KV k="Conveyor.Mode" v={machine?.Conveyor.Mode ?? '-'} />
      </Tile>
      <Tile title="Charts">
        <CanvasChart title="Heater Temperature" />
      </Tile>
    </div>
  );
}
