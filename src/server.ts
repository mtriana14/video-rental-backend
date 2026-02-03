import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Importar rutas
import customerRoutes from './routes/customerRoutes.js';
import filmRoutes from './routes/filmRoutes.js';
import actorRoutes from './routes/actorRoutes.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
  res.json({ 
    message: 'Video Rental Store API - TypeScript',
    version: '1.0.0',
    status: 'running'
  });
});

// API Routes
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use('/api/customers', customerRoutes);
app.use('/api/films', filmRoutes);
app.use('/api/actors', actorRoutes);

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
const startServer = async (): Promise<void> => {
  try {
    db.connect();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();