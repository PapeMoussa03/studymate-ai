const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

const createPool = () => {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    connectTimeout: 60000,
    ssl: { rejectUnauthorized: false }
  });
  return pool;
};

createPool();

setInterval(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('🔄 Connexion MySQL maintenue');
  } catch (err) {
    console.error('❌ Keepalive error:', err.message);
    createPool();
  }
}, 20000);

module.exports = {
  query: async (...args) => {
    try {
      return await pool.query(...args);
    } catch (err) {
      if (err.message.includes('timeout') || err.message.includes('ECONNRESET')) {
        console.log('🔁 Reconnexion en cours...');
        createPool();
        await new Promise(r => setTimeout(r, 2000));
        return await pool.query(...args);
      }
      throw err;
    }
  }
};