'use strict';

const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User   = require('../models/user.model');
const { ROLES } = require('../config/roles');

// ── Helper: generate random password ─────────────────────────────
const generatePassword = () => Math.random().toString(36).slice(-8) + 'A1!';

// ── Helper: generate / normalize username ────────────────────────
const normalizeUsername = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9._-]/g, '');

const buildUniqueUsername = async (baseValue, excludeId = null) => {
  const cleanBase = normalizeUsername(baseValue) || 'user';
  let candidate = cleanBase;
  let suffix = 1;

  while (await User.findOne({
    username: candidate,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  })) {
    candidate = `${cleanBase}${suffix}`;
    suffix += 1;
  }

  return candidate;
};

// ── Helper: escape special regex characters to prevent ReDoS ─────
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── @desc   Create a new user (Admin only)
// ── @route  POST /api/users
// ── @access Admin
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, username, role, status, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

    const usernameValue = username
      ? normalizeUsername(username)
      : await buildUniqueUsername(email.split('@')[0]);

    const usernameTaken = await User.findOne({ username: usernameValue });
    if (usernameTaken) return res.status(400).json({ success: false, message: 'Username already in use' });

    const rawPassword = password || generatePassword();

    const user = await User.create({
      name,
      email,
      username: usernameValue,
      password: rawPassword,
      role: role || ROLES.USER,
      status: status || 'active',
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    // Return user without password
    const safeUser = user.toJSON();
    res.status(201).json({ success: true, data: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @desc   Get all users with pagination, filtering, search
// ── @route  GET /api/users
// ── @access Admin, Manager
const getUsers = async (req, res) => {
  try {
    // Sanitize and clamp pagination — prevent negative skip / crash
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip  = (page - 1) * limit;

    // Build filter object cleanly
    const filter = {
      _id: { $ne: req.user._id } // Exclude logged-in user from list
    };

    if (req.query.role)   filter.role   = req.query.role;
    if (req.query.status) filter.status = req.query.status;

    // Partial search on name, username, or email — escape input to prevent ReDoS
    if (req.query.search) {
      const safe  = escapeRegex(req.query.search);
      const regex = new RegExp(safe, 'i');
      filter.$or = [{ name: regex }, { username: regex }, { email: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @desc   Get single user
// ── @route  GET /api/users/:id
// ── @access Admin (any), Manager (non-admin only), User (self only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const requester = req.user;

    // User can only view self
    if (requester.role === ROLES.USER && requester._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this user' });
    }

    // Manager can view all users (including admins) but cannot modify them
    // Permission checks for modifications are handled in updateUser

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @desc   Update user
// ── @route  PUT /api/users/:id
// ── @access Admin (any field), Manager (non-admin, no role->admin), User (self name/password)
const updateUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    const requester = req.user;
    const updates = {};

    if (requester.role === ROLES.ADMIN) {
      // Admin can change any field
      const { name, email, username, role, status, password } = req.body;
      if (name)   updates.name   = name;
      if (role)   updates.role   = role;
      if (status) updates.status = status;
      if (password) updates.password = password;

      if (username) {
        const normalized = normalizeUsername(username);
        const taken = await User.findOne({ username: normalized, _id: { $ne: target._id } });
        if (taken) return res.status(400).json({ success: false, message: 'Username already in use' });
        updates.username = normalized;
      } else if (!target.username) {
        updates.username = await buildUniqueUsername(target.email.split('@')[0], target._id);
      }

      // Email update: check uniqueness to prevent collision
      if (email && email !== target.email) {
        const taken = await User.findOne({ email, _id: { $ne: target._id } });
        if (taken) return res.status(400).json({ success: false, message: 'Email already in use' });
        updates.email = email;
      }

    } else if (requester.role === ROLES.MANAGER) {
      // Manager cannot touch admins
      if (target.role === ROLES.ADMIN) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit admin users' });
      }
      // Manager cannot assign admin role
      if (req.body.role === ROLES.ADMIN) {
        return res.status(403).json({ success: false, message: 'Not authorized to assign admin role' });
      }
      const { name, email, username, role, status } = req.body;
      if (name)   updates.name   = name;
      if (role)   updates.role   = role;
      if (status) updates.status = status;

      if (username) {
        const normalized = normalizeUsername(username);
        const taken = await User.findOne({ username: normalized, _id: { $ne: target._id } });
        if (taken) return res.status(400).json({ success: false, message: 'Username already in use' });
        updates.username = normalized;
      } else if (!target.username) {
        updates.username = await buildUniqueUsername(target.email.split('@')[0], target._id);
      }

      // Email update: check uniqueness to prevent collision
      if (email && email !== target.email) {
        const taken = await User.findOne({ email, _id: { $ne: target._id } });
        if (taken) return res.status(400).json({ success: false, message: 'Email already in use' });
        updates.email = email;
      }

    } else {
      // Regular user can only edit own profile (name + password only)
      if (requester._id.toString() !== target._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this user' });
      }
      const forbiddenFields = ['email', 'username', 'role', 'status', 'createdBy', 'updatedBy'];
      const hasForbiddenField = forbiddenFields.some((field) => req.body[field] !== undefined);
      if (hasForbiddenField) {
        return res.status(403).json({ success: false, message: 'Not authorized to change this field' });
      }
      if (req.body.name)     updates.name     = req.body.name;
      if (req.body.password) updates.password = req.body.password;
    }

    updates.updatedBy = requester._id;

    // Apply updates — use findById + save to trigger pre-save hook for password hashing
    Object.assign(target, updates);
    await target.save();

    const safeUser = target.toJSON();
    res.json({ success: true, data: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @desc   Soft delete (deactivate) user
// ── @route  DELETE /api/users/:id
// ── @access Admin only
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }

    // Soft delete: set inactive, do NOT remove from DB
    user.status    = 'inactive';
    user.updatedBy = req.user._id;
    await user.save();

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };
