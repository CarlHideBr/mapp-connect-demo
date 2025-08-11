import React, { useEffect, useMemo, useState } from 'react';
import { getApiBaseUrl, getPushChannelUrl, OPCUA_ENDPOINT_URL, NODE_IDS } from '../mc/mcConfig';
import Api from '../mc/Api';
import Session from '../mc/Session';
import type { MachineHmiData } from '../mc/types';
import Home from './pages/Home';
import StatusPage from './pages/Status';
import AlarmPage from './pages/Alarm';
import RecipePage from './pages/Recipe';
import SettingsPage from './pages/Settings';
import StateBadge from './components/StateBadge';

const shellSize = { width: 1366, height: 768 } as const;

function useHashPath() {
  const [path, setPath] = useState<string>(() => (location.hash.slice(1) || '/'));
  useEffect(() => {
    const fn = () => setPath(location.hash.slice(1) || '/');
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);
  const navigate = (to: string) => { location.hash = to; };
  return { path, navigate };
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  const onClick = (e: React.MouseEvent) => { e.preventDefault(); location.hash = to; };
  return <a href={`#${to}`} onClick={onClick} style={linkStyle(active)}>{children}</a>;
}

export default function App() {
  const [state, setState] = useState<string>('Disconnected');
  const [substate, setSubstate] = useState<string>('');
  const [authOk, setAuthOk] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [machine, setMachine] = useState<MachineHmiData | null>(null);
  const { path } = useHashPath();

  const api = useMemo(() => new Api(getApiBaseUrl()), []);

  useEffect(() => {
    let cancelled = false;
    api.auth().then((r) => { if (!cancelled) setAuthOk(r.ok); }).catch(() => setAuthOk(false));
    const ping = window.setInterval(() => api.ping().catch(() => {}), 30000);
    return () => { cancelled = true; window.clearInterval(ping); };
  }, [api]);

  async function connect() {
    const socket = new WebSocket(getPushChannelUrl());
    const s = new Session(getApiBaseUrl(), socket);
    const st = await s.connect(OPCUA_ENDPOINT_URL).catch((err) => { setState(String(err)); return undefined; });
    if (!st) return;
    setSession(s);
    const result = await s.read(NODE_IDS.machineHmi, 'value') as any;
    if (result.status?.isGood()) {
      const val = result.value as MachineHmiData;
      setMachine(val);
      setState(val?.State ?? 'Connected');
      setSubstate(val?.Substate ?? '');
    }
  }

  async function writeCmd(cmd: 'Start' | 'Stop') {
    if (!session) return;
    const node = cmd === 'Start' ? NODE_IDS.start : NODE_IDS.stop;
    await session.write(node, 'value', true);
  }

  useEffect(() => {
    if (!session) return;
    let alive = true;
    const id = window.setInterval(async () => {
      try {
        const res: any = await session.read(NODE_IDS.machineHmi, 'value');
        if (alive && res.status?.isGood()) {
          const val = res.value as MachineHmiData;
          setMachine(val);
          setState(val?.State ?? state);
          setSubstate(val?.Substate ?? substate);
        }
      } catch {}
    }, 1000);
    return () => { alive = false; window.clearInterval(id); };
  }, [session]);

  return (
    <div style={{ width: shellSize.width, height: shellSize.height, margin: '0 auto', background: '#0b0d13', color: '#e6e8ef', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial' }}>
      <header style={{ padding: 12, borderBottom: '1px solid #171a21', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f1118' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontWeight: 700, letterSpacing: 0.4 }}>Machine HMI</span>
          <nav style={{ display: 'flex', gap: 12 }}>
            <NavLink to="/" active={path === '/'}>Home</NavLink>
            <NavLink to="/recipe" active={path === '/recipe'}>Recipe</NavLink>
            <NavLink to="/alarm" active={path === '/alarm'}>Alarm</NavLink>
            <NavLink to="/status" active={path === '/status'}>Status</NavLink>
            <NavLink to="/settings" active={path === '/settings'}>Settings</NavLink>
          </nav>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StateBadge state={machine?.State ?? state} substate={machine?.Substate ?? substate} />
          <button onClick={connect} disabled={!authOk || !!session} style={btn('primary')}>Connect</button>
          <button onClick={() => writeCmd('Start')} disabled={!session} style={btn('success')}>Start</button>
          <button onClick={() => writeCmd('Stop')} disabled={!session} style={btn('danger')}>Stop</button>
        </div>
      </header>
      <main style={{ padding: 16, height: shellSize.height - 64, boxSizing: 'border-box' }}>
        {path === '/' && <Home machine={machine} />}
        {path === '/recipe' && <RecipePage />}
        {path === '/alarm' && <AlarmPage />}
        {path === '/settings' && <SettingsPage />}
        {path === '/status' && <StatusPage machine={machine} />}
      </main>
    </div>
  );
}

const linkStyle = (active: boolean) => ({ color: active ? '#c7d6ff' : '#9aa3b2', textDecoration: 'none', padding: '6px 8px', borderRadius: 6, background: active ? '#101528' : 'transparent', border: active ? '1px solid #1e2942' : '1px solid transparent' });
const btn = (kind: 'primary' | 'success' | 'danger') => ({
  padding: '6px 10px', borderRadius: 8, border: '1px solid #1f2840', cursor: 'pointer', color: '#e6e8ef',
  background: kind === 'primary' ? '#1a2b4b' : kind === 'success' ? '#0f3a2a' : '#3a1010'
});
