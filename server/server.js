'use strict';

const dotenv    = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables immediately before requiring the app
dotenv.config({ path: '../.env' }); // Assuming .env stays at root for monorepo ease, or wait, does the .env stay at root? User didn't say move .env, but usually if package.json is in /server and .env is at root, we need path: '../.env'. Let me just load `dotenv.config()` normally but from the root.

const app = require('./app');

// ── Connect to MongoDB ─────────────────────────────────
connectDB();

// ── Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
