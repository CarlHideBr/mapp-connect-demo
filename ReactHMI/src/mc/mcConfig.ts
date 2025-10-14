// Allow overriding defaults via environment variables defined in .env* files.
// VITE_API_BASE_URL: full base URL OR relative path (e.g. /api/1.0)
// VITE_PUSH_WS_URL: full ws(s):// URL
// VITE_OPCUA_ENDPOINT: opc.tcp:// URL

function env(name: string): string | undefined {
  return (import.meta as any).env?.[name];
}

export function getApiBaseUrl() {
  const override = env('VITE_API_BASE_URL');
  if (override && override.trim().length) return override.replace(/\/$/, '');
  // Use a relative path so the HMI origin (dev proxy or production server) always matches.
  // If the HMI is hosted on the PLC, this guarantees same-origin; if hosted elsewhere, set VITE_API_BASE_URL.
  return '/api/1.0';
}

export function getPushChannelUrl() {
  const override = env('VITE_PUSH_WS_URL');
  if (override && override.trim().length) return override.replace(/\/$/, '');
  const isHttps = window.location.protocol === 'https:';
  const scheme = isHttps ? 'wss' : 'ws';
  // Always target current origin host:port to avoid CORS; Vite proxy handles ws when in dev.
  return `${scheme}://${window.location.host}/api/1.0/pushchannel`;
}

export const OPCUA_ENDPOINT_URL = env('VITE_OPCUA_ENDPOINT') || 'opc.tcp://127.0.0.1:4840';

// Namespace URI typically used for PLC process variables
export const PLC_NAMESPACE_URI = 'http://br-automation.com/OpcUa/PLC/PV/';

// Configure NodeIds here. Provide full NodeId including namespace index (ns=X)
// Adjust to your project mapping in OPC UA server.
export const NODE_IDS = {
  // Structured HMI root; reading its "value" yields the entire structure
  machineHmi: 'ns=4;s=::Program:Main.MachineHmi',
  // Optional direct child nodes for commands
  start: 'ns=4;s=::Program:Main.MachineHmi.Commands.Start',
  stop: 'ns=4;s=::Program:Main.MachineHmi.Commands.Stop'
};

// Base variable path for the MachineHmi structure (adjust if PLC variable name changes)
export const MACHINE_HMI_BASE = '::Main:MachineHmi';

export interface DynamicNodeIds {
  ns: number; // resolved namespace index
  machineHmi: string;
  start: string;
  stop: string;
}

export function buildNodeIds(nsIndex: number): DynamicNodeIds {
  // Build using resolved namespace index and base variable path
  const base = `ns=${nsIndex};s=${MACHINE_HMI_BASE}`;
  return {
    ns: nsIndex,
    machineHmi: base,
    start: `${base}.Commands.Start`,
    stop: `${base}.Commands.Stop`
  };
}
