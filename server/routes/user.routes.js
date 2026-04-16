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

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Admin only. Create a user with automatic username and password generation if not provided.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized (no token or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   get:
 *     summary: Get all users with pagination and filtering
 *     description: Admin and Manager only. List users with search, role, and status filters.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of users per page
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search by name, username, or email
 *       - name: role
 *         in: query
 *         schema:
 *           type: string
 *           enum: ['admin', 'manager', 'user']
 *         description: Filter by role
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: ['active', 'inactive']
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of users (passwords excluded)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (not admin or manager)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('username').optional().trim().matches(/^[A-Za-z0-9._-]+$/).withMessage('Invalid username'),
    body('role').optional().isIn([ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  ],
  createUser
);

router.get(
  '/',
  verifyToken,
  authorizeRoles(ROLES.ADMIN, ROLES.MANAGER),
  getUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Admin and Manager can view any user. Users can only view themselves.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: User details with audit trail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (no permission to view this user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Update a user
 *     description: Admin can update any field. Manager can update non-admins. Users can only update their own name and password.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (no permission to update this user or field)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Deactivate a user (soft delete)
 *     description: Admin only. Sets user status to inactive so they cannot log in. User can be reactivated later.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot deactivate own account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('username').optional().trim().matches(/^[A-Za-z0-9._-]+$/).withMessage('Invalid username'),
    body('role').optional().isIn([ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
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
