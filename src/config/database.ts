import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'sakila',
  waitForConnections: true,
  connectionLimit: 10,
});

// Verificar conexión al arrancar
async function connect() {
  try {
    const conn = await pool.getConnection();
     
    conn.release();
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error);
    process.exit(1);
  }
}

export { pool, connect };
export default { connect };