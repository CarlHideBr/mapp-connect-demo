import React, { useState } from 'react';
import './Alarm.css';

interface Alarm {
  id: number;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  acknowledged: boolean;
}

const mockAlarms: Alarm[] = [
  { id: 1, timestamp: '2025-11-04 14:23:15', severity: 'critical', message: 'Robot axis fault detected', acknowledged: false },
  { id: 2, timestamp: '2025-11-04 14:21:42', severity: 'warning', message: 'Conveyor speed deviation exceeds 5%', acknowledged: false },
  { id: 3, timestamp: '2025-11-04 14:18:30', severity: 'critical', message: 'Heater temperature out of range', acknowledged: false },
  { id: 4, timestamp: '2025-11-04 14:12:05', severity: 'warning', message: 'Low air pressure detected', acknowledged: true },
  { id: 5, timestamp: '2025-11-04 14:05:22', severity: 'info', message: 'System started in manual mode', acknowledged: true },
  { id: 6, timestamp: '2025-11-04 13:58:11', severity: 'warning', message: 'Door sensor intermittent signal', acknowledged: true },
];

export default function AlarmPage() {
  const [alarms, setAlarms] = useState<Alarm[]>(mockAlarms);

  const acknowledge = (id: number) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const acknowledgeAll = () => {
    setAlarms(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  const activeCount = alarms.filter(a => !a.acknowledged).length;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: '#e6e8ef' }}>
          Active Alarms <span style={{ color: '#9aa3b2', fontSize: 14, fontWeight: 400 }}>({activeCount} unacknowledged)</span>
        </h2>
        <button 
          onClick={acknowledgeAll}
          disabled={activeCount === 0}
          style={buttonStyle(activeCount === 0)}
        >
          Acknowledge All
        </button>
      </div>
      
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Timestamp</th>
            <th style={thStyle}>Severity</th>
            <th style={thStyle}>Message</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {alarms.map(alarm => (
            <tr key={alarm.id} style={trStyle(alarm.acknowledged)}>
              <td style={tdStyle}>{alarm.timestamp}</td>
              <td style={tdStyle}>
                <span style={severityBadge(alarm.severity)}>{alarm.severity.toUpperCase()}</span>
              </td>
              <td style={tdStyle}>{alarm.message}</td>
              <td style={tdStyle}>
                {alarm.acknowledged ? (
                  <span style={{ color: '#5a8a5a' }}>✓ Acknowledged</span>
                ) : (
                  <span style={{ color: '#d94848', fontWeight: 600 }}>⚠ Active</span>
                )}
              </td>
              <td style={tdStyle}>
                {!alarm.acknowledged && (
                  <button 
                    onClick={() => acknowledge(alarm.id)}
                    style={ackButtonStyle}
                  >
                    Acknowledge
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#0f1118',
  border: '1px solid #1f2840',
  borderRadius: 8,
  overflow: 'hidden',
};

const thStyle: React.CSSProperties = {
  backgroundColor: '#171a21',
  color: '#9aa3b2',
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: 13,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  borderBottom: '2px solid #1f2840',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  color: '#e6e8ef',
  borderBottom: '1px solid #1a1e28',
  fontSize: 14,
};

const trStyle = (acked: boolean): React.CSSProperties => ({
  opacity: acked ? 0.5 : 1,
  transition: 'opacity 0.2s',
});

const severityBadge = (severity: 'critical' | 'warning' | 'info'): React.CSSProperties => {
  const colors = {
    critical: { bg: '#3a1010', color: '#ff6b6b', border: '#5a1818' },
    warning: { bg: '#3a2810', color: '#ffb347', border: '#5a3810' },
    info: { bg: '#10283a', color: '#6bb6ff', border: '#18385a' },
  };
  const c = colors[severity];
  return {
    display: 'inline-block',
    letterSpacing: 0.5,
  };
};

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #1f2840',
  cursor: disabled ? 'not-allowed' : 'pointer',
  color: disabled ? '#555' : '#e6e8ef',
  backgroundColor: disabled ? '#1a1e28' : '#1a2b4b',
  fontWeight: 600,
  fontSize: 14,
  opacity: disabled ? 0.4 : 1,
});

const ackButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 6,
  border: '1px solid #1f2840',
  cursor: 'pointer',
  color: '#e6e8ef',
  backgroundColor: '#0f3a2a',
  fontSize: 13,
  fontWeight: 600,
};
