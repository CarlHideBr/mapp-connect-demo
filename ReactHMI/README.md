# React HMI

- Dev UI: `npm run dev` (Vite)
- Mock server: `npm run serve:mock` (http://localhost:3001)
- Build: `npm run build`
- Deploy to Automation Studio user files web: `npm run deploy`

Notes
- Viewport is 1366 x 768 and centered in the page.
- The app authenticates to mappConnect and connects to OPC UA (default: opc.tcp://127.0.0.1:4840). Configure in `src/mc/mcConfig.ts` if needed.
- During dev, `/api/1.0` is proxied to http://localhost:8080 (mappConnect). WebSocket is also proxied.
- You can still use the mock server for UI-only testing; pages are wired for real mappConnect.
