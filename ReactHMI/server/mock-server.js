#!/usr/bin/env node
import http from 'node:http'

const port = process.env.PORT ? Number(process.env.PORT) : 3001

function json(res, obj) {
  const body = JSON.stringify(obj)
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
  res.end(body)
}

function simulate() {
  // Deterministic-ish simulated values
  const t = Date.now() / 1000
  const saw = (min, max, speed) => {
    const span = max - min
    const phase = (t * speed) % 1
    return min + phase * span
  }
  const osc = (center, amp, speed) => center + Math.sin(t * speed) * amp

  return {
    Conveyor: {
      Running: true,
      Fault: false,
      Speed: Number(saw(0, 2.0, 0.05).toFixed(2)),
      Load: Number(osc(50, 40, 0.5).toFixed(1)),
      PartsCount: Math.floor(t) % 1000,
      Mode: 'AUTO'
    },
    Heater: {
      Heating: Math.sin(t * 0.7) < 0,
      Fault: false,
      Temperature: Number(osc(180, 5, 0.4).toFixed(1)),
      Setpoint: 180,
      PowerPercent: Number(saw(5, 60, 0.2).toFixed(0))
    },
    Robot: {
      Auto: true,
      Fault: false,
      X: Number(saw(0, 100, 0.15).toFixed(0)),
      Y: Number(saw(0, 50, 0.1).toFixed(0)),
      Z: 0,
      State: 'Auto'
    },
    LineRunning: true,
    AnyFault: false,
    RunRequest: true
  }
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/mock/machine') {
    return json(res, simulate())
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Mock server is running. Endpoint: /api/mock/machine')
})

server.listen(port, () => {
  console.log(`Mock server listening on http://localhost:${port}`)
})
