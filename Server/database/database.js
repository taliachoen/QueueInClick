import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2';

console.log("Connecting to DB with: ", {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
});


const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to DB:', err);
  } else {
    console.log('Connected to DB!');
  }
});


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
}).promise();

pool.getConnection()
    .then(() => console.log('✅ Connected to MySQL successfully!'))
    .catch(err => console.error('❌ Failed to connect to MySQL:', err));

export default pool;





