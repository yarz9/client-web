import mysql from 'mysql2/promise'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { categories, products } from '../src/data/products.js'

// Read the ignored local .env when running outside Railway; real variables always win.
try {
  const envFile = await readFile(resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env'), 'utf8')
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

const db = await mysql.createConnection(dbUrl)

try {
  await db.query(`CREATE TABLE IF NOT EXISTS categories (
    keyname VARCHAR(200) PRIMARY KEY,
    label VARCHAR(200) NOT NULL,
    blurb VARCHAR(255) NULL,
    number VARCHAR(20) NULL,
    sort_order INT NOT NULL DEFAULT 0
  )`)
  await db.query(`CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(200) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    price INT NULL,
    size VARCHAR(120) NULL,
    category VARCHAR(200) NULL,
    image VARCHAR(500) NULL,
    short VARCHAR(240) NULL,
    description TEXT NULL,
    details JSON NULL,
    verification_status ENUM('awaiting_confirmation','verified') NOT NULL DEFAULT 'awaiting_confirmation',
    available TINYINT(1) NOT NULL DEFAULT 0,
    featured TINYINT(1) NOT NULL DEFAULT 0,
    reference_price INT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX products_category_idx (category),
    INDEX products_verification_idx (verification_status),
    INDEX products_available_idx (available)
  )`)
  await db.query(`CREATE TABLE IF NOT EXISTS orders (
    reference VARCHAR(32) PRIMARY KEY,
    customer_json JSON NOT NULL,
    items_json JSON NOT NULL,
    subtotal INT NOT NULL CHECK (subtotal >= 0),
    delivery_charge INT NULL CHECK (delivery_charge IS NULL OR delivery_charge >= 0),
    total INT NULL CHECK (total IS NULL OR total >= subtotal),
    payment_method VARCHAR(40) NOT NULL DEFAULT 'Plaćanje pouzećem' CHECK (payment_method = 'Plaćanje pouzećem'),
    status ENUM('Novo','Potvrđeno','U pripremi','Poslano','Isporučeno','Otkazano') NOT NULL DEFAULT 'Novo',
    created_at DATETIME NOT NULL,
    INDEX orders_created_at_idx (created_at DESC)
  )`)
  await db.query(`CREATE TABLE IF NOT EXISTS product_images (
    keyname VARCHAR(200) PRIMARY KEY,
    mimetype VARCHAR(120) NOT NULL,
    data LONGBLOB NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`)
  await db.query(`CREATE TABLE IF NOT EXISTS store_policies (
    keyname VARCHAR(40) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`)

  const [[categoryCount]] = await db.query<mysql.RowDataPacket[]>('SELECT COUNT(*) AS count FROM categories')
  if (Number(categoryCount.count) === 0) {
    for (const [sortOrder, category] of categories.entries()) {
      await db.execute('INSERT INTO categories (keyname, label, blurb, number, sort_order) VALUES (?, ?, ?, ?, ?)', [category.key, category.label, category.blurb, category.number, sortOrder])
    }
  }
  const [[policyCount]] = await db.query<mysql.RowDataPacket[]>('SELECT COUNT(*) AS count FROM store_policies')
  if (Number(policyCount.count) === 0) {
    const policies = [
      ['merchant', 'Informacije o prodavcu', 'Puni naziv poslovnog subjekta, adresa sjedišta, registracijski i kontakt podaci čekaju potvrdu vlasnice.'],
      ['orders', 'Narudžbe i plaćanje', 'Plaćanje je zamišljeno kao plaćanje pouzećem. Narudžba se smatra zahtjevom dok BioHerbica ne potvrdi dostupnost i cijenu dostave. Online naplata nije omogućena.'],
      ['delivery', 'Dostava', 'Kurirska služba, područja dostave, cijena dostave, rokovi isporuke i postupak u slučaju nepreuzete pošiljke čekaju potvrdu.'],
      ['returns', 'Povrat i reklamacije', 'Postupak odustanka od kupovine, povrata robe, reklamacija i rokovi za njihovo rješavanje moraju biti dostavljeni i odobreni prije početka prodaje.'],
      ['privacy', 'Privatnost i lični podaci', 'Zahtjev za narudžbu se čuva u Railway MySQL bazi koju održava vlasnik projekta. U bazu se upisuju ime, telefon, grad, adresa, opciona napomena i email, artikli s cijenama zabilježenim u trenutku zahtjeva, način plaćanja, status i vrijeme slanja. Pristup narudžbama ograničen je na zaštićeni administratorski panel; podaci se ne prikazuju javno. Vlasnica prije lansiranja treba odrediti rok čuvanja, voditelja obrade i kanal za zahtjeve kupaca te potvrditi konačnu obavijest o privatnosti.'],
      ['legal', 'Lokalna provjera', 'Ovaj sadržaj je razvojni podsjetnik, nije pravno mišljenje ni konačan tekst uslova. Prije objave prodaje zatražite lokalnu pravnu provjeru za propise Bosne i Hercegovine.'],
    ]
    for (const [sortOrder, [key, title, content]] of policies.entries()) {
      await db.execute('INSERT INTO store_policies (keyname, title, content, sort_order) VALUES (?, ?, ?, ?)', [key, title, content, sortOrder])
    }
  }
  for (const [sortOrder, product] of products.entries()) {
    await db.execute('INSERT INTO products (slug, name, price, size, category, image, short, description, details, verification_status, available, featured, reference_price, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE image = IF(image IS NULL OR image = ?, VALUES(image), image)', [product.slug, product.name, product.price, product.size ?? null, product.category, product.image || null, product.short, product.description, JSON.stringify(product.details), product.verificationStatus, product.available ? 1 : 0, product.featured ? 1 : 0, product.referencePrice ?? null, sortOrder, ''])
  }
  console.log('MySQL schema ready. Missing catalogue entries were added as unverified and unavailable; existing product data and custom photos were preserved.')
} catch (error) {
  console.error('Database bootstrap failed:', error instanceof Error ? error.message : 'unknown error')
  process.exitCode = 1
} finally {
  await db.end()
}
