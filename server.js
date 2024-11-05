// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const mysql = require('mysql');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Database connection
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'password',
//     database: 'mywebsite'
// });

// db.connect(err => {
//     if (err) {
//         console.error('Database connection failed: ' + err.stack);
//         return;
//     }
//     console.log('Connected to database');
// });

// // Root endpoint
// app.get('/', (req, res) => {
//     res.send('Server is running!');
// });

// // Registration endpoint
// app.post('/api/auth/register', async (req, res) => {
//     const { username, password, phone, email } = req.body;

//     if (!username || !password || !phone || !email) {
//         return res.status(400).json({ success: false, message: 'All fields are required.' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const sql = 'INSERT INTO users (username, password, phone, email) VALUES (?, ?, ?, ?)';

//     db.query(sql, [username, hashedPassword, phone, email], (err, results) => {
//         if (err) {
//             return res.status(500).json({ success: false, message: 'Error registering user.' });
//         }
//         res.json({ success: true, message: 'Registration successful.' });
//     });
// });

// // Login endpoint
// app.post('/api/auth/login', (req, res) => {
//     const { username, password } = req.body;

//     const sql = 'SELECT * FROM users WHERE username = ?';
//     db.query(sql, [username], async (err, results) => {
//         if (err) {
//             return res.status(500).json({ success: false, message: 'Error logging in.' });
//         }
//         if (results.length === 0) {
//             return res.status(401).json({ success: false, message: 'Invalid credentials.' });
//         }

//         const user = results[0];
//         const match = await bcrypt.compare(password, user.password);
//         if (!match) {
//             return res.status(401).json({ success: false, message: 'Invalid credentials.' });
//         }

//         // Optionally create a JWT token here if you're using it

//         res.json({ success: true, message: 'Login successful.' });
//     });
// });

// // Assuming you have a 'products' table in your database
// app.get('/api/products/:barcode', (req, res) => {
//     const barcode = req.params.barcode;
//     const sql = 'SELECT * FROM products WHERE barcode = ?';

//     db.query(sql, [barcode], (err, results) => {
//         if (err) {
//             return res.status(500).json({ success: false, message: 'Error fetching product.' });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ success: false, message: 'Product not found.' });
//         }
//         res.json({ success: true, product: results[0] });
//     });
// });


// // Start server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'mywebsite'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database');
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
    const { username, password, phone, email } = req.body;

    if (!username || !password || !phone || !email) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (username, password, phone, email) VALUES (?, ?, ?, ?)';

    db.query(sql, [username, hashedPassword, phone, email], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error registering user.' });
        }
        res.json({ success: true, message: 'Registration successful.' });
    });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error logging in.' });
        }
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        res.json({ success: true, message: 'Login successful.' });
    });
});

// Product retrieval endpoint
app.get('/api/products/:barcode', (req, res) => {
    const barcode = req.params.barcode;
    const sql = 'SELECT * FROM products WHERE barcode = ?';

    db.query(sql, [barcode], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching product.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const product = results[0];
        const productDetails = {
            success: true,
            product: {
                id: product.id,
                barcode: product.barcode,
                name: product.name,
                price: product.price,
            }
        };

        res.json(productDetails);
    });
});

// Payment endpoint (simulated for now)
app.post('/api/payments', (req, res) => {
    res.json({ success: true, message: 'Payment successful, redirecting to confirmation.' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
