'use strict';

const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();

const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');

// ── POST /api/users — Admin only ───────────────────────────────────
router.post(
  '/',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('role').optional().isIn([ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  ],
  createUser
);

// ── GET /api/users — Admin + Manager ──────────────────────────────
router.get(
  '/',
  verifyToken,
  authorizeRoles(ROLES.ADMIN, ROLES.MANAGER),
  getUsers
);

// ── GET /api/users/:id — Admin, Manager, User (scoped) ────────────
router.get(
  '/:id',
  verifyToken,
  authorizeRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER),
  getUserById
);

// ── PUT /api/users/:id — Admin, Manager, User (scoped) ────────────
router.put(
  '/:id',
  verifyToken,
  authorizeRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER),
  updateUser
);

// ── DELETE /api/users/:id — Admin only (soft delete) ──────────────
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  deleteUser
);

module.exports = router;
