// Quick checker to validate the Formations table structure in MySQL
const mysql = require('mysql2/promise')

async function main() {
  let conn
  let dbName
  const url = process.env.DATABASE_URL
  if (url) {
    // Parse DATABASE_URL: mysql://user:pass@host:port/db
    const match = url.match(/^mysql:\/\/([^:]+):([^@]+)@([^:\/]+)(?::(\d+))?\/(.+)$/)
    if (!match) {
      console.error('DATABASE_URL invalide. Attendu: mysql://user:pass@host:port/db')
      process.exit(1)
    }
    const [_, user, password, host, port, database] = match
    dbName = database
    conn = await mysql.createConnection({ host, user, password, database, port: port ? Number(port) : 3306 })
  } else {
    // Fallback aux variables individuelles avec valeurs par défaut (mêmes que src/lib/mysql.ts)
    const host = process.env.MYSQL_HOST || 'localhost'
    const user = process.env.MYSQL_USER || 'root'
    const password = process.env.MYSQL_PASSWORD || ''
    dbName = process.env.MYSQL_DATABASE || 'windevexpert_platform'
    const port = Number(process.env.MYSQL_PORT || 3306)
    conn = await mysql.createConnection({ host, user, password, database: dbName, port })
  }

  const [rows] = await conn.execute(
    `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Formations'
     ORDER BY ORDINAL_POSITION`,
    [dbName]
  )

  const required = [
    'id_formation','titre','sous_titre','description_courte','description_complete','langue','categorie','sous_categorie',
    'objectifs_apprentissage','duree_totale_heures','nombre_modules','nombre_lecons','certificat_fin_formation',
    'niveau_requis','prerequis','public_cible',
    'prix_usd','prix_eur','prix_dzd','prix_afr','type_acces','garantie_remboursement_jours',
    'image_couverture_url','video_presentation_url','mots_cles','url_slug','lien_paiement',
    'statut','date_creation','date_mise_a_jour','note_moyenne','nombre_avis'
  ]

  const existing = new Set(rows.map(r => r.COLUMN_NAME))
  const missing = required.filter(c => !existing.has(c))
  if (missing.length) {
    console.error('Colonnes manquantes dans Formations:', missing)
    process.exit(2)
  }
  console.log('Structure Formations OK. Colonnes:', rows.length)
  await conn.end()
}

main().catch(err => {
  console.error('Erreur de vérification:', err)
  process.exit(3)
})