const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./utils/errorHandler');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize express
const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

// Apply rate limiting to all routes
app.use(limiter);

// Swagger documentation options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Posting & Bidding API',
      version: '1.0.0',
      description: 'API for job posting and bidding platform',
      contact: {
        name: 'API Support',
        email: 'support@peerhire.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  // Add all route files containing Swagger comments 
  apis: [
    './routes/*.js',
  ]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PeerHire Job Posting & Bidding API',
    apiDocs: '/api-docs'
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;