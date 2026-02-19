import { Router } from 'express';
import {
  getAllRentals,
  getRentalById,
  getCustomerRentals,
  returnFilm
} from '../controllers/rentalController.js';

const router = Router();

router.get('/', getAllRentals);
router.get('/customer/:customerId', getCustomerRentals);
router.get('/:id', getRentalById);
router.patch('/:id/return', returnFilm);

export default router;