import React, { useEffect } from 'react';
import type { MachineHmiData } from '../../mc/types';
import './Marine.css';

// Open Bridge: palette + components
import '@oicl/openbridge-webcomponents/src/palettes/variables.css';
import '@oicl/openbridge-webcomponents/dist/components/top-bar/top-bar.js';
import '@oicl/openbridge-webcomponents/dist/components/slider/slider.js';

// Declare custom elements for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'obc-top-bar': any;
      'obc-status-text': any;
      'obc-slider': any;
    }
  }
}

export default function MarinePage({ machine }: { machine: MachineHmiData | null }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-obc-theme', 'dusk');
    return () => document.documentElement.removeAttribute('data-obc-theme');
  }, []);

  const alarms: { text: string; severity: 'critical' | 'warning' | 'info' }[] = [];
  if (machine?.Conveyor.Fault) alarms.push({ text: 'Separator Bowl Fault', severity: 'critical' });
  if (machine?.Heater.Fault) alarms.push({ text: 'Cooling System Fault', severity: 'critical' });
  if (machine?.Robot.Fault) alarms.push({ text: 'Fuel Treatment Fault', severity: 'warning' });
  if (!machine?.LineRunning) alarms.push({ text: 'System Standby', severity: 'info' });

  const navigationData = {
    heading: (machine?.Robot.X || 0) * 3.6,
    speed: machine?.Conveyor.Speed ? Math.max(0, machine.Conveyor.Speed * 20) : 0,
    courseOverGround: ((machine?.Robot.Y || 0) * 1.8) % 360,
    latitude: 56.2639 + (machine?.Robot.Z || 0) * 0.001,
    longitude: 9.5018 + (machine?.Robot.X || 0) * 0.001,
  };

  const engineData = {
    mainEngineLoad: machine?.Heater.PowerPercent || 0,
    mainEngineSpeed: machine?.Conveyor.Speed ? machine.Conveyor.Speed * 200 : 0,
    fuelConsumption: machine?.Heater.Temperature ? (machine.Heater.Temperature / 100) * 150 : 0,
    generatorLoad: machine?.Conveyor.Load ? machine.Conveyor.Load * 2 : 0,
    voltage: 440 + (machine?.Heater.PowerPercent || 0) * 0.5,
  };

  const separatorData = {
    bowlSpeed: machine?.Conveyor.Speed ? machine.Conveyor.Speed * 1000 : 0,
    oilPressure: machine?.Heater.Temperature || 0,
    throughput: machine?.Conveyor.Load || 0,
    running: machine?.Conveyor.Running || false,
    temperature: machine?.Heater.Temperature || 0,
  };

  const pumpData = {
    pressure: machine?.Heater.PowerPercent || 0,
    flow: machine?.Conveyor.Speed ? machine.Conveyor.Speed * 10 : 0,
    temperature: machine?.Heater.Temperature || 0,
  };

  const tankData = {
    fuelOilHeavy: machine?.Conveyor.Load || 0,
    fuelOilLight: 100 - (machine?.Conveyor.Load || 0),
    freshWater: machine?.Heater.PowerPercent || 0,
    seawaterCooling: 100 - (machine?.Heater.PowerPercent || 0),
    ballastWater: 50 + (machine?.Robot.Z || 0) * 5,
  };

  const environmentData = {
    airTemp: 12 + (machine?.Heater.Temperature || 0) * 0.05,
    seaTemp: 8 + (machine?.Heater.Temperature || 0) * 0.02,
    windSpeed: Math.abs((machine?.Robot.X || 0) * 15),
    waveHeight: 1.5 + (machine?.Robot.Y || 0) * 0.3,
    visibility: machine?.LineRunning ? 10 : 2,
  };

  return (
    <div className="marinePage">
      <obc-top-bar application-name="Marine Systems" />

      <div className="marineGrid">
        {/* Navigation & Positioning */}
        <section className="marineCard">
          <h3 className="marineCard__title">
            <span className="marineIcon">🧭</span>
            Navigation
          </h3>
          <div className="marineContent">
            <div className="statusGrid">
              <div className="statusRow"><span className="statusLabel">Heading:</span><span className="statusValue">{navigationData.heading.toFixed(1)}°</span></div>
              <div className="statusRow"><span className="statusLabel">Course over Ground:</span><span className="statusValue">{navigationData.courseOverGround.toFixed(1)}°</span></div>
              <div className="statusRow"><span className="statusLabel">Speed:</span><span className="statusValue">{navigationData.speed.toFixed(1)} kts</span></div>
              <div className="statusRow"><span className="statusLabel">Latitude:</span><span className="statusValue">{navigationData.latitude.toFixed(4)}°</span></div>
              <div className="statusRow"><span className="statusLabel">Longitude:</span><span className="statusValue">{navigationData.longitude.toFixed(4)}°</span></div>
            </div>
          </div>
        </section>

        {/* Main Engine with Open Bridge gauges */}
        <section className="marineCard">
          <h3 className="marineCard__title">
            <span className="marineIcon">⚡</span>
            Main Engine
          </h3>
          <div className="marineContent">
            <div className="gaugeContainer">
              <obc-slider value={engineData.mainEngineLoad} min="0" max="100" step="1" variant="no-input">
                <span slot="icon-left">Load</span>
                <span slot="icon-right">%</span>
              </obc-slider>
              <obc-slider value={engineData.mainEngineSpeed} min="0" max="4000" step="10" variant="no-input">
                <span slot="icon-left">RPM</span>
                <span slot="icon-right"></span>
              </obc-slider>
              <obc-slider value={engineData.generatorLoad} min="0" max="200" step="1" variant="no-input">
                <span slot="icon-left">Gen</span>
                <span slot="icon-right">%</span>
              </obc-slider>
            </div>
            <div className="statusGrid">
              <div className="statusRow"><span className="statusLabel">Fuel Consumption:</span><span className="statusValue">{engineData.fuelConsumption.toFixed(1)} t/day</span></div>
              <div className="statusRow"><span className="statusLabel">Electrical Voltage:</span><span className="statusValue">{engineData.voltage.toFixed(1)} V</span></div>
            </div>
          </div>
        </section>

        {/* Oil/Water Separator */}
        <section className="marineCard">
          <h3 className="marineCard__title">
            <span className="marineIcon">⚙️</span>
            Oil/Water Separator
          </h3>
          <div className="marineContent">
            <div className="statusGrid">
              <div className="statusRow"><span className="statusLabel">Status:</span><span className="statusValue">{separatorData.running ? 'Running' : 'Stopped'}</span></div>
              <div className="statusRow"><span className="statusLabel">Bowl Speed:</span><span className="statusValue">{separatorData.bowlSpeed.toFixed(0)} RPM</span></div>
              <div className="statusRow"><span className="statusLabel">Throughput:</span><span className="statusValue">{separatorData.throughput.toFixed(0)} %</span></div>
              <div className="statusRow"><span className="statusLabel">Oil Pressure:</span><span className="statusValue">{separatorData.oilPressure.toFixed(1)} bar</span></div>
              <div className="statusRow"><span className="statusLabel">Temperature:</span><span className="statusValue">{separatorData.temperature.toFixed(1)} °C</span></div>
              <div className="statusRow"><span className="statusLabel">Parts Processed:</span><span className="statusValue">{machine?.Conveyor.PartsCount || 0}</span></div>
            </div>
          </div>
        </section>

        {/* Tank Levels */}
        <section className="marineCard">
          <h3 className="marineCard__title">
            <span className="marineIcon">🚇</span>
            Tank Levels
          </h3>
          <div className="marineContent">
            <div className="tankGrid">
              <div className="tankItem"><span className="tankLabel">Heavy Fuel Oil</span><div className="tankBar"><div className="tankFill" style={{ width: `${tankData.fuelOilHeavy}%` }}></div></div><span className="tankValue">{tankData.fuelOilHeavy.toFixed(0)}%</span></div>
              <div className="tankItem"><span className="tankLabel">Light Fuel Oil</span><div className="tankBar"><div className="tankFill" style={{ width: `${tankData.fuelOilLight}%` }}></div></div><span className="tankValue">{tankData.fuelOilLight.toFixed(0)}%</span></div>
              <div className="tankItem"><span className="tankLabel">Fresh Water</span><div className="tankBar"><div className="tankFill" style={{ width: `${tankData.freshWater}%` }}></div></div><span className="tankValue">{tankData.freshWater.toFixed(0)}%</span></div>
              <div className="tankItem"><span className="tankLabel">Seawater Cooling</span><div className="tankBar"><div className="tankFill" style={{ width: `${tankData.seawaterCooling}%` }}></div></div><span className="tankValue">{tankData.seawaterCooling.toFixed(0)}%</span></div>
              <div className="tankItem"><span className="tankLabel">Ballast Water</span><div className="tankBar"><div className="tankFill" style={{ width: `${tankData.ballastWater}%` }}></div></div><span className="tankValue">{tankData.ballastWater.toFixed(0)}%</span></div>
            </div>
          </div>
        </section>

        {/* Environmental Conditions */}
        <section className="marineCard">
          <h3 className="marineCard__title">
            <span className="marineIcon">🌊</span>
            Environmental Conditions
          </h3>
          <div className="marineContent">
            <div className="statusGrid">
              <div className="statusRow"><span className="statusLabel">Air Temperature:</span><span className="statusValue">{environmentData.airTemp.toFixed(1)} °C</span></div>
              <div className="statusRow"><span className="statusLabel">Sea Temperature:</span><span className="statusValue">{environmentData.seaTemp.toFixed(1)} °C</span></div>
              <div className="statusRow"><span className="statusLabel">Wind Speed:</span><span className="statusValue">{environmentData.windSpeed.toFixed(1)} kts</span></div>
              <div className="statusRow"><span className="statusLabel">Wave Height:</span><span className="statusValue">{environmentData.waveHeight.toFixed(2)} m</span></div>
              <div className="statusRow"><span className="statusLabel">Visibility:</span><span className="statusValue">{environmentData.visibility.toFixed(1)} NM</span></div>
            </div>
          </div>
        </section>

        {/* Cooling Water System */}
        <section className="marineCard">
          <h3 className="marineCard__title">
            <span className="marineIcon">💧</span>
            Cooling Water System
          </h3>
          <div className="marineContent">
            <div className="statusGrid">
              <div className="statusRow"><span className="statusLabel">Status:</span><span className="statusValue">{machine?.Heater.Heating ? 'Active' : 'Inactive'}</span></div>
              <div className="statusRow"><span className="statusLabel">Pressure:</span><span className="statusValue">{pumpData.pressure.toFixed(1)} bar</span></div>
              <div className="statusRow"><span className="statusLabel">Flow Rate:</span><span className="statusValue">{pumpData.flow.toFixed(1)} L/min</span></div>
              <div className="statusRow"><span className="statusLabel">Temperature:</span><span className="statusValue">{pumpData.temperature.toFixed(1)} °C</span></div>
              <div className="statusRow"><span className="statusLabel">Setpoint:</span><span className="statusValue">{machine?.Heater.Setpoint?.toFixed(1) || '--'} °C</span></div>
            </div>
          </div>
        </section>

        {/* Fuel Treatment Unit */}
        <section className="marineCard">
          <h3 className="marineCard__title">
            <span className="marineIcon">⛽</span>
            Fuel Treatment Unit
          </h3>
          <div className="marineContent">
            <div className="statusGrid">
              <div className="statusRow"><span className="statusLabel">Mode:</span><obc-status-text status={machine?.Robot.Auto ? 'auto' : 'manual'} label={machine?.Robot.Auto ? 'Automatic' : 'Manual'} /></div>
              <div className="statusRow"><span className="statusLabel">State:</span><span className="statusValue">{machine?.Robot.State || 'Unknown'}</span></div>
              <div className="statusRow"><span className="statusLabel">Position X:</span><span className="statusValue">{machine?.Robot.X?.toFixed(2) || '--'} mm</span></div>
              <div className="statusRow"><span className="statusLabel">Position Y:</span><span className="statusValue">{machine?.Robot.Y?.toFixed(2) || '--'} mm</span></div>
              <div className="statusRow"><span className="statusLabel">Position Z:</span><span className="statusValue">{machine?.Robot.Z?.toFixed(2) || '--'} mm</span></div>
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
                    <span className="alertIcon">{alarm.severity === 'critical' ? '🔴' : alarm.severity === 'warning' ? '🟡' : 'ℹ️'}</span>
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
