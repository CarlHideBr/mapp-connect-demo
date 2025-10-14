# React HMI

- Dev UI: `npm run dev` (Vite)
- Mock server: `npm run serve:mock` (http://localhost:3001)
- Build: `npm run build`
- Deploy to Automation Studio user files web: `npm run deploy`

## Build and deploy to PLC web folder

1) Build the HMI

	 - In a PowerShell terminal from `ReactHMI/` run:
		 - `npm run build`
	 - This creates the production site in `ReactHMI/dist`.

2) Deploy into the Automation Studio project

	 - From `ReactHMI/` run:
		 - `npm run deploy`
	 - This copies `dist/` into:
		 - `../Logical/mappConnect/wwwRoot`
	 - Result: files are available to the PLC web server (mappConnect www root) after transfer.

3) Transfer to target in Automation Studio

	 - Open the `.apj` project in Automation Studio.
	 - Ensure the web files exist under "user partition" → `web` in the file system view.
	 - Do a normal Download/Transfer to your target (PLC or ARsim).
	 - After runtime starts, browse to the PLC web server (e.g. `http://<plc-ip>/` or the configured path) to load the React HMI.

Tip: You can also deploy while the project is open; the next Download will include updated web files.

Notes
- Viewport is 1366 x 768 and centered in the page.
- The app authenticates to mappConnect and connects to OPC UA (default: opc.tcp://127.0.0.1:4840). Configure in `src/mc/mcConfig.ts` if needed.
- During dev, `/api/1.0` is proxied to http://localhost:80 (mappConnect). WebSocket is also proxied.
- You can still use the mock server for UI-only testing; pages are wired for real mappConnect.

---

## Quick Start: Connection & Extending Variables

### 1. How the connection is made (sequence)
1. Browser loads the React bundle served by mappConnect (or Vite in dev).
2. Front-end calls `GET /api/1.0/auth` (handled in `Api.auth()`) to obtain a session cookie (default Everyone role if not secured).
3. A WebSocket is opened to `/api/1.0/pushchannel` (future: for subscription events).
4. An OPC UA session is created (`Session.connect()` posts to `/api/1.0/opcua/sessions`).
5. Namespace index for PLC variables is resolved via `Session.resolveNamespace(PLC_NAMESPACE_URI)`.
6. Dynamic NodeIds are constructed with `buildNodeIds(nsIndex)`.
7. Reads (`readValue`) and writes (`writeValue`) perform REST calls to:
	 - Read: `GET /api/1.0/opcua/sessions/{sid}/nodes/{encodedNodeId}/attributes/Value`
	 - Write: `POST /api/1.0/opcua/sessions/{sid}/nodes/{encodedNodeId}/attributes/Value` body: `{ "value": <JSON> }`

### 2. PLC side: declare / extend the structure
Define a structured variable you expose over OPC UA. Example (Automation Studio):

Global.typ:
```iecst
TYPE MachineHmiType :
STRUCT
		State       : STRING[32];
		Substate    : STRING[32];
		Commands    : STRUCT
				Start : BOOL;
				Stop  : BOOL;
		END_STRUCT;
		ProdCount   : DINT;      // new variable example
		Temperature : REAL;      // new variable example
END_STRUCT
END_TYPE
```

Global.var:
```iecst
VAR_GLOBAL
		MachineHmi : MachineHmiType;
END_VAR
```

If you add a new member (e.g. `ProdCount`) just rebuild / download the PLC project; the OPC UA address space updates automatically. No front-end build is required unless you hard-coded NodeIds.

### 3. NodeId patterns
- Base structured variable in Main program: `::Main:MachineHmi`
- Member path: append with dot: `::Main:MachineHmi.ProdCount`
- Command BOOL: `::Main:MachineHmi.Commands.Start`
- Final NodeId: `ns=<resolvedIndex>;s=::Main:MachineHmi.ProdCount`

To reference a variable in another program (e.g. `Pack` program with `PackHmi` variable): `ns=<idx>;s=::Pack:PackHmi.State`

### 4. Front-end: reading a new variable
You can either extend the TypeScript interface or access raw property data.

`src/mc/types.ts` (extend interface):
```ts
export interface MachineHmiData {
	State: string;
	Substate: string;
	Commands: { Start: boolean; Stop: boolean };
	ProdCount?: number;       // newly added
	Temperature?: number;     // newly added
}
```

### 5. Example code: resolve namespace, read & write one variable
```ts
import { getApiBaseUrl, getPushChannelUrl, OPCUA_ENDPOINT_URL, PLC_NAMESPACE_URI } from './mc/mcConfig';
import Session from './mc/Session';

async function demoReadWrite() {
	// 1. Open push channel
	const ws = new WebSocket(getPushChannelUrl());
	// 2. Create session helper
	const session = new Session(getApiBaseUrl(), ws);
	// 3. Establish OPC UA session
	await session.connect(OPCUA_ENDPOINT_URL);
	// 4. Resolve namespace index for PLC PVs
	const ns = await session.resolveNamespace(PLC_NAMESPACE_URI);
	// 5. Build NodeId for ProdCount
	const prodCountNode = `ns=${ns};s=::Main:MachineHmi.ProdCount`;
	// 6. Read value
	const readRes: any = await session.readValue(prodCountNode);
	console.log('ProdCount read:', readRes.value, 'status good?', readRes.status?.isGood?.());
	// 7. Write new value (example: increment)
	const newVal = (readRes.value ?? 0) + 1;
	await session.writeValue(prodCountNode, newVal);
	console.log('ProdCount written:', newVal);
}

demoReadWrite().catch(console.error);
```

### 6. Updating the UI to display new fields
In `App.tsx`, after reading the structured value (`machine`), you can render:
```tsx
<div>Prod Count: {machine?.ProdCount}</div>
<div>Temperature: {machine?.Temperature?.toFixed(1)} °C</div>
```

### 7. Adding a brand new program
If you add a program (e.g. `Pack`) and create a variable `PackHmi`:
1. Declare `PackHmi` in that program's global or program variable list.
2. After download, use browse endpoint or directly read:
	 - Build NodeId: `ns=<idx>;s=::Pack:PackHmi`
3. Read structure like any other variable; you may add a new interface (e.g. `PackHmiData`).

### 8. Discovering NodeIds (when unsure)
Use references endpoint (URL-encode NodeId):
```
GET /api/1.0/opcua/sessions/{sid}/nodes/ns%3D<idx>%3Bs%3D%3A%3AMain%3AMachineHmi/references
```
Then drill down members until you see your target. Each child returns its browse name and target NodeId.

### 9. Writing command booleans
Writing a command is identical to other writes:
```ts
const ns = await session.resolveNamespace(PLC_NAMESPACE_URI);
await session.writeValue(`ns=${ns};s=::Main:MachineHmi.Commands.Start`, true);
```
Make sure the PLC logic resets (latches) the BOOL or edge-detects it.

### 10. Common pitfalls
- Namespace index changes after recompile: always resolve by URI at runtime (already in `Session.resolveNamespace`).
- Case sensitivity: Attribute name must be `Value`.
- JSON type mismatch: Ensure the JSON you send matches the variable's data type (e.g. number for DINT, boolean for BOOL).
- Writes to structures: write leaf nodes (members) unless you intend to overwrite the entire structure.

---

## Local development with simulated PLC & OPC UA

The dev workflow assumes three processes:
1. Simulated (or real) mappConnect REST + OPC UA server on localhost (REST port 80 after recent change, UA opc.tcp://127.0.0.1:4840)
2. Vite dev server (port 5173) proxying /api/1.0 -> 8080 and WS upgrades
3. (Optional) Mock server (3001) if you want stub data for `/api/mock/*`

### 1. Start / provide mappConnect + OPC UA

If you run ARsim / Automation Studio runtime locally, ensure:
- OPC UA server listens at: opc.tcp://127.0.0.1:4840
- mappConnect web API available at: http://localhost/api/1.0 (or adjust env overrides)

If you only need to test UI fetch wiring without PLC yet, you can skip this and use the mock server, but OPC UA calls will fail.

### 2. (Optional) Start mock server
```powershell
npm run serve:mock
```

### 3. Start Vite dev server
```powershell
npm run dev
```
This opens the browser at http://localhost:5173. All `/api/1.0` requests and WebSocket upgrades proxy to http://localhost:80.

### 4. Environment overrides
Create or edit `.env.development` (already present) to override defaults:
```bash
# VITE_API_BASE_URL=http://localhost/api/1.0
# VITE_PUSH_WS_URL=ws://localhost/api/1.0/pushchannel
# VITE_OPCUA_ENDPOINT=opc.tcp://127.0.0.1:4841
```
Restart `npm run dev` after changes.

### 5. Verifying connectivity
Open DevTools console and run:
```js
import('./src/mc/OpcUaApi').then(m=>console.log('API base', m.getApiBaseUrl?.()))
```
Expect the relative base `/api/1.0` in dev; network tab should show proxied calls to localhost:8080.

### 6. Common issues
- 404 or 502 on `/api/1.0/*`: Ensure mappConnect server running at port 80 (or adjust `VITE_API_BASE_URL`).
- WebSocket fails: Check that the backend supports `/api/1.0/pushchannel` and proxy ws: true (already configured).
- CORS errors when using full URL override: Use relative path if proxying through Vite; reserve full URL for direct calls without proxy.

### OPC UA attribute / NodeId troubleshooting
- 404 on `/opcua/sessions/<id>/nodes/<nodeId>/attributes/value`: Attribute names are case-sensitive. Use `Value` (capital V). Code now uses `readValue` / `writeValue` helpers enforcing this.
- 404 still occurs with correct case:
	- Verify namespace index (ns=X) matches runtime server; dynamic namespace ordering can shift across builds.
	- Use the discovery endpoint: `GET /api/1.0/opcua/sessions/<id>/nodes/<encodedNodeId>/references` to confirm the node exists.
	- Translate browse path if you constructed NodeId manually.
- Session expired: HEAD keep-alive returns non-204; reconnect and refresh NodeIds.

### Dynamic namespace and NodeId resolution
The app now resolves the PLC process variable namespace URI (`http://br-automation.com/OpcUa/PLC/PV/`) at runtime and builds NodeIds with the returned index. If you see 404s:
1. Check the resolved index in DevTools console (state text may show `Init error:` if failing).
2. Confirm the variable path matches `::Main:MachineHmi` (adjust `MACHINE_HMI_BASE` in `mcConfig.ts` if your PLC program name or variable differs).
3. Use references endpoint to browse: `GET /api/1.0/opcua/sessions/<id>/nodes/ns=<idx>;s=::Main:/references` then drill down.
4. For commands ensure the structure includes `Commands.Start` and `Commands.Stop` members.

## Production deployment flow

`npm run deploy` now performs these steps automatically:
1. Runs the production build (`npm run build`) — transpiles TypeScript and bundles assets with Vite.
2. Cleans `../Logical/mappConnect/wwwRoot` (preserving any `Package.pkg` if present).
3. Copies the fresh `dist/` output into `../Logical/mappConnect/wwwRoot`.
4. Prints next-step instructions (transfer in Automation Studio).

After deploying, perform a normal Download/Transfer in Automation Studio so the files land on the PLC / ARsim filesystem. Then access:
```
http://<plc-ip>/ (or https://<plc-ip>:8443/ if HTTPS enabled)
```

### Production environment variables
If you need explicit host overrides (e.g., different port, HTTPS), edit `.env.production` before running `npm run deploy` and uncomment the desired lines:
```bash
# VITE_API_BASE_URL=https://<plc-host>:8443/api/1.0
# VITE_PUSH_WS_URL=wss://<plc-host>:8443/api/1.0/pushchannel
# VITE_OPCUA_ENDPOINT=opc.tcp://<plc-host>:4840
```
When not set, the runtime code infers base URLs from window.location (now standard ports 80/443) and uses the default OPC UA endpoint.

### Port 80 / 443 change & CORS simplification

The project migrated from non‑standard ports (8080/8443) to standard web ports (80/443) for the PLC web server:

Reasons:
1. Remove explicit port from production URLs so browser treats origin as the same (simplifies embedding / reverse proxy).
2. Avoid CORS preflight complexity when hosting HMI files directly from the PLC.
3. Align with typical IT firewall allowances (80/443 open by default).

Development impact:
- Vite proxy target updated to `http://localhost:80`.
- Relative API base (`/api/1.0`) still preferred in dev so the proxy can inject the correct target.
- If your local runtime still uses 8080, either: (a) change `Config.mappconnect` back temporarily, or (b) override with `VITE_API_BASE_URL` / `VITE_PUSH_WS_URL` pointing to port 8080.

Production impact:
- `getApiBaseUrl()` now omits the port when it is 80/443, generating cleaner links like `http://plc-host/api/1.0`.
- WebSocket URL likewise drops the port.

Security / permissions note:
- Binding to port 80 on some desktop OS setups may require elevated privileges. On PLC runtime this is handled by the runtime environment.

Troubleshooting mismatch:
- Open DevTools console and look for `[mcConfig] origin ... apiBase ...` log. If host/port differ you'll see a warning about potential CORS.
- If you need HTTPS, set `VITE_API_BASE_URL` to `https://<plc-host>/api/1.0` and `VITE_PUSH_WS_URL` to `wss://<plc-host>/api/1.0/pushchannel` (ensure certificate / port 443 configuration in mappConnect).

### CORS quick guide
- Same-origin = scheme + host + port all match.
- By moving to 80/443 and serving the HMI from the same host, all fetches use relative paths and avoid CORS.
- Using absolute URLs with a different port (e.g., 5173 during dev) introduces CORS; the dev proxy bridges this by keeping browser requests same-origin (5173) while forwarding to 80.

Best practice: keep code using relative `/api/1.0` in dev; only specify full URL in environment overrides when truly calling a remote PLC directly without a proxy.

### Live values vs simulation
The production bundle does not include mock data; it immediately attempts real authentication and OPC UA session creation via mappConnect. Ensure the PLC exposes:
- REST API at `/api/1.0` (HTTP 8080 or HTTPS 8443)
- WebSocket push channel at `/api/1.0/pushchannel`
- OPC UA server reachable at the configured endpoint.

