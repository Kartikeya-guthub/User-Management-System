const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const app = require('../app');
const User = require('../models/user.model');

const ADMIN_PASSWORD = 'Admin123!';
const MANAGER_PASSWORD = 'Manager123!';
const USER_PASSWORD = 'User123!';
const INACTIVE_PASSWORD = 'Inactive123!';

const login = (identifier, password) => request(app).post('/api/auth/login').send({ identifier, password });

const createSeedUsers = async () => {
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    username: 'adminuser',
    password: ADMIN_PASSWORD,
    role: 'admin',
    status: 'active',
  });

  const manager = await User.create({
    name: 'Manager User',
    email: 'manager@test.com',
    username: 'manageruser',
    password: MANAGER_PASSWORD,
    role: 'manager',
    status: 'active',
    createdBy: admin._id,
    updatedBy: admin._id,
  });

  const user = await User.create({
    name: 'Regular User',
    email: 'user@test.com',
    username: 'regularuser',
    password: USER_PASSWORD,
    role: 'user',
    status: 'active',
    createdBy: admin._id,
    updatedBy: admin._id,
  });

  const inactiveUser = await User.create({
    name: 'Inactive User',
    email: 'inactive@test.com',
    username: 'inactiveuser',
    password: INACTIVE_PASSWORD,
    role: 'user',
    status: 'inactive',
    createdBy: admin._id,
    updatedBy: admin._id,
  });

  const adminLogin = await login(admin.email, ADMIN_PASSWORD);
  const managerLogin = await login(manager.email, MANAGER_PASSWORD);
  const userLogin = await login(user.email, USER_PASSWORD);

  return {
    admin,
    manager,
    user,
    inactiveUser,
    adminToken: adminLogin.body.token,
    managerToken: managerLogin.body.token,
    userToken: userLogin.body.token,
  };
};

describe('User Management System API', () => {
  let mongo;
  let fixtures;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  beforeEach(async () => {
    await User.deleteMany({});
    fixtures = await createSeedUsers();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongo) {
      await mongo.stop();
    }
  });

  describe('Authentication', () => {
    it('logs in with valid credentials and returns a JWT without password data', async () => {
      const response = await login('admin@test.com', ADMIN_PASSWORD);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user).toBeTruthy();
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.user.email).toBe('admin@test.com');
    });

    it('rejects wrong password with 401', async () => {
      const response = await login('admin@test.com', 'wrong-password');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('rejects a non-existent user with 401', async () => {
      const response = await login('missing@test.com', 'whatever123');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('blocks inactive users from logging in', async () => {
      const response = await login('inactive@test.com', INACTIVE_PASSWORD);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Account is inactive. Access denied.');
    });

    it('stores passwords hashed in the database', async () => {
      const stored = await User.findOne({ email: 'admin@test.com' }).select('+password');

      expect(stored.password).not.toBe(ADMIN_PASSWORD);
      expect(await bcrypt.compare(ADMIN_PASSWORD, stored.password)).toBe(true);
    });

    it('does not allow logging in with the stored password hash', async () => {
      const stored = await User.findOne({ email: 'admin@test.com' }).select('+password');
      const response = await login('admin@test.com', stored.password);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('Token behavior', () => {
    it('rejects protected access without a token', async () => {
      const response = await request(app).get('/api/auth/test-protected');

      expect(response.status).toBe(401);
    });

    it('rejects protected access with an invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/test-protected')
        .set('Authorization', 'Bearer not-a-valid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token is invalid or expired');
    });

    it('rejects an expired token', async () => {
      const shortLivedToken = jwt.sign(
        { id: fixtures.admin._id, role: fixtures.admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '1s' }
      );

      await new Promise((resolve) => setTimeout(resolve, 1200));

      const response = await request(app)
        .get('/api/auth/test-protected')
        .set('Authorization', `Bearer ${shortLivedToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token is invalid or expired');
    });
  });

  describe('Admin RBAC', () => {
    it('can view the full users list', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${fixtures.adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(4);
      expect(response.body.data.every((item) => item.password === undefined)).toBe(true);
    });

    it('can create another admin user', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${fixtures.adminToken}`)
        .send({
          name: 'Second Admin',
          email: 'second-admin@test.com',
          role: 'admin',
          status: 'active',
          password: 'SecondAdmin123!',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.role).toBe('admin');
      expect(response.body.data.password).toBeUndefined();
    });

    it('can update any user including role changes', async () => {
      const response = await request(app)
        .put(`/api/users/${fixtures.user._id}`)
        .set('Authorization', `Bearer ${fixtures.adminToken}`)
        .send({ name: 'Updated User', role: 'manager' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated User');
      expect(response.body.data.role).toBe('manager');
    });

    it('can deactivate users and block their login', async () => {
      const response = await request(app)
        .delete(`/api/users/${fixtures.user._id}`)
        .set('Authorization', `Bearer ${fixtures.adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User deactivated successfully');

      const loginAttempt = await login('user@test.com', USER_PASSWORD);
      expect(loginAttempt.status).toBe(401);
      expect(loginAttempt.body.message).toBe('Account is inactive. Access denied.');
    });

    it('can reactivate a deactivated user', async () => {
      await request(app)
        .delete(`/api/users/${fixtures.user._id}`)
        .set('Authorization', `Bearer ${fixtures.adminToken}`);

      const reactivate = await request(app)
        .put(`/api/users/${fixtures.user._id}`)
        .set('Authorization', `Bearer ${fixtures.adminToken}`)
        .send({ status: 'active' });

      expect(reactivate.status).toBe(200);
      expect(reactivate.body.data.status).toBe('active');

      const loginAttempt = await login('user@test.com', USER_PASSWORD);
      expect(loginAttempt.status).toBe(200);
    });
  });

  describe('Manager RBAC', () => {
    it('can view the users list', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${fixtures.managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(4);
    });

    it('can update non-admin users only', async () => {
      const updateUser = await request(app)
        .put(`/api/users/${fixtures.user._id}`)
        .set('Authorization', `Bearer ${fixtures.managerToken}`)
        .send({ name: 'Manager Updated User' });

      expect(updateUser.status).toBe(200);
      expect(updateUser.body.data.name).toBe('Manager Updated User');

      const updateAdmin = await request(app)
        .put(`/api/users/${fixtures.admin._id}`)
        .set('Authorization', `Bearer ${fixtures.managerToken}`)
        .send({ name: 'Should Fail' });

      expect(updateAdmin.status).toBe(403);
      expect(updateAdmin.body.message).toBe('Not authorized to edit admin users');
    });

    it('cannot create users', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${fixtures.managerToken}`)
        .send({ name: 'Blocked', email: 'blocked@test.com', password: 'Blocked123!' });

      expect(response.status).toBe(403);
    });

    it('cannot delete users', async () => {
      const response = await request(app)
        .delete(`/api/users/${fixtures.user._id}`)
        .set('Authorization', `Bearer ${fixtures.managerToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('User RBAC', () => {
    it('can view own profile', async () => {
      const response = await request(app)
        .get(`/api/users/${fixtures.user._id}`)
        .set('Authorization', `Bearer ${fixtures.userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('user@test.com');
      expect(response.body.data.password).toBeUndefined();
    });

    it('cannot view other users or the users list', async () => {
      const otherUser = await request(app)
        .get(`/api/users/${fixtures.manager._id}`)
        .set('Authorization', `Bearer ${fixtures.userToken}`);

      const list = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${fixtures.userToken}`);

      expect(otherUser.status).toBe(403);
      expect(list.status).toBe(403);
    });

    it('can update own profile and change password', async () => {
      const update = await request(app)
        .put(`/api/users/${fixtures.user._id}`)
        .set('Authorization', `Bearer ${fixtures.userToken}`)
        .send({ name: 'Regular User Updated', password: 'NewUser123!' });

      expect(update.status).toBe(200);
      expect(update.body.data.name).toBe('Regular User Updated');
      expect(update.body.data.password).toBeUndefined();

      const oldLogin = await login('user@test.com', USER_PASSWORD);
      const newLogin = await login('user@test.com', 'NewUser123!');

      expect(oldLogin.status).toBe(401);
      expect(newLogin.status).toBe(200);
    });

    it('blocks role changes on self-update', async () => {
      const response = await request(app)
        .put(`/api/users/${fixtures.user._id}`)
        .set('Authorization', `Bearer ${fixtures.userToken}`)
        .send({ role: 'admin' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Not authorized to change this field');
    });
  });

  describe('User management and audit fields', () => {
    it('returns no password in create, list, and detail responses', async () => {
      const created = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${fixtures.adminToken}`)
        .send({
          name: 'Visible User',
          email: 'visible@test.com',
          password: 'Visible123!',
        });

      expect(created.body.data.password).toBeUndefined();

      const list = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${fixtures.adminToken}`);

      expect(list.body.data.every((item) => item.password === undefined)).toBe(true);

      const detail = await request(app)
        .get(`/api/users/${created.body.data._id}`)
        .set('Authorization', `Bearer ${fixtures.adminToken}`);

      expect(detail.body.data.password).toBeUndefined();
    });

    it('tracks createdBy, updatedBy, createdAt, and updatedAt', async () => {
      const created = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${fixtures.adminToken}`)
        .send({
          name: 'Audit User',
          email: 'audit@test.com',
          password: 'Audit123!',
        });

      expect(created.body.data.createdAt).toBeTruthy();
      expect(created.body.data.updatedAt).toBeTruthy();
      expect(String(created.body.data.createdBy)).toBe(String(fixtures.admin._id));
      expect(String(created.body.data.updatedBy)).toBe(String(fixtures.admin._id));

      const detail = await request(app)
        .get(`/api/users/${created.body.data._id}`)
        .set('Authorization', `Bearer ${fixtures.adminToken}`);

      expect(detail.body.data.createdBy.name).toBe('Admin User');
      expect(detail.body.data.updatedBy.email).toBe('admin@test.com');

      const updated = await request(app)
        .put(`/api/users/${created.body.data._id}`)
        .set('Authorization', `Bearer ${fixtures.adminToken}`)
        .send({ name: 'Audit User Updated' });

      expect(String(updated.body.data.updatedBy)).toBe(String(fixtures.admin._id));
    });

    it('validates create user requests', async () => {
      const missingFields = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${fixtures.adminToken}`)
        .send({});

      const duplicateEmail = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${fixtures.adminToken}`)
        .send({
          name: 'Duplicate User',
          email: 'user@test.com',
          password: 'Duplicate123!',
        });

      expect(missingFields.status).toBe(400);
      expect(Array.isArray(missingFields.body.errors)).toBe(true);
      expect(duplicateEmail.status).toBe(400);
      expect(duplicateEmail.body.message).toBe('Email already in use');
    });

    it('returns 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"identifier":');

      expect(response.status).toBe(400);
    });
  });
});