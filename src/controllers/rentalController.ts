import { Request, Response, NextFunction } from 'express';
import db from '../config/database.js';

// Return a rented film
export const returnFilm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const database = db.getDatabase();

    // Get rental
    const rental = database
      .prepare('SELECT * FROM rentals WHERE rental_id = ?')
      .get(id);

    if (!rental) {
      res.status(404).json({ success: false, error: 'Rental not found' });
      return;
    }

    // Check if already returned
    const rentalData = rental as any;
    if (rentalData.status === 'returned') {
      res.status(400).json({ success: false, error: 'Film already returned' });
      return;
    }

    // Update rental
    database
      .prepare(
        `UPDATE rentals 
         SET status = 'returned', return_date = CURRENT_TIMESTAMP
         WHERE rental_id = ?`
      )
      .run(id);

    // Update film: increase available copies
    database
      .prepare(
        `UPDATE films 
         SET available_copies = available_copies + 1
         WHERE film_id = ?`
      )
      .run(rentalData.film_id);

    // Get updated rental
    const updatedRental = database
      .prepare('SELECT * FROM rentals WHERE rental_id = ?')
      .get(id);

    res.json({
      success: true,
      message: 'Film returned successfully',
      data: updatedRental
    });
  } catch (error) {
    next(error);
  }
};