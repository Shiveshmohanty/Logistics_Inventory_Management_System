import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // Loads .env variables

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'logitrack',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: test DB connection immediately
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    conn.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
})();

export default pool;
