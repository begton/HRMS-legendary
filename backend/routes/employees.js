// backend/routes/employees.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/auth');

// GET /api/employees  – list all (with search)
router.get('/', auth, async (req, res) => {
  const { search } = req.query;
  let sql = `
    SELECT e.*, d.DepartName, p.PosName,
           CONCAT(e.EmpFirstName,' ',e.EmpLastName) AS FullName
    FROM Employee e
    JOIN Department d ON e.DepartID = d.DepartID
    JOIN Position   p ON e.PosID    = p.PosID
  `;
  const params = [];
  if (search) {
    sql += ` WHERE e.EmpFirstName LIKE ? OR e.EmpLastName LIKE ?
              OR e.EmpEmail LIKE ? OR d.DepartName LIKE ? OR e.EmpStatus LIKE ?`;
    const like = `%${search}%`;
    params.push(like, like, like, like, like);
  }
  sql += ' ORDER BY e.EmpLastName';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/employees/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, d.DepartName, p.PosName
       FROM Employee e
       JOIN Department d ON e.DepartID = d.DepartID
       JOIN Position   p ON e.PosID    = p.PosID
       WHERE e.EmpID = ?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Employee not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/employees
router.post('/', auth, async (req, res) => {
  const { EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth,
          EmpEmail, EmpTelephone, EmpAddress, EmpHireDate,
          EmpStatus, DepartID, PosID } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO Employee
       (EmpFirstName,EmpLastName,EmpGender,EmpDateOfBirth,EmpEmail,
        EmpTelephone,EmpAddress,EmpHireDate,EmpStatus,DepartID,PosID)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth,
       EmpEmail, EmpTelephone, EmpAddress, EmpHireDate,
       EmpStatus, DepartID, PosID]
    );
    res.status(201).json({ message: 'Employee created.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Email already exists.' });
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/employees/:id
router.put('/:id', auth, async (req, res) => {
  const { EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth,
          EmpEmail, EmpTelephone, EmpAddress, EmpHireDate,
          EmpStatus, DepartID, PosID } = req.body;
  try {
    await db.query(
      `UPDATE Employee SET
       EmpFirstName=?,EmpLastName=?,EmpGender=?,EmpDateOfBirth=?,EmpEmail=?,
       EmpTelephone=?,EmpAddress=?,EmpHireDate=?,EmpStatus=?,DepartID=?,PosID=?
       WHERE EmpID=?`,
      [EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth,
       EmpEmail, EmpTelephone, EmpAddress, EmpHireDate,
       EmpStatus, DepartID, PosID, req.params.id]
    );
    res.json({ message: 'Employee updated.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM Employee WHERE EmpID = ?', [req.params.id]);
    res.json({ message: 'Employee deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/employees/report/on-leave  – status report
router.get('/report/on-leave', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.DepartName,
              CONCAT(e.EmpFirstName,' ',e.EmpLastName) AS FullName,
              e.EmpGender, e.EmpEmail, e.EmpTelephone,
              e.EmpHireDate, p.PosName
       FROM Employee e
       JOIN Department d ON e.DepartID = d.DepartID
       JOIN Position   p ON e.PosID    = p.PosID
       WHERE e.EmpStatus = 'On Leave'
       ORDER BY d.DepartName, e.EmpLastName`
    );
    res.json({ total: rows.length, employees: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
