'use strict';

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();

// ── Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Swagger API Docs ───────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: false,
  },
}));

// ── Health Check ───────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ 
    status: 'API is running',
    docs: '/api-docs'
  });
});

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',  require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));

// ── Global Error Handler ───────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error Handler]:', err);

  const statusCode = err.statusCode || err.status || 500;
  // Send clean error format without exposing deep stack trace internally unless in dev
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ── App Export ─────────────────────────────────────────
module.exports = app;
