import dotenv from 'dotenv';
dotenv.config();

console.log("Connecting to DB with: ", {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
  });
  
import mysql from 'mysql2';
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
}).promise();

pool.getConnection()
  .then(() => console.log('✅ Connected to MySQL successfully!'))
  .catch(err => console.error('❌ Failed to connect to MySQL:', err));

export default pool;





