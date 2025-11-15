const mysql = require('mysql2/promise')

// Same defaults as src/lib/mysql.ts and migrate script
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'windevexpert_platform',
  port: Number(process.env.MYSQL_PORT || 3306),
}

async function main() {
  const conn = await mysql.createConnection(dbConfig)
  try {
    console.log('🔍 Vérification du schéma et des données Course')

    // Inspect columns
    const [cols] = await conn.execute(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Course'
       ORDER BY COLUMN_NAME`
    )
    console.log('\n📑 Colonnes Course:')
    cols.forEach(c => {
      console.log(` - ${c.COLUMN_NAME} (${c.DATA_TYPE}) ${c.IS_NULLABLE}`)
    })

    // Check critical columns
    const critical = ['slug','shortDescription','logo','price','priceDA','isFree','categoryId','features','objectives','prerequisites']
    const present = new Set(cols.map(c => c.COLUMN_NAME))
    const missing = critical.filter(k => !present.has(k))
    if (missing.length) {
      console.log('\n❌ Colonnes manquantes:', missing.join(', '))
    } else {
      console.log('\n✅ Colonnes critiques présentes')
    }

    // Confirm productId absence
    if (present.has('productId')) {
      console.log('\n❌ productId présent — la migration n\'est pas complète')
    } else {
      console.log('\n✅ productId absent — découplage effectif')
    }

    // Data sampling
    const [countRows] = await conn.execute(`SELECT COUNT(*) as total FROM Course`)
    const total = countRows[0]?.total || 0
    console.log(`\n📊 Nombre de formations: ${total}`)

    const [sampleRows] = await conn.execute(
      `SELECT id, title, slug, price, priceDA, isFree, categoryId, logo
       FROM Course ORDER BY createdAt DESC LIMIT 3`
    )
    if (sampleRows.length) {
      console.log('\n🧾 Échantillon:')
      sampleRows.forEach(r => {
        console.log(` - ${r.id}: ${r.title} | slug=${r.slug} | price=${r.price} | categoryId=${r.categoryId}`)
      })
    } else {
      console.log('\nℹ️ Aucun cours trouvé')
    }

    console.log('\n✅ Vérification terminée')
  } catch (err) {
    console.error('❌ Erreur de vérification:', err.message)
    process.exitCode = 1
  } finally {
    try { await conn.end() } catch {}
  }
}

main()