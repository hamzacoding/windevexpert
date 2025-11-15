const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({host:'localhost',user:'root',password:'',database:'windevexpert_platform'});
  const [rows] = await conn.execute('SELECT id, tinymceApiKey, siteName, createdAt, updatedAt FROM AppSettings');
  console.log(rows);
  await conn.end();
})();