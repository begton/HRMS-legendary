// backend/routes/departments.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Department ORDER BY DepartName');
  res.json(rows);
});

router.post('/', auth, async (req, res) => {
  const { DepartName } = req.body;
  try {
    const [r] = await db.query('INSERT INTO Department (DepartName) VALUES (?)', [DepartName]);
    res.status(201).json({ message: 'Department created.', id: r.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { DepartName } = req.body;
  await db.query('UPDATE Department SET DepartName=? WHERE DepartID=?', [DepartName, req.params.id]);
  res.json({ message: 'Department updated.' });
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM Department WHERE DepartID=?', [req.params.id]);
    res.json({ message: 'Department deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Cannot delete – employees exist in this department.' });
  }
});

module.exports = router;
