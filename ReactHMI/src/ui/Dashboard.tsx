import React from 'react'
import { useEffect, useState } from 'react'

interface ConveyorHmiData {
  Running: boolean
  Fault: boolean
  Speed: number
  Load: number
  PartsCount: number
  Mode: string
}

interface HeaterHmiData {
  Heating: boolean
  Fault: boolean
  Temperature: number
  Setpoint: number
  PowerPercent: number
}

interface RobotHmiData {
  Auto: boolean
  Fault: boolean
  X: number
  Y: number
  Z: number
  State: string
}

interface MachineHmiData {
  Conveyor: ConveyorHmiData
  Heater: HeaterHmiData
  Robot: RobotHmiData
  LineRunning: boolean
  AnyFault: boolean
}

export function Dashboard() {
  const [data, setData] = useState<MachineHmiData | null>(null)

  useEffect(() => {
    let mounted = true
    const tick = () => {
      fetch('/api/mock/machine').then(r => r.json()).then(d => {
        if (mounted) setData(d)
      }).catch(() => {})
    }
    tick()
    const id = setInterval(tick, 500)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  if (!data) return <div style={{ padding: 16 }}>Loading…</div>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
      <Panel title="Conveyor">
        <KV k="Running" v={String(data.Conveyor.Running)} />
        <KV k="Fault" v={String(data.Conveyor.Fault)} />
        <KV k="Speed" v={`${data.Conveyor.Speed.toFixed(2)} m/s`} />
        <KV k="Load" v={`${data.Conveyor.Load.toFixed(1)} %`} />
        <KV k="Parts" v={String(data.Conveyor.PartsCount)} />
        <KV k="Mode" v={data.Conveyor.Mode} />
      </Panel>
      <Panel title="Heater">
        <KV k="Heating" v={String(data.Heater.Heating)} />
        <KV k="Fault" v={String(data.Heater.Fault)} />
        <KV k="Temp" v={`${data.Heater.Temperature.toFixed(1)} °C`} />
        <KV k="Setpoint" v={`${data.Heater.Setpoint.toFixed(1)} °C`} />
        <KV k="Power" v={`${data.Heater.PowerPercent.toFixed(0)} %`} />
      </Panel>
      <Panel title="Robot">
        <KV k="Auto" v={String(data.Robot.Auto)} />
        <KV k="Fault" v={String(data.Robot.Fault)} />
        <KV k="X" v={data.Robot.X.toFixed(0)} />
        <KV k="Y" v={data.Robot.Y.toFixed(0)} />
        <KV k="Z" v={data.Robot.Z.toFixed(0)} />
        <KV k="State" v={data.Robot.State} />
      </Panel>
    </div>
  )
}

function Panel({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #2a2d34', borderRadius: 6, padding: 12, background: '#151922' }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 6, columnGap: 10 }}>
        {children}
      </div>
    </div>
  )
}

function KV({ k, v }: { k: string, v: string }) {
  return (
    <>
      <div style={{ opacity: 0.7 }}>{k}</div>
      <div>{v}</div>
    </>
  )
}
