// Fix invalid dates in AppSettings (createdAt/updatedAt), normalize id, and optionally set TinyMCE API key
const mysql = require('mysql2/promise');

async function run() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'windevexpert_platform',
    port: Number(process.env.DB_PORT || 3306),
  };

  const conn = await mysql.createConnection(config);
  console.log('✅ Connected to MySQL');

  const [rows] = await conn.execute('SELECT id, createdAt, updatedAt FROM AppSettings');
  console.log(`⚙️ AppSettings rows: ${rows.length}`);
  for (const r of rows) {
    console.log(` - id=${r.id} createdAt=${r.createdAt} updatedAt=${r.updatedAt}`);
  }

  // Fix invalid createdAt values
  const [res1] = await conn.execute(
    "UPDATE AppSettings SET createdAt = NOW(3) WHERE createdAt = '0000-00-00 00:00:00' OR createdAt IS NULL"
  );
  console.log(`🛠️ Fixed createdAt rows: affected=${res1.affectedRows}`);

  // Fix invalid updatedAt values
  const [res2] = await conn.execute(
    "UPDATE AppSettings SET updatedAt = NOW(3) WHERE updatedAt = '0000-00-00 00:00:00' OR updatedAt IS NULL OR updatedAt = ''"
  );
  console.log(`🛠️ Fixed updatedAt rows: affected=${res2.affectedRows}`);

  // Normalize empty id to a sensible value
  const [resId] = await conn.execute(
    "UPDATE AppSettings SET id = 'default-settings' WHERE id = ''"
  );
  console.log(`🔧 Normalized empty id rows: affected=${resId.affectedRows}`);

  // Optionally set a TinyMCE API key if missing
  const TINYMCE_KEY = process.env.TINYMCE_API_KEY || '6nttvh0omoqwmrzmitjepuyb3kpnwb1y9l50xlukhm0993ln';
  const [res3] = await conn.execute(
    'UPDATE AppSettings SET tinymceApiKey = ? WHERE tinymceApiKey IS NULL OR tinymceApiKey = ""',
    [TINYMCE_KEY]
  );
  console.log(`🔑 Updated tinymceApiKey rows: affected=${res3.affectedRows}`);

  await conn.end();
  console.log('🎉 Done.');
}

run().catch((e) => {
  console.error('❌ Error fixing AppSettings:', e);
  process.exit(1);
});