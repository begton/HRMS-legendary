// backend/routes/positions.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Position ORDER BY PosName');
  res.json(rows);
});

router.post('/', auth, async (req, res) => {
  const { PosName, RequiredQualification } = req.body;
  try {
    const [r] = await db.query(
      'INSERT INTO Position (PosName, RequiredQualification) VALUES (?,?)',
      [PosName, RequiredQualification]
    );
    res.status(201).json({ message: 'Position created.', id: r.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { PosName, RequiredQualification } = req.body;
  await db.query(
    'UPDATE Position SET PosName=?, RequiredQualification=? WHERE PosID=?',
    [PosName, RequiredQualification, req.params.id]
  );
  res.json({ message: 'Position updated.' });
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM Position WHERE PosID=?', [req.params.id]);
    res.json({ message: 'Position deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Cannot delete – employees assigned to this position.' });
  }
});

module.exports = router;
