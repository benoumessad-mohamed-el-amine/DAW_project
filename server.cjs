const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const PORT = 3000;
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // or whatever port your frontend uses
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
let db;
(async function initializeDatabase() {
    try {
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'exam_platform'
        });
        console.log('Connected to MySQL');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
})();

// Routes
app.post('/login', async (req, res) => {
    try {
        // Validate request body
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Invalid request format'
            });
        }

        const { username, password } = req.body;

        if (!username?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Database query
        const [users] = await db.query(
            `SELECT id, username, password, role, 
             name, email, group_name, section 
             FROM account WHERE username = ? LIMIT 1`,
            [username.trim()]
        );

        // User not found
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = users[0];

        // Password verification (use bcrypt.compare() in production)
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Successful login
        res.json({
            success: true,
            id: user.id,
            role: user.role,
            username: user.username,
            name: user.name,
            email: user.email,
            group_name: user.group_name,
            section: user.section
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get account by ID
app.get('/account/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM account WHERE id = ? LIMIT 1',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Create/Update account
app.post('/account', async (req, res) => {
    try {
        const { username, password, role, name, email, group_name, section } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Username, password and role are required'
            });
        }

        const [result] = await db.query(
            'INSERT INTO account (username, password, role, name, email, group_name, section) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, password, role, name, email, group_name, section]
        );

        res.json({
            success: true,
            id: result.insertId
        });
    } catch (err) {
        console.error('Account creation error:', err);
        res.status(500).json({
            success: false,
            message: err.code === 'ER_DUP_ENTRY' ? 'Username already exists' : 'Database error'
        });
    }
});

app.put('/account/:id', async (req, res) => {
    try {
        const { username, password, role, name, email, group_name, section } = req.body;

        await db.query(
            `UPDATE account SET 
                username = ?, 
                password = ?, 
                role = ?, 
                name = ?, 
                email = ?, 
                group_name = ?, 
                section = ? 
             WHERE id = ?`,
            [username, password, role, name, email, group_name, section, req.params.id]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Account update error:', err);
        res.status(500).json({
            success: false,
            message: 'Database error'
        });
    }
});

// Delete account
app.delete('/account/:id', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM account WHERE id = ?',
            [req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Account deletion error:', err);
        res.status(500).json({
            success: false,
            message: 'Database error'
        });
    }
});
app.post('/submit-score', async (req, res) => {
    try {
        const { candidateId, moduleId, grade } = req.body;

        if (!candidateId || !moduleId || grade === undefined) {
            return res.status(400).json({ success: false, message: 'Missing data' });
        }

        await db.query(
            'INSERT INTO account_module (account_id, module_id, grade) VALUES (?, ?, ?)',
            [candidateId, moduleId, grade]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Submission error:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Get candidates with search and sort functionality
app.get('/admin/candidates/search', async (req, res) => {
    try {
        const { search = '', sort = 'name-asc' } = req.query;

        // Build the base query
        let query = `
            SELECT a.id, a.name, a.email, a.group_name, m.title AS module, am.grade
            FROM account a
            LEFT JOIN account_module am ON am.account_id = a.id
            LEFT JOIN module m ON am.module_id = m.id
            WHERE a.role = 'candidate'
        `;

        // Add search filter if provided
        const params = [];
        if (search) {
            query += ` AND (a.name LIKE ? OR a.email LIKE ? OR a.group_name LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Add sorting
        const [sortField, sortDirection] = sort.split('-');
        const sortMap = {
            'name': 'a.name',
            'email': 'a.email',
            'grade': 'am.grade'
        };

        if (sortMap[sortField]) {
            query += ` ORDER BY ${sortMap[sortField]} ${sortDirection.toUpperCase()}`;
        }

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


