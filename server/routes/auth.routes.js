'use strict';

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { login } = require('../controllers/auth.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

// ── @route  POST /api/auth/login
// ── @desc   Login user
// ── @access Public
router.post(
  '/login',
  [
    body('identifier').trim().notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// ── @route  GET /api/auth/test-protected
// ── @desc   Example of protected route flow
// ── @access Private (Admin only)
router.get(
  '/test-protected',
  verifyToken,                  // 1. Must have valid JWT & active status
  authorizeRoles(ROLES.ADMIN),  // 2. Must specifically hold 'admin' role
  (req, res) => {
    res.json({
      success: true,
      message: 'You have accessed an admin-only protected route!',
      user: req.user
    });
  }
);

module.exports = router;
