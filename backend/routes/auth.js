// backend/routes/auth.js
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const db      = require('../config/db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password required.' });

  try {
    const [rows] = await db.query(
      `SELECT u.UserID, u.UserName, u.Password, u.EmpID,
              CONCAT(e.EmpFirstName,' ',e.EmpLastName) AS FullName
       FROM Users u
       JOIN Employee e ON u.EmpID = e.EmpID
       WHERE u.UserName = ?`, [username]
    );

    if (!rows.length)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.Password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials.' });

    req.session.user = { id: user.UserID, username: user.UserName, empId: user.EmpID, fullName: user.FullName };
    res.json({ message: 'Login successful.', user: req.session.user });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out.' }));
});

// GET /api/auth/me  – check session
router.get('/me', (req, res) => {
  if (req.session && req.session.user)
    return res.json({ user: req.session.user });
  res.status(401).json({ message: 'Not authenticated.' });
});

// POST /api/auth/register  (create user account for existing employee)
router.post('/register', async (req, res) => {
  const { username, password, empId } = req.body;
  if (!username || !password || !empId)
    return res.status(400).json({ message: 'All fields required.' });

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO Users (UserName, Password, EmpID) VALUES (?,?,?)',
      [username, hash, empId]);
    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Username or employee already has an account.' });
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
