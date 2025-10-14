#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const dist = path.join(projectRoot, 'dist')
// New deployment target inside the Automation Studio project logical folder
// This will mirror into the mappConnect www root on transfer
const target = path.resolve(projectRoot, '..', 'Logical', 'mappConnect', 'wwwRoot')

// 1. Run production build (tsc + vite build via npm script)
console.log('[deploy] Building production bundle...')
console.log('[deploy] Node version:', process.version)
try {
  const ver = spawnSync(npmCmd, ['-v'], { cwd: projectRoot })
  if (ver.status === 0) console.log('[deploy] npm version:', ver.stdout?.toString().trim())
} catch {}
console.log('[deploy] CWD:', projectRoot)
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const buildResult = spawnSync(`${npmCmd} run build`, { cwd: projectRoot, stdio: 'inherit', shell: true })
if (buildResult.status !== 0) {
  console.error(`[deploy] npm run build failed (status=${buildResult.status} signal=${buildResult.signal}). Attempting direct vite build fallback...`)
  const viteResult = spawnSync(`${npmCmd} exec vite build`, { cwd: projectRoot, stdio: 'inherit', shell: true })
  if (viteResult.status !== 0) {
    console.error(`[deploy] Fallback vite build via npm exec failed (status=${viteResult.status} signal=${viteResult.signal}). Trying npx vite build...`)
    const directVite = spawnSync('npx vite build', { cwd: projectRoot, stdio: 'inherit', shell: true })
    if (directVite.status !== 0) {
      console.error(`[deploy] Direct npx vite build failed (status=${directVite.status} signal=${directVite.signal}). Aborting.`)
      process.exit(directVite.status || 1)
    } else {
      console.log('[deploy] Direct npx vite build succeeded.')
    }
  } else {
    console.log('[deploy] Fallback vite build succeeded.')
  }
}

if (!fs.existsSync(dist)) {
  console.error('[deploy] Build output not found after build (missing dist folder). Aborting.')
  process.exit(1)
}

if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true })

// 2. Clean existing target (preserving Package.pkg if present)
console.log('[deploy] Cleaning target directory:', target)
for (const entry of fs.readdirSync(target)) {
  if (entry === 'Package.pkg') continue
  const p = path.join(target, entry)
  fs.rmSync(p, { recursive: true, force: true })
}

function copyDir(src, dst) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true })
  for (const item of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, item.name)
    const d = path.join(dst, item.name)
    if (item.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

// 3. Copy new build
copyDir(dist, target)
console.log('[deploy] Deployed dist to', target)
console.log('[deploy] Next steps: Transfer project to PLC (Download). mappConnect should now serve the files from / (or configured base).')
