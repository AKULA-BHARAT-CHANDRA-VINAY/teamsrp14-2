const mysql = require('mysql');

// Create the database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Make sure this user exists
    password: 'password', // Update with your actual password
    database: 'mywebsite' // Ensure this database exists
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.code); // Log the error code for easier debugging
        return;
    }
    console.log('Connected to the database');
});

// Export the connection
module.exports = connection;
