import { Router } from 'express';
import {
  getTopFilms,
  getAllFilms,
  searchFilms,
  getFilmById,
  rentFilm
} from '../controllers/filmController.js';

const router = Router();

router.get('/top5', getTopFilms);
router.get('/search', searchFilms);
router.get('/', getAllFilms);
router.get('/:id', getFilmById);
router.post('/:id/rent', rentFilm);

export default router;