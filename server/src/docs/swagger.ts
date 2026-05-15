import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';
import { logger } from '../config/logger.js';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'NotifyFlow API',
    version: '1.0.0',
    description: 'Task management and notification platform',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['Health'],
        security: [],
        responses: {
          200: { description: 'Server is healthy' },
          503: { description: 'Server is degraded' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', minLength: 2 },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          409: { description: 'Email already in use' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    // add more paths for workspaces, tasks, attachments
  },
};

export function setupSwagger(app: Express): void {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  logger.info('Swagger docs available at /api/docs');
}