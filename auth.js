const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.post('/api/auth/register', async (req, res) => {
    const { username, password, phone, email } = req.body;
    try {
        await User.register(username, password, phone, email);
        res.json({ success: true, message: 'Registration successful.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.login(username, password);
        if (user) {
            res.json({ success: true, message: 'Login successful.', user });
        } else {
            res.json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Login failed: ' + err.message });
    }
});

module.exports = router;
