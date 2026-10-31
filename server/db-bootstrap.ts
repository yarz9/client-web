import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { categories, products } from '../src/data/products.js'
import { ensureSchema } from './schema.js'

// Read the ignored local .env when running outside Railway; real variables always win.
try {
  const envFile = await readFile(resolve(process.cwd(), '.env'), 'utf8')
  for (const line of envFile.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line)
    if (!match || process.env[match[1]] !== undefined) continue
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
  }
} catch {
  // No .env file present.
}

function resolveDatabaseUrl() {
  for (const candidate of [process.env.DATABASE_URL, process.env.MYSQL_URL, process.env.DATABASE_PRIVATE_URL, process.env.MYSQL_PUBLIC_URL]) {
    if (candidate && candidate.trim()) return candidate.trim()
  }
  const { MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE } = process.env
  if (!MYSQLHOST || !MYSQLUSER || !MYSQLDATABASE) return ''
  const identity = MYSQLPASSWORD ? `${encodeURIComponent(MYSQLUSER)}:${encodeURIComponent(MYSQLPASSWORD)}` : encodeURIComponent(MYSQLUSER)
  return `mysql://${identity}@${MYSQLHOST}:${MYSQLPORT ?? '3306'}/${MYSQLDATABASE}`
}

const dbUrl = resolveDatabaseUrl()
if (!dbUrl) {
  console.error('No database connection string found. Set DATABASE_URL (Railway: reference the MySQL service variable) or connect the MySQL service so MYSQLHOST/MYSQLUSER/MYSQLDATABASE are available.')
  process.exit(1)
}

try {
  await ensureSchema(dbUrl, { categories, products })
  console.log('MySQL schema ready. Missing catalogue entries were added as unverified and unavailable; existing product data and custom photos were preserved.')
} catch (error) {
  console.error(`Database bootstrap failed: ${error instanceof Error ? error.message : 'unknown error'}`)
  process.exitCode = 1
}
