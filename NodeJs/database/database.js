import mysql from 'mysql2'

const pool = mysql.createPool(
    {
        host: "127.0.0.1",
        password: "123talia",
        user: 'root',
        database: 'dbqueues'
    }
).promise();


export default pool;