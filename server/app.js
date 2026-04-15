'use strict';

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');

// Load env vars from root .env
dotenv.config();

const app = express();

// ── Connect to MongoDB ─────────────────────────────────
connectDB();

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

// ── Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
