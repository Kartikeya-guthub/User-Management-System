'use strict';

const { validationResult } = require('express-validator');
const jwt  = require('jsonwebtoken');
const User = require('../models/user.model');

// ── @desc   Login user & get token
// ── @route  POST /api/auth/login
// ── @access Public
const login = async (req, res, next) => {
  // 1. Explicitly handle express-validator output
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { identifier, email, password } = req.body;

  try {
    const loginValue = String(identifier || email || '').trim().toLowerCase();

    // 2. Find user (Must explicitly select +password since it's hidden by default in schema)
    const user = await User.findOne({
      $or: [
        { email: loginValue },
        { username: loginValue },
      ],
    }).select('+password');

    // 3. User exists check
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. Password match check (using schema method)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 5. Important Status Enforcement: Block inactive users strictly
    if (user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Account is inactive. Access denied.' });
    }

    // 6. Generate JWT (minimal payload format exactly as requested: { id, role })
    const payload = {
      id: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    // 7. Secure Return (Exclude password manually in case toJSON is bypassed by direct property access)
    // Actually, user.toJSON() handles this automatically when sent via res.json()
    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    // Pass to global error handler
    next(error);
  }
};

module.exports = { login };
