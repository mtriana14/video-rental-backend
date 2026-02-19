import express from 'express';
import {
  getAllActors,
  getTopActors,
  getActorById,
  getActorFilms
} from '../controllers/actorController.js';

const router = express.Router();

// GET /api/actors/top - Get top 5 actors
router.get('/top', getTopActors);

// GET /api/actors/:id/films - Get all films for an actor
router.get('/:id/films', getActorFilms);

// GET /api/actors/:id - Get actor by ID with top 5 films
router.get('/:id', getActorById);

// GET /api/actors - Get all actors
router.get('/', getAllActors);

export default router;