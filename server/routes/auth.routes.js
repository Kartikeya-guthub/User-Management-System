'use strict';

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { login } = require('../controllers/auth.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email or username
 *     description: Authenticate a user and return JWT token. Inactive users are blocked.
 *     tags:
 *       - Auth
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful, JWT returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error (missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Invalid credentials or account inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
