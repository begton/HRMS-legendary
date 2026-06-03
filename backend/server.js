// backend/server.js
const express = require('express');
const session = require('express-session');
const cors    = require('cors');
const app     = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: 'hrms_dab_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,        // set true in production with HTTPS
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000,  // 8 hours
  },
}));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/employees',   require('./routes/employees'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/positions',   require('./routes/positions'));

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`HRMS API running on http://localhost:${PORT}`));
