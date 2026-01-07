import React, { useEffect } from 'react';
import type { MachineHmiData } from '../../mc/types';
import './Marine.css';

// Open Bridge: palette + top bar (stable, available in dist)
import '@oicl/openbridge-webcomponents/src/palettes/variables.css';
import '@oicl/openbridge-webcomponents/dist/components/top-bar/top-bar.js';

// Declare custom elements for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'obc-top-bar': any;
    }
  }
}

export default function MarinePage({ machine }: { machine: MachineHmiData | null }) {
  useEffect(() => {
    // Set Open Bridge theme on mount
    document.documentElement.setAttribute('data-obc-theme', 'dusk');
    return () => {
      // Clean up theme on unmount
      document.documentElement.removeAttribute('data-obc-theme');
    };
  }, []);

  // Convert machine data to maritime terminology
  const separatorData = {
    bowlSpeed: machine?.Conveyor.Speed ? machine.Conveyor.Speed * 1000 : 0, // Convert to RPM
    oilPressure: machine?.Heater.Temperature || 0, // Simulate pressure from temp
    throughput: machine?.Conveyor.Load || 0, // Flow rate %
    running: machine?.Conveyor.Running || false,
    temperature: machine?.Heater.Temperature || 0,
  };

  const pumpData = {
    pressure: machine?.Heater.PowerPercent || 0, // Simulate pressure from power %
    flow: machine?.Conveyor.Speed ? machine.Conveyor.Speed * 10 : 0, // L/min
    temperature: machine?.Heater.Temperature || 0,
  };

  const alarms = [];
  if (machine?.Conveyor.Fault) alarms.push({ text: 'Separator Bowl Fault', severity: 'critical' });
  if (machine?.Heater.Fault) alarms.push({ text: 'Cooling System Fault', severity: 'critical' });
  if (machine?.Robot.Fault) alarms.push({ text: 'Fuel Treatment Fault', severity: 'warning' });
  if (!machine?.LineRunning) alarms.push({ text: 'System Standby', severity: 'info' });

  return (
    <div className="marinePage">
      <obc-top-bar application-name="Marine Systems" />

      <div className="marineGrid">
        {/* Separator System */}
        <section className="marineCard">
          <h3 className="marineCard__title">
            <span className="marineIcon">⚙️</span>
            Oil/Water Separator
          </h3>
          <div className="marineContent">
            <div className="statusGrid">
              <div className="statusRow">
                <span className="statusLabel">Status:</span>
                <span className="statusValue">{separatorData.running ? 'Running' : 'Stopped'}</span>
              </div>
              <div className="statusRow">
                <span className="statusLabel">Bowl Speed:</span>
                <span className="statusValue">{separatorData.bowlSpeed.toFixed(0)} RPM</span>
              </div>
              <div className="statusRow">
                <span className="statusLabel">Throughput:</span>
                <span className="statusValue">{separatorData.throughput.toFixed(0)} %</span>
              </div>
              <div className="statusRow">
                <span className="statusLabel">Oil Pressure:</span>
                <span className="statusValue">{separatorData.oilPressure.toFixed(1)} bar</span>
              </div>
              <div className="statusRow">
                <span className="statusLabel">Temperature:</span>
                <span className="statusValue">{separatorData.temperature.toFixed(1)} °C</span>
              </div>
              <div className="statusRow">
                <span className="statusLabel">Parts Processed:</span>
                <span className="statusValue">{machine?.Conveyor.PartsCount || 0}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cooling Water Pump */}
        <section className="marineCard">
          <h3 className="marineCard__title">
            <span className="marineIcon">💧</span>
            Cooling Water System
          </h3>
          <div className="marineContent">
            <div className="statusGrid">
              <div className="statusRow">
                <span className="statusLabel">Status:</span>
                <span className="statusValue">{machine?.Heater.Heating ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="statusRow">
                <span className="statusLabel">Pressure:</span>
                <span className="statusValue">{pumpData.pressure.toFixed(1)} bar</span>
              </div>
              <div className="statusRow">
                <span className="statusLabel">Flow Rate:</span>
                <span className="statusValue">{pumpData.flow.toFixed(1)} L/min</span>
              </div>
              <div className="statusRow">
                <span className="statusLabel">Temperature:</span>
                <span className="statusValue">{pumpData.temperature.toFixed(1)} °C</span>
              </div>
              <div className="statusRow">
                <span className="statusLabel">Setpoint:</span>
                <span className="statusValue">{machine?.Heater.Setpoint?.toFixed(1) || '--'} °C</span>
              </div>
            </div>
          </div>
        </section>

        {/* Fuel Treatment Position */}
        <section className="marineCard">
          <h3 className="marineCard__title">
            <span className="marineIcon">⛽</span>
            Fuel Treatment Unit
          </h3>
          <div className="marineContent">
            <div className="statusGrid">
              <div className="statusRow">
                <span className="statusLabel">Mode:</span>
                <obc-status-text
                  status={machine?.Robot.Auto ? 'auto' : 'manual'}
                  label={machine?.Robot.Auto ? 'Automatic' : 'Manual'}
                />
              </div>
              <div className="statusRow">
                <span className="statusLabel">State:</span>
                <span className="statusValue">{machine?.Robot.State || 'Unknown'}</span>
              </div>
              <div className="statusRow">
                <span className="statusLabel">Position X:</span>
                <span className="statusValue">{machine?.Robot.X?.toFixed(2) || '--'} mm</span>
              </div>
              <div className="statusRow">
                <span className="statusLabel">Position Y:</span>
                <span className="statusValue">{machine?.Robot.Y?.toFixed(2) || '--'} mm</span>
              </div>
              <div className="statusRow">
                <span className="statusLabel">Position Z:</span>
                <span className="statusValue">{machine?.Robot.Z?.toFixed(2) || '--'} mm</span>
              </div>
            </div>
          </div>
        </section>

        {/* Alert Panel */}
        <section className="marineCard marineCard--wide">
          <h3 className="marineCard__title">
            <span className="marineIcon">⚠️</span>
            System Alarms & Alerts
          </h3>
          <div className="marineContent">
            {alarms.length > 0 ? (
              <div className="alertList">
                {alarms.map((alarm, idx) => (
                  <div key={idx} className={`alertItem alertItem--${alarm.severity}`}>
                    <span className="alertIcon">
                      {alarm.severity === 'critical' ? '🔴' : alarm.severity === 'warning' ? '🟡' : 'ℹ️'}
                    </span>
                    <span className="alertText">{alarm.text}</span>
                    <span className="alertTime">{new Date().toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="noAlerts">
                <span className="noAlerts__icon">✅</span>
                <span className="noAlerts__text">All systems operational</span>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="marineFooter">
        <div className="marineFooter__info">
          <span>Open Bridge Design System</span>
          <span>|</span>
          <span>Maritime IEC 62288 Compliant</span>
          <span>|</span>
        </div>
      </div>
    </div>
  );
}
