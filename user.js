const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    static async register(username, password, phone, email) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, password, phone, email) VALUES (?, ?, ?, ?)';
        return new Promise((resolve, reject) => {
            db.query(sql, [username, hashedPassword, phone, email], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    static async login(username, password) {
        const sql = 'SELECT * FROM users WHERE username = ?';
        return new Promise((resolve, reject) => {
            db.query(sql, [username], async (err, results) => {
                if (err) return reject(err);
                if (results.length > 0) {
                    const user = results[0];
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (isMatch) {
                        resolve(user);
                    } else {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        });
    }
}

module.exports = User;
