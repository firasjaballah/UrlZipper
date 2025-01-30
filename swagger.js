// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0', // OpenAPI version
    info: {
      title: 'URL Shortener API',
      version: '1.0.0',
      description: 'API for shortening URLs with options for custom aliases and expiration.',
    },
  },
  apis: ['./controllers/*.js'], // Path to the API route files to generate docs from
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec, swaggerUi };
