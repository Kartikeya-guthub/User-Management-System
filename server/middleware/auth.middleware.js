'use strict';

const jwt  = require('jsonwebtoken');
const User = require('../models/user.model');

// ── @middleware  verifyToken
// ── @desc        Extracts token from header, verifies it, checks if user is active
const verifyToken = async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Handle missing token robustness
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // 2. Verify JWT signature & expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch user (Hit DB to verify real-time status and existence)
    const user = await User.findById(decoded.id);

    // Handle user completely deleted mid-session
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    // Handle mid-session deactivation (crucial status enforcement)
    if (user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Account is inactive. Access denied.' });
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Handle malformed/expired token robustness
    return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

// ── @middleware  authorizeRoles
// ── @desc        Grants access to specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the current user's role is in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role (${req.user.role}) is not authorized to access this resource` 
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
