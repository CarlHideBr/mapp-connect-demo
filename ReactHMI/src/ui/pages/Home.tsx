import React from 'react';
import type { MachineHmiData } from '../../mc/types';
import './Home.css';
import Tile from './components/Tile';
import KV from './components/KV';

export default function Home({ machine }: { machine: MachineHmiData | null }) {
  return (
    <div className="homeGrid">
      <Tile title="Conveyor">
        <KV k="Running" v={machine?.Conveyor.Running ? 'Yes' : 'No'} />
        <KV k="Speed" v={`${machine?.Conveyor.Speed?.toFixed?.(2) ?? '-'} m/s`} />
        <KV k="Load" v={`${machine?.Conveyor.Load?.toFixed?.(0) ?? '-'} %`} />
        <KV k="Parts" v={String(machine?.Conveyor.PartsCount ?? '-')} />
      </Tile>
      <Tile title="Heater">
        <KV k="Temp" v={`${machine?.Heater.Temperature?.toFixed?.(1) ?? '-'} °C`} />
        <KV k="Setpoint" v={`${machine?.Heater.Setpoint?.toFixed?.(1) ?? '-'} °C`} />
        <KV k="Power" v={`${machine?.Heater.PowerPercent?.toFixed?.(0) ?? '-'} %`} />
      </Tile>
      <Tile title="Robot">
        <KV k="State" v={machine?.Robot.State ?? '-'} />
        <KV k="Pos" v={`X ${machine?.Robot.X ?? '-'}  Y ${machine?.Robot.Y ?? '-'}  Z ${machine?.Robot.Z ?? '-'}`} />
      </Tile>
      <Tile title="Run Request">
        <KV k="Latched" v={machine ? (machine.RunRequest ? 'TRUE' : 'FALSE') : '-'} />
      </Tile>
      <Tile title="Machine Temperature">
        <KV k="Temperature" v={`${machine?.Temperature?.toFixed?.(1) ?? '-'} °C`} />
      </Tile>
      
    </div>
  );
}
