export function getApiBaseUrl() {
  // In dev, go through Vite proxy by using a relative path.
  if (import.meta.env?.DEV) return '/api/1.0';
  // In production, talk to mappConnect directly on standard ports.
  const isHttps = window.location.protocol === 'https:';
  const port = isHttps ? 8443 : 8080;
  const proto = isHttps ? 'https' : 'http';
  return `${proto}://${window.location.hostname}:${port}/api/1.0`;
}

export function getPushChannelUrl() {
  // In dev, use relative ws path to leverage Vite proxy with ws: true.
  if (import.meta.env?.DEV) return `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/1.0/pushchannel`;
  const isHttps = window.location.protocol === 'https:';
  const port = isHttps ? 8443 : 8080;
  const scheme = isHttps ? 'wss' : 'ws';
  return `${scheme}://${window.location.hostname}:${port}/api/1.0/pushchannel`;
}

export const OPCUA_ENDPOINT_URL = 'opc.tcp://127.0.0.1:4840';

// Configure NodeIds here. Provide full NodeId including namespace index (ns=X)
// Adjust to your project mapping in OPC UA server.
export const NODE_IDS = {
  // Structured HMI root; reading its "value" yields the entire structure
  machineHmi: 'ns=4;s=::Program:Main.MachineHmi',
  // Optional direct child nodes for commands
  start: 'ns=4;s=::Program:Main.MachineHmi.Commands.Start',
  stop: 'ns=4;s=::Program:Main.MachineHmi.Commands.Stop'
};
