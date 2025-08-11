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
		 - `../user_partition/web`
	 - Result: files are available to the PLC web server after transfer.

3) Transfer to target in Automation Studio

	 - Open the `.apj` project in Automation Studio.
	 - Ensure the web files exist under "user partition" → `web` in the file system view.
	 - Do a normal Download/Transfer to your target (PLC or ARsim).
	 - After runtime starts, browse to the PLC web server (e.g. `http://<plc-ip>/` or the configured path) to load the React HMI.

Tip: You can also deploy while the project is open; the next Download will include updated web files.

Notes
- Viewport is 1366 x 768 and centered in the page.
- The app authenticates to mappConnect and connects to OPC UA (default: opc.tcp://127.0.0.1:4840). Configure in `src/mc/mcConfig.ts` if needed.
- During dev, `/api/1.0` is proxied to http://localhost:8080 (mappConnect). WebSocket is also proxied.
- You can still use the mock server for UI-only testing; pages are wired for real mappConnect.
