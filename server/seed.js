'use strict';

const mongoose  = require('mongoose');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');
const User      = require('./models/user.model');
const path      = require('path');

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    // 1. Connect to DB
    await connectDB();

    // 2. Wipe existing users (Caution: Drops entire user collection)
    await User.deleteMany({});
    console.log('User collection wiped.');

    // 3. Create Admin configuration per requirements
    const adminUser = new User({
      name: 'Admin',
      username: 'admin',
      email: 'admin@system.com',
      password: 'Admin@123',
      role: 'admin',
      status: 'active',
      createdBy: null, // As required to avoid bootstrap reference loops
      updatedBy: null,
    });

    // 4. Save and trigger pre-save hook for bcrypt
    await adminUser.save();

    console.log('✅ Admin user successfully seeded.');
    console.log('Email: admin@system.com | Password: Admin@123');

    // 5. Exit success
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedAdmin();
