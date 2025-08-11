#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const dist = path.join(projectRoot, 'dist')
const target = path.resolve(projectRoot, '..', 'user_partition', 'web')

if (!fs.existsSync(dist)) {
  console.error('Build output not found. Run `npm run build` first.')
  process.exit(1)
}

if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true })

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

copyDir(dist, target)
console.log('Deployed dist to', target)
