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

    // 3. Create Admin
    const adminUser = new User({
      name: 'System Admin',
      username: 'admin',
      email: 'admin@system.com',
      password: 'Admin@123',
      role: 'admin',
      status: 'active',
      createdBy: null,
      updatedBy: null,
    });
    await adminUser.save();
    console.log('✅ Admin user created: admin@system.com / Admin@123');

    // 4. Create Managers
    const managers = [
      {
        name: 'Sarah Manager',
        username: 'sarah.manager',
        email: 'sarah@example.com',
        password: 'Manager@123',
        role: 'manager',
        status: 'active',
      },
      {
        name: 'John Manager',
        username: 'john.manager',
        email: 'john@example.com',
        password: 'Manager@123',
        role: 'manager',
        status: 'active',
      },
    ];

    for (const managerData of managers) {
      const manager = new User({
        ...managerData,
        createdBy: adminUser._id,
        updatedBy: adminUser._id,
      });
      await manager.save();
      console.log(`✅ Manager created: ${managerData.email} / ${managerData.password}`);
    }

    // 5. Create Regular Users
    const regularUsers = [
      {
        name: 'Alice Johnson',
        username: 'alice.johnson',
        email: 'alice@example.com',
        password: 'User@123',
        role: 'user',
        status: 'active',
      },
      {
        name: 'Bob Smith',
        username: 'bob.smith',
        email: 'bob@example.com',
        password: 'User@123',
        role: 'user',
        status: 'active',
      },
      {
        name: 'Carol Turner',
        username: 'carol.turner',
        email: 'carol@example.com',
        password: 'User@123',
        role: 'user',
        status: 'active',
      },
      {
        name: 'David Lee',
        username: 'david.lee',
        email: 'david@example.com',
        password: 'User@123',
        role: 'user',
        status: 'active',
      },
    ];

    for (const userData of regularUsers) {
      const user = new User({
        ...userData,
        createdBy: adminUser._id,
        updatedBy: adminUser._id,
      });
      await user.save();
      console.log(`✅ User created: ${userData.email} / ${userData.password}`);
    }

    // 6. Create an inactive user for testing
    const inactiveUser = new User({
      name: 'Inactive User',
      username: 'inactive.user',
      email: 'inactive@example.com',
      password: 'Inactive@123',
      role: 'user',
      status: 'inactive',
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    });
    await inactiveUser.save();
    console.log('✅ Inactive user created: inactive@example.com / Inactive@123');

    console.log('\n📊 Database seeded successfully!');
    console.log('Total users created: 8 (1 Admin + 2 Managers + 4 Users + 1 Inactive)');

    // 7. Exit success
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedAdmin();
