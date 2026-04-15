'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const { ROLES_LIST, ROLES } = require('../config/roles');

const userSchema = new mongoose.Schema(
  {
    // Identity
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    // Auth
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Ensures query never returns password by default
    },
    // RBAC
    role: {
      type: String,
      enum: {
        values: ROLES_LIST,
        message: '{VALUE} is not a valid role',
      },
      default: ROLES.USER,
    },
    // Status
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    // Audit Fields (created/updated by User)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // First superadmin might not have a creator
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true, // Implements createdAt and updatedAt auto-fields
  }
);

// Pre-save hook: Hash password securely
userSchema.pre('save', async function (next) {
  // Only run hash if password was actually passed or modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method: Verify password input against hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method: Force stripping password dynamically from JSON responses
userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

module.exports = mongoose.model('User', userSchema);
