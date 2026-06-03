// backend/config/db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',          // XAMPP default: empty password
  database: 'HRMS',
  waitForConnections: true,
  connectionLimit: 10,
});

const promisePool = pool.promise();

promisePool.getConnection()
  .then(connection => {
    console.log(' MySQL connected to HRMS database.');
    connection.release();
  })
  .catch(error => {
    console.error(' MySQL connection failed:', error.message || error);
  });

module.exports = promisePool;
