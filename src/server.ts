import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db, { connect } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import customerRoutes from './routes/customerRoutes.js';
import filmRoutes from './routes/filmRoutes.js';
import actorRoutes from './routes/actorRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ignore favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Video Rental Store API - TypeScript',
    version: '1.0.0',
    status: 'running'
  });
});

// API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/films', filmRoutes);
app.use('/api/actors', actorRoutes);
app.use('/api/rentals', rentalRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connect();
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();