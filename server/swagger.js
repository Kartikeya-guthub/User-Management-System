'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Management System API',
      version: '1.0.0',
      description: 'A comprehensive RBAC-enabled User Management API with authentication, authorization, and audit tracking.',
      contact: {
        name: 'Admin',
        email: 'admin@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server',
      },
      {
        url: 'https://user-management-system-do8b.onrender.com/api',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID (MongoDB ObjectId)',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            username: {
              type: 'string',
              description: 'Unique username (auto-generated if not provided)',
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'user'],
              description: 'User role for RBAC',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'Account status (inactive users cannot log in)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
            createdBy: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                name: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                },
              },
              description: 'User who created this account',
            },
            updatedBy: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                name: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                },
              },
              description: 'User who last updated this account',
            },
          },
          required: ['name', 'email', 'role', 'status'],
        },
        LoginRequest: {
          type: 'object',
          properties: {
            identifier: {
              type: 'string',
              description: 'Email or username',
            },
            password: {
              type: 'string',
              format: 'password',
            },
          },
          required: ['identifier', 'password'],
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            token: {
              type: 'string',
              description: 'JWT token for subsequent authenticated requests',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        CreateUserRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'User full name (required)',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email (required, must be unique)',
            },
            username: {
              type: 'string',
              description: 'Username (optional, auto-generated from email if blank)',
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'user'],
              default: 'user',
              description: 'User role (optional, defaults to user)',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              default: 'active',
              description: 'Account status (optional, defaults to active)',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Password (optional, auto-generated if blank)',
            },
          },
          required: ['name', 'email'],
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email (admin/manager only)',
            },
            username: {
              type: 'string',
              description: 'Username (admin/manager only)',
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'user'],
              description: 'User role (admin only)',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'Account status (admin/manager only)',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'New password (optional)',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
            },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  param: {
                    type: 'string',
                  },
                  msg: {
                    type: 'string',
                  },
                  value: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
