import express from 'express';
import { returnFilm } from '../controllers/rentalController.js';

const router = express.Router();

// PUT /api/rentals/:id/return - Return a rented film
router.put('/:id/return', returnFilm);

export default router;