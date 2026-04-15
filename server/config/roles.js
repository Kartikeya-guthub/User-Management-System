'use strict';

/**
 * Single Source of Truth for System Roles
 */
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
};

const ROLES_LIST = Object.values(ROLES);

module.exports = {
  ROLES,
  ROLES_LIST
};
