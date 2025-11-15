import mysql from 'mysql2/promise';

// Configuration de la connexion MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Pas de mot de passe pour root
  database: 'windevexpert_platform',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de connexions pour optimiser les performances
const pool = mysql.createPool(dbConfig);

// Fonction utilitaire pour exécuter des requêtes
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête:', error);
    throw error;
  }
}

// Fonction pour obtenir une seule ligne
export async function queryOne(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params);
    const rows = results as any[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de queryOne:', error);
    throw error;
  }
}

// Fonction pour obtenir plusieurs lignes
export async function queryMany(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results as any[];
  } catch (error) {
    console.error('Erreur lors de l\'exécution de queryMany:', error);
    throw error;
  }
}

// Fonction pour tester la connexion
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion MySQL réussie');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion MySQL:', error);
    return false;
  }
}

// Export du pool pour usage avancé si nécessaire
export { pool };

export default {
  executeQuery,
  queryOne,
  queryMany,
  testConnection,
  pool
};