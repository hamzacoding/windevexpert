/**
 * Migration script: decouple Course from Product
 * - Adds standalone commerce/content fields to Course
 * - Migrates data from Product into Course
 * - Drops productId foreign key, index, and column
 * - Ensures unique slugs and valid categoryId
 *
 * Run with: node scripts/migrate-course-decouple.js
 */
const mysql = require('mysql2/promise')

// Use same defaults as src/lib/mysql.ts
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'windevexpert_platform',
  port: Number(process.env.MYSQL_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
}

async function getColumns(conn, table) {
  const [rows] = await conn.execute(
    `SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  )
  return rows
}

async function hasColumn(conn, table, column) {
  const cols = await getColumns(conn, table)
  return cols.some((c) => c.COLUMN_NAME === column)
}

async function addColumnIfMissing(conn, table, columnDef) {
  const [column, def] = columnDef
  const exists = await hasColumn(conn, table, column)
  if (!exists) {
    await conn.execute(`ALTER TABLE \`${table}\` ADD COLUMN ${columnDef[1]}`)
    console.log(`+ Added column ${table}.${column}`)
  } else {
    console.log(`= Column exists ${table}.${column}`)
  }
}

async function hasIndex(conn, table, indexName) {
  const [rows] = await conn.execute(
    `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [table, indexName]
  )
  return rows.length > 0
}

async function createUniqueIndexIfMissing(conn, table, indexName, column) {
  const exists = await hasIndex(conn, table, indexName)
  if (!exists) {
    await conn.execute(`ALTER TABLE \`${table}\` ADD UNIQUE INDEX \`${indexName}\`(\`${column}\`)`)
    console.log(`+ Added unique index ${table}.${indexName} on ${column}`)
  } else {
    console.log(`= Unique index exists ${table}.${indexName}`)
  }
}

async function getForeignKeysForColumn(conn, table, column) {
  const [rows] = await conn.execute(
    `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
    [table, column]
  )
  return rows.map((r) => r.CONSTRAINT_NAME)
}

async function dropForeignKeyIfExists(conn, table, constraintName) {
  try {
    await conn.execute(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${constraintName}\``)
    console.log(`- Dropped foreign key ${table}.${constraintName}`)
    return true
  } catch (err) {
    console.log(`! Could not drop foreign key ${table}.${constraintName}: ${err.message}`)
    return false
  }
}

async function dropIndexIfExists(conn, table, indexName) {
  const exists = await hasIndex(conn, table, indexName)
  if (exists) {
    await conn.execute(`ALTER TABLE \`${table}\` DROP INDEX \`${indexName}\``)
    console.log(`- Dropped index ${table}.${indexName}`)
  } else {
    console.log(`= Index not found ${table}.${indexName}`)
  }
}

async function main() {
  const conn = await mysql.createConnection(dbConfig)
  try {
    console.log('🔧 Starting migration: decouple Course from Product')
    // 1) Add columns to Course (nullable initially to allow backfill)
    await addColumnIfMissing(conn, 'Course', ['slug', 'slug VARCHAR(191) NULL'])
    await addColumnIfMissing(conn, 'Course', ['shortDescription', 'shortDescription VARCHAR(191) NULL'])
    await addColumnIfMissing(conn, 'Course', ['logo', 'logo VARCHAR(191) NULL'])
    await addColumnIfMissing(conn, 'Course', ['language', 'language VARCHAR(191) NULL'])
    await addColumnIfMissing(conn, 'Course', ['price', 'price DOUBLE NULL'])
    await addColumnIfMissing(conn, 'Course', ['priceDA', 'priceDA DOUBLE NULL'])
    await addColumnIfMissing(conn, 'Course', ['isFree', 'isFree BOOLEAN NULL'])
    await addColumnIfMissing(conn, 'Course', ['categoryId', 'categoryId VARCHAR(191) NULL'])
    await addColumnIfMissing(conn, 'Course', ['features', 'features TEXT NULL'])
    await addColumnIfMissing(conn, 'Course', ['targetAudience', 'targetAudience VARCHAR(191) NULL'])
    await addColumnIfMissing(conn, 'Course', ['objectives', 'objectives TEXT NULL'])
    await addColumnIfMissing(conn, 'Course', ['prerequisites', 'prerequisites VARCHAR(191) NULL'])

    // 2) Backfill from Product
    const [rows] = await conn.execute(
      `SELECT c.id as course_id, c.title as course_title, c.slug as course_slug, c.categoryId as course_categoryId, c.productId,
              p.slug as product_slug, p.shortDescription as product_shortDescription, p.logo as product_logo,
              p.price as product_price, p.priceDA as product_priceDA, p.isFree as product_isFree,
              p.categoryId as product_categoryId, p.features as product_features
         FROM Course c
         LEFT JOIN Product p ON p.id = c.productId`
    )

    // Compute unique slugs
    const existingSlugs = new Set()
    const [slugRows] = await conn.execute(`SELECT slug FROM Course WHERE slug IS NOT NULL AND slug <> ''`)
    for (const r of slugRows) {
      if (r.slug) existingSlugs.add(r.slug)
    }

    const ensureUniqueSlug = (base) => {
      let s = slugify(base || '')
      if (!s) s = `cours-${Date.now()}`
      if (!existingSlugs.has(s)) {
        existingSlugs.add(s)
        return s
      }
      let i = 2
      while (existingSlugs.has(`${s}-${i}`)) i++
      const candidate = `${s}-${i}`
      existingSlugs.add(candidate)
      return candidate
    }

    // Fetch a default category if needed
    let defaultCategoryId = null
    const [catRow] = await conn.execute(`SELECT id FROM Category WHERE slug = 'developpement-web' LIMIT 1`)
    if (catRow && catRow.length > 0) defaultCategoryId = catRow[0].id
    if (!defaultCategoryId) {
      const [anyCat] = await conn.execute(`SELECT id FROM Category LIMIT 1`)
      if (anyCat && anyCat.length > 0) defaultCategoryId = anyCat[0].id
    }

    for (const r of rows) {
      const courseId = r.course_id
      const slug = r.course_slug || r.product_slug || ensureUniqueSlug(r.course_title)
      const shortDescription = r.product_shortDescription || null
      const logo = r.product_logo || null
      const price = r.product_price != null ? Number(r.product_price) : 0
      const priceDA = r.product_priceDA != null ? Number(r.product_priceDA) : null
      const isFree = r.product_isFree != null ? !!r.product_isFree : false
      const categoryId = r.product_categoryId || r.course_categoryId || defaultCategoryId
      const features = r.product_features || null

      await conn.execute(
        `UPDATE Course SET slug = ?, shortDescription = ?, logo = ?, price = ?, priceDA = ?, isFree = ?, categoryId = ?, features = ? WHERE id = ?`,
        [slug, shortDescription, logo, price, priceDA, isFree, categoryId, features, courseId]
      )
    }

    console.log(`✓ Backfilled ${rows.length} courses from Product`)

    // 3) Create unique index on slug and set NOT NULL constraints
    await createUniqueIndexIfMissing(conn, 'Course', 'Course_slug_key', 'slug')
    await conn.execute(`ALTER TABLE \`Course\` MODIFY COLUMN slug VARCHAR(191) NOT NULL`)
    await conn.execute(`ALTER TABLE \`Course\` MODIFY COLUMN price DOUBLE NOT NULL`)
    await conn.execute(`ALTER TABLE \`Course\` MODIFY COLUMN isFree BOOLEAN NOT NULL DEFAULT false`)
    if (defaultCategoryId) {
      // Ensure NOT NULL only if we have a category to fall back on
      await conn.execute(`UPDATE Course SET categoryId = ? WHERE categoryId IS NULL`, [defaultCategoryId])
      await conn.execute(`ALTER TABLE \`Course\` MODIFY COLUMN categoryId VARCHAR(191) NOT NULL`)
    }

    // Add foreign key for categoryId if not exists
    const fkNamesForCategory = await getForeignKeysForColumn(conn, 'Course', 'categoryId')
    if (fkNamesForCategory.length === 0) {
      try {
        await conn.execute(
          `ALTER TABLE \`Course\` ADD CONSTRAINT \`Course_categoryId_fkey\` FOREIGN KEY (\`categoryId\`) REFERENCES \`Category\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`
        )
        console.log(`+ Added foreign key Course_categoryId_fkey`)
      } catch (err) {
        console.log(`! Could not add FK Course_categoryId_fkey: ${err.message}`)
      }
    } else {
      console.log(`= FK exists on Course.categoryId: ${fkNamesForCategory.join(', ')}`)
    }

    // 4) Drop productId foreign key and index, then column
    const productFkNames = await getForeignKeysForColumn(conn, 'Course', 'productId')
    for (const fk of productFkNames) {
      await dropForeignKeyIfExists(conn, 'Course', fk)
    }
    await dropIndexIfExists(conn, 'Course', 'Course_productId_key')

    const productIdExists = await hasColumn(conn, 'Course', 'productId')
    if (productIdExists) {
      try {
        await conn.execute(`ALTER TABLE \`Course\` DROP COLUMN \`productId\``)
        console.log(`- Dropped column Course.productId`)
      } catch (err) {
        console.log(`! Could not drop Course.productId: ${err.message}`)
      }
    } else {
      console.log(`= Column Course.productId already removed`)
    }

    console.log('🎉 Migration completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exitCode = 1
  } finally {
    try { await conn.end() } catch {}
  }
}

main()