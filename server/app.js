'use strict';

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const app = express();

// ── Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Health Check ───────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'API is running' });
});

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',  require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));

// ── Global Error Handler ───────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error Handler]:', err);

  const statusCode = err.statusCode || 500;
  // Send clean error format without exposing deep stack trace internally unless in dev
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ── App Export ─────────────────────────────────────────
module.exports = app;
