#!/usr/bin/env node
/*
 * Migration: Add geo-pricing and commercial fields to Course table.
 * - Adds priceUSD, priceEUR, priceDZD, priceAFR
 * - Adds accessType, refundGuaranteeDays, coverImageUrl, videoPresentationUrl, keywords
 * - Adds status, averageRating, reviewCount
 * - Adds formationCode, subtitle, certificateAvailable, numberOfModules, numberOfLessons, subCategory
 * - Backfills priceEUR from price and priceDZD from priceDA
 */

const mysql = require('mysql2/promise')

function getDbConfigFromUrl(urlStr) {
  const u = new URL(urlStr)
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, '')
  }
}

async function ensureColumn(conn, schema, table, column, definition) {
  const [rows] = await conn.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [schema, table, column]
  )
  if (rows.length === 0) {
    console.log(`Adding column ${table}.${column} ...`)
    await conn.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  } else {
    console.log(`Column ${table}.${column} already exists`)
  }
}

async function run() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('DATABASE_URL is not set')
    process.exit(1)
  }
  const cfg = getDbConfigFromUrl(dbUrl)
  const conn = await mysql.createConnection(cfg)
  try {
    const schema = cfg.database
    const table = 'Course'

    // Pricing fields
    await ensureColumn(conn, schema, table, 'priceUSD', 'DOUBLE NULL')
    await ensureColumn(conn, schema, table, 'priceEUR', 'DOUBLE NULL')
    await ensureColumn(conn, schema, table, 'priceDZD', 'DOUBLE NULL')
    await ensureColumn(conn, schema, table, 'priceAFR', 'DOUBLE NULL')

    // Commercial fields
    await ensureColumn(conn, schema, table, 'accessType', "ENUM('LIFETIME','SUBSCRIPTION_1Y') NULL DEFAULT 'LIFETIME'")
    await ensureColumn(conn, schema, table, 'refundGuaranteeDays', 'INT NULL DEFAULT 0')
    await ensureColumn(conn, schema, table, 'coverImageUrl', 'VARCHAR(191) NULL')
    await ensureColumn(conn, schema, table, 'videoPresentationUrl', 'VARCHAR(191) NULL')
    await ensureColumn(conn, schema, table, 'keywords', 'TEXT NULL')

    // Administrative fields
    await ensureColumn(conn, schema, table, 'status', "ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT'")
    await ensureColumn(conn, schema, table, 'averageRating', 'DOUBLE NULL')
    await ensureColumn(conn, schema, table, 'reviewCount', 'INT NOT NULL DEFAULT 0')

    // Additional descriptive fields
    await ensureColumn(conn, schema, table, 'formationCode', 'VARCHAR(191) NULL')
    await ensureColumn(conn, schema, table, 'subtitle', 'VARCHAR(191) NULL')
    await ensureColumn(conn, schema, table, 'certificateAvailable', 'TINYINT(1) NOT NULL DEFAULT 0')
    await ensureColumn(conn, schema, table, 'numberOfModules', 'INT NULL DEFAULT 0')
    await ensureColumn(conn, schema, table, 'numberOfLessons', 'INT NULL DEFAULT 0')
    await ensureColumn(conn, schema, table, 'subCategory', 'VARCHAR(191) NULL')

    // Backfill pricing
    console.log('Backfilling priceEUR from legacy price ...')
    await conn.execute('UPDATE Course SET priceEUR = price WHERE priceEUR IS NULL AND price IS NOT NULL')
    console.log('Backfilling priceDZD from legacy priceDA ...')
    await conn.execute('UPDATE Course SET priceDZD = priceDA WHERE priceDZD IS NULL AND priceDA IS NOT NULL')

    // Status from isActive
    console.log('Setting status from isActive ...')
    await conn.execute("UPDATE Course SET status = CASE WHEN isActive = 1 THEN 'PUBLISHED' ELSE 'DRAFT' END WHERE status IS NULL OR status = 'DRAFT'")

    // Ensure non-null defaults where applicable
    console.log('Ensuring default reviewCount ...')
    await conn.execute('UPDATE Course SET reviewCount = IFNULL(reviewCount, 0)')

    console.log('Migration completed successfully.')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exitCode = 1
  } finally {
    await conn.end()
  }
}

run()