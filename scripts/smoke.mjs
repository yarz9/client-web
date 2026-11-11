#!/usr/bin/env node
// Smoke test for the production server: `npm run build` first, then `npm run smoke`.
// Every check exits non-zero on failure. No database is required.
import { spawn } from 'node:child_process'
import http from 'node:http'
import net from 'node:net'
import { deflateSync } from 'node:zlib'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const entry = resolve(root, 'server', 'index.js')
const children = new Set()
const results = []

function check(name, ok, detail) {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !detail ? '' : ` -> ${detail}`}`)
}

function must(condition, message) {
  if (!condition) throw new Error(message)
}

// One failing check must never skip the rest of the suite.
async function expect(name, run) {
  console.log(`RUN   ${name}`)
  try {
    await run()
    check(name, true)
  } catch (error) {
    check(name, false, error instanceof Error ? error.message : String(error))
  }
}

function freePort() {
  return new Promise((resolvePort, reject) => {
    const probe = net.createServer()
    probe.unref()
    probe.on('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address()
      const port = typeof address === 'object' && address ? address.port : 0
      probe.close(() => resolvePort(port))
    })
  })
}

// Every request is bounded: a wedged socket must fail a check, not hang the suite.
function request(base, path, { method = 'GET', headers = {}, body, timeout = 8000 } = {}) {
  return new Promise((resolveResponse, reject) => {
    const req = http.request({ hostname: base.hostname, port: base.port, path, method, headers }, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolveResponse({ status: res.statusCode ?? 0, headers: res.headers, text: buffer.toString('utf8'), buffer })
      })
    })
    req.setTimeout(timeout, () => req.destroy(new Error(`no response within ${timeout}ms`)))
    req.on('error', (error) => reject(error))
    if (body !== undefined) req.write(body)
    req.end()
  })
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

async function startServer(env) {
  const port = await freePort()
  const child = spawn(process.execPath, [entry], {
    cwd: root,
    env: { NODE_ENV: 'production', PORT: String(port), ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  children.add(child)
  let output = ''
  child.stdout.on('data', (chunk) => { output += chunk })
  child.stderr.on('data', (chunk) => { output += chunk })

  const base = { hostname: '127.0.0.1', port, href: `http://127.0.0.1:${port}` }
  const diagnose = () => `process ${child.exitCode === null ? 'running' : `exited with ${child.exitCode}`}; last output: ${output.trim().slice(-600) || '(none)'}`
  const deadline = Date.now() + 25000
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`server exited early: ${diagnose()}`)
    try {
      const res = await request(base, '/api/healthz', { timeout: 2000 })
      if (res.status === 200) return { child, base, diagnose }
    } catch {}
    await sleep(150)
  }
  child.kill('SIGKILL')
  throw new Error(`server did not answer /api/healthz in time: ${diagnose()}`)
}

async function stopServer(server) {
  if (!server) return
  const { child } = server
  children.delete(child)
  if (child.exitCode !== null) return
  const exited = new Promise((done) => child.once('exit', done))
  child.kill('SIGTERM')
  await Promise.race([exited, sleep(3000)])
  if (child.exitCode === null) child.kill('SIGKILL')
}

// After an oversized body the server drops that socket, so retry briefly.
async function waitAlive(server, attempts = 10) {
  let last = 'no attempt'
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const res = await request(server.base, '/api/healthz', { timeout: 2000 })
      if (res.status === 200) return
      last = `status ${res.status}`
    } catch (error) {
      last = error instanceof Error ? error.message : String(error)
    }
    await sleep(500)
  }
  throw new Error(`${last} (${server.diagnose()})`)
}

function login(base, { username = 'smoke-admin', password = 'smoke-lozinka-1234', ip } = {}) {
  const body = JSON.stringify({ username, password })
  const headers = {
    origin: base.href,
    'content-type': 'application/json',
    'content-length': String(Buffer.byteLength(body)),
  }
  if (ip) headers['x-forwarded-for'] = ip
  return request(base, '/api/admin/session', { method: 'POST', headers, body })
}

// --- minimal valid PNG, generated in-process ---------------------------------
const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let value = n
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    table[n] = value >>> 0
  }
  return table
})()

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, crc])
}

function makePng(width = 3, height = 3) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  const raw = Buffer.alloc((width * 3 + 1) * height)
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 3 + 1)] = 0
    for (let x = 0; x < width; x += 1) {
      const offset = y * (width * 3 + 1) + 1 + x * 3
      raw[offset] = 0x6b
      raw[offset + 1] = 0x6f
      raw[offset + 2] = 0x4a
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

function multipart(data, contentType) {
  const boundary = `----bioherbica-smoke-${Date.now()}`
  const parts = ['image', 'file', 'photo'].map((field) => Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${field}"; filename="smoke.png"\r\nContent-Type: ${contentType}\r\n\r\n`, 'utf8'),
    data,
    Buffer.from('\r\n', 'utf8'),
  ]))
  return {
    body: Buffer.concat([...parts, Buffer.from(`--${boundary}--\r\n`, 'utf8')]),
    type: `multipart/form-data; boundary=${boundary}`,
  }
}

const SECURITY_HEADERS = [
  'strict-transport-security',
  'content-security-policy',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
]

async function main() {
  if (!existsSync(entry)) throw new Error(`missing ${entry}; run npm run build first`)

  // 1. Configured production server -------------------------------------------------
  const adminEnv = {
    DATABASE_URL: 'mysql://smoke:smoke@127.0.0.1:3306/smoke',
    ADMIN_USERNAME: 'smoke-admin',
    ADMIN_PASSWORD: 'smoke-lozinka-1234',
    ADMIN_SESSION_SECRET: 's'.repeat(40),
  }
  const server = await startServer(adminEnv)
  try {
    let healthHeaders = {}
    await expect('/api/healthz answers 200', async () => {
      const res = await request(server.base, '/api/healthz')
      healthHeaders = res.headers
      must(res.status === 200, `status ${res.status}`)
    })

    await expect('every response carries the security headers', async () => {
      const missing = SECURITY_HEADERS.filter((name) => !healthHeaders[name])
      must(missing.length === 0, `missing ${missing.join(', ') || 'all (no response)'}`)
    })

    await expect('malformed URL returns 400', async () => {
      const res = await request(server.base, '/%E0%A4%A')
      must(res.status === 400, `status ${res.status}`)
    })

    await expect('server survives a malformed URL', async () => {
      await waitAlive(server)
    })

    await expect('rotating X-Forwarded-For still hits 429 by the 11th attempt', async () => {
      const statuses = []
      for (let attempt = 1; attempt <= 12; attempt += 1) {
        try {
          const res = await login(server.base, { password: `pogresna-${attempt}`, ip: `198.51.100.${attempt}` })
          statuses.push(res.status)
        } catch {
          statuses.push(0)
        }
      }
      const limitedAt = statuses.indexOf(429)
      must(limitedAt !== -1 && limitedAt <= 10, `statuses ${statuses.join(',')}`)
    })

    await expect('a correct password is refused while the account is locked', async () => {
      const res = await login(server.base, { ip: '203.0.113.99' })
      must(res.status === 429, `status ${res.status}`)
    })

    await expect('200 KB order body returns 413', async () => {
      const bigBody = 'x'.repeat(200 * 1024)
      const res = await request(server.base, '/api/orders', {
        method: 'POST',
        headers: { origin: server.base.href, 'content-type': 'application/json', 'content-length': String(bigBody.length), connection: 'close' },
        body: bigBody,
      })
      must(res.status === 413, `status ${res.status}`)
    })

    await expect('server survives an oversized body', async () => {
      await waitAlive(server)
    })

    await expect('a genuine PNG passes upload validation', async () => {
      const upload = multipart(makePng(), 'image/png')
      const res = await request(server.base, '/api/admin/images/smoke/test.png', {
        method: 'POST',
        headers: { origin: server.base.href, 'content-type': upload.type, 'content-length': String(upload.body.length) },
        body: upload.body,
      })
      must(res.status !== 415, `status ${res.status}`)
    })

    await expect('text labelled image/png is rejected with 415', async () => {
      const upload = multipart(Buffer.from('ovo nije slika, samo tekst\n', 'utf8'), 'image/png')
      const res = await request(server.base, '/api/admin/images/smoke/fake.png', {
        method: 'POST',
        headers: { origin: server.base.href, 'content-type': upload.type, 'content-length': String(upload.body.length) },
        body: upload.body,
      })
      must(res.status === 415, `status ${res.status}`)
    })

    await expect('CSP no longer allows discord.com', async () => {
      const csp = String(healthHeaders['content-security-policy'] ?? '')
      must(csp.length > 0, 'no content-security-policy header')
      must(!csp.includes('discord.com'), csp)
    })
  } finally {
    await stopServer(server)
  }

  // 2. /api/healthz must not need a database ---------------------------------------
  const noDb = await startServer({ ...adminEnv, DATABASE_URL: '' })
  try {
    await expect('/api/healthz works without a database', async () => {
      const res = await request(noDb.base, '/api/healthz')
      must(res.status === 200, `status ${res.status}`)
    })
  } finally {
    await stopServer(noDb)
  }

  // 3. Production without ADMIN_SESSION_SECRET must refuse login -------------------
  const noSecret = await startServer({
    DATABASE_URL: 'mysql://smoke:smoke@127.0.0.1:3306/smoke',
    ADMIN_USERNAME: 'smoke-admin',
    ADMIN_PASSWORD: 'smoke-lozinka-1234',
    ADMIN_SESSION_SECRET: '',
  })
  try {
    await expect('login without ADMIN_SESSION_SECRET returns 503', async () => {
      const res = await login(noSecret.base)
      must(res.status === 503, `status ${res.status}`)
    })
  } finally {
    await stopServer(noSecret)
  }

  // 4. Production must reject weak or placeholder passwords -------------------------
  for (const password of ['promijeni-ovu-lozinku', 'kratka12']) {
    const weak = await startServer({
      DATABASE_URL: 'mysql://smoke:smoke@127.0.0.1:3306/smoke',
      ADMIN_USERNAME: 'smoke-admin',
      ADMIN_PASSWORD: password,
      ADMIN_SESSION_SECRET: 's'.repeat(40),
    })
    try {
      await expect(`login rejects weak ADMIN_PASSWORD "${password}" with 503`, async () => {
        const res = await login(weak.base, { password })
        must(res.status === 503, `status ${res.status}`)
      })
    } finally {
      await stopServer(weak)
    }
  }
}

// A wedged child must never keep the suite (and the CI job) hanging.
const watchdog = setTimeout(() => {
  console.error('smoke watchdog: the suite did not finish within 240s')
  for (const child of children) child.kill('SIGKILL')
  process.exit(1)
}, 240000)
watchdog.unref()

main()
  .catch((error) => {
    console.error('smoke test crashed:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    clearTimeout(watchdog)
    for (const child of children) child.kill('SIGKILL')
    const failed = results.filter((result) => !result.ok)
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
    if (failed.length > 0) process.exitCode = 1
  })
