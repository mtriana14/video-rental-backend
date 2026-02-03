import express from 'express';
import {
  getAllFilms,
  getTopFilms,
  searchFilms,
  getFilmById,
  rentFilm
} from '../controllers/filmController.js';

const router = express.Router();

// GET /api/films/top - Get top 5 most rented films
router.get('/top', getTopFilms);

// GET /api/films/search?search=...&type=... - Search films
router.get('/search', searchFilms);

// GET /api/films/:id - Get film by ID with actors
router.get('/:id', getFilmById);

// GET /api/films - Get all films
router.get('/', getAllFilms);

// POST /api/films/rent - Rent a film
router.post('/rent', rentFilm);

export default router;