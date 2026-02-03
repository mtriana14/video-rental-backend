import { Request, Response, NextFunction } from 'express';
import db from '../config/database.js';
import { Film, Actor } from '../types/index.js';

// Get top 5 most rented films
export const getTopFilms = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const database = db.getDatabase();
    
    const topFilms = database
      .prepare(
        `SELECT * FROM films 
         ORDER BY rental_count DESC 
         LIMIT 5`
      )
      .all() as Film[];

    res.json({
      success: true,
      data: topFilms
    });
  } catch (error) {
    next(error);
  }
};

// Get all films
export const getAllFilms = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const database = db.getDatabase();
    
    const films = database
      .prepare('SELECT * FROM films ORDER BY title ASC')
      .all() as Film[];

    res.json({
      success: true,
      data: films
    });
  } catch (error) {
    next(error);
  }
};

// Search films by title, actor name, or genre
export const searchFilms = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, type } = req.query;

    if (!search) {
      res.status(400).json({ success: false, error: 'Search term required' });
      return;
    }

    const database = db.getDatabase();
    const searchTerm = `%${search}%`;
    let films: Film[] = [];

    if (type === 'actor') {
      // Search by actor name
      films = database
        .prepare(
          `SELECT DISTINCT f.* FROM films f
           JOIN film_actor fa ON f.film_id = fa.film_id
           JOIN actors a ON fa.actor_id = a.actor_id
           WHERE a.first_name LIKE ? OR a.last_name LIKE ?
           ORDER BY f.title ASC`
        )
        .all(searchTerm, searchTerm) as Film[];
    } else if (type === 'genre') {
      // Search by genre
      films = database
        .prepare(
          `SELECT * FROM films 
           WHERE genre LIKE ?
           ORDER BY title ASC`
        )
        .all(searchTerm) as Film[];
    } else {
      // Search by title (default)
      films = database
        .prepare(
          `SELECT * FROM films 
           WHERE title LIKE ?
           ORDER BY title ASC`
        )
        .all(searchTerm) as Film[];
    }

    res.json({
      success: true,
      data: films
    });
  } catch (error) {
    next(error);
  }
};

// Get film details with actors
export const getFilmById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const database = db.getDatabase();

    // Get film
    const film = database
      .prepare('SELECT * FROM films WHERE film_id = ?')
      .get(id) as Film | undefined;

    if (!film) {
      res.status(404).json({ success: false, error: 'Film not found' });
      return;
    }

    // Get actors for this film
    const actors = database
      .prepare(
        `SELECT a.* FROM actors a
         JOIN film_actor fa ON a.actor_id = fa.actor_id
         WHERE fa.film_id = ?`
      )
      .all(id) as Actor[];

    res.json({
      success: true,
      data: {
        ...film,
        actors
      }
    });
  } catch (error) {
    next(error);
  }
};

// Rent a film to a customer
export const rentFilm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customer_id, film_id } = req.body;

    if (!customer_id || !film_id) {
      res.status(400).json({ 
        success: false, 
        error: 'customer_id and film_id are required' 
      });
      return;
    }

    const database = db.getDatabase();

    // Check if film exists and has available copies
    const film = database
      .prepare('SELECT * FROM films WHERE film_id = ?')
      .get(film_id) as Film | undefined;

    if (!film) {
      res.status(404).json({ success: false, error: 'Film not found' });
      return;
    }

    if (!film.available_copies || film.available_copies <= 0) {
      res.status(400).json({ success: false, error: 'No copies available' });
      return;
    }

    // Check if customer exists
    const customer = database
      .prepare('SELECT * FROM customers WHERE customer_id = ?')
      .get(customer_id);

    if (!customer) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }

    // Create rental
    const result = database
      .prepare(
        `INSERT INTO rentals (customer_id, film_id, status) 
         VALUES (?, ?, 'rented')`
      )
      .run(customer_id, film_id);

    // Update film: decrease available copies, increase rental count
    database
      .prepare(
        `UPDATE films 
         SET available_copies = available_copies - 1,
             rental_count = rental_count + 1
         WHERE film_id = ?`
      )
      .run(film_id);

    // Get the created rental
    const rental = database
      .prepare('SELECT * FROM rentals WHERE rental_id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Film rented successfully',
      data: rental
    });
  } catch (error) {
    next(error);
  }
};