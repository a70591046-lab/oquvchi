const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite DB
const db = new sqlite3.Database('./lms.db', (err) => {
    if (err) {
        console.error('Baza bilan ulanishda xato:', err.message);
    } else {
        console.log('SQLite bazasiga ulanish muvaffaqiyatli.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT,
            lastName TEXT,
            email TEXT UNIQUE,
            password TEXT,
            avatar TEXT
        )`);
    }
});

// APIs
app.post('/api/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    db.run('INSERT INTO users (firstName, lastName, email, password, avatar) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, email, password, ''], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Bu email orqali oldin ro\'yxatdan o\'tilgan!' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID, firstName, lastName, email, avatar: '' });
        });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(400).json({ error: 'Email yoki parol noto\'g\'ri' });
        res.json(row);
    });
});

app.post('/api/update-profile', (req, res) => {
    const { email, firstName, lastName, avatar } = req.body;
    db.run('UPDATE users SET firstName = ?, lastName = ?, avatar = ? WHERE email = ?',
        [firstName, lastName, avatar, email], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.post('/api/update-password', (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    db.get('SELECT password FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row || row.password !== currentPassword) return res.status(400).json({ error: 'Joriy parol xato' });
        
        db.run('UPDATE users SET password = ? WHERE email = ?', [newPassword, email], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

app.get('/api/users', (req, res) => {
    db.all('SELECT id, firstName, lastName, email, password FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/delete-user', (req, res) => {
    const { id } = req.body;
    db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/api/admin/update-password', (req, res) => {
    const { id, newPassword } = req.body;
    db.run('UPDATE users SET password = ? WHERE id = ?', [newPassword, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
