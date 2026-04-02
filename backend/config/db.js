const mysql = require('mysql2');
require('dotenv').config();

// Create the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',   // Update this in your .env file
    database: process.env.DB_NAME || 'QuickCommerceDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL the database:', err.message);
    } else {
        console.log('Successfully connected to MySQL database: ' + process.env.DB_NAME);
        connection.release(); // Return connection to the pool
    }
});

// Export promise-wrapped pool to use async/await in our controllers
module.exports = pool.promise();
