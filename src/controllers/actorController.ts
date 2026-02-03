import { Request, Response, NextFunction } from 'express';
import db from '../config/database.js';
import { Actor, Film } from '../types/index.js';

// Get top 5 actors that are part of films in the store
export const getTopActors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const database = db.getDatabase();
    
    const topActors = database
      .prepare(
        `SELECT a.*, SUM(f.rental_count) as total_rentals
         FROM actors a
         JOIN film_actor fa ON a.actor_id = fa.actor_id
         JOIN films f ON fa.film_id = f.film_id
         GROUP BY a.actor_id
         ORDER BY total_rentals DESC
         LIMIT 5`
      )
      .all() as (Actor & { total_rentals: number })[];

    res.json({
      success: true,
      data: topActors
    });
  } catch (error) {
    next(error);
  }
};

// Get all actors
export const getAllActors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const database = db.getDatabase();
    
    const actors = database
      .prepare('SELECT * FROM actors ORDER BY last_name, first_name ASC')
      .all() as Actor[];

    res.json({
      success: true,
      data: actors
    });
  } catch (error) {
    next(error);
  }
};

// Get actor details with their top 5 rented films
export const getActorById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const database = db.getDatabase();

    // Get actor
    const actor = database
      .prepare('SELECT * FROM actors WHERE actor_id = ?')
      .get(id) as Actor | undefined;

    if (!actor) {
      res.status(404).json({ success: false, error: 'Actor not found' });
      return;
    }

    // Get top 5 rented films for this actor
    const topFilms = database
      .prepare(
        `SELECT f.* FROM films f
         JOIN film_actor fa ON f.film_id = fa.film_id
         WHERE fa.actor_id = ?
         ORDER BY f.rental_count DESC
         LIMIT 5`
      )
      .all(id) as Film[];

    res.json({
      success: true,
      data: {
        ...actor,
        top_films: topFilms
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all films for an actor
export const getActorFilms = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const database = db.getDatabase();

    // Check if actor exists
    const actor = database
      .prepare('SELECT * FROM actors WHERE actor_id = ?')
      .get(id);

    if (!actor) {
      res.status(404).json({ success: false, error: 'Actor not found' });
      return;
    }

    // Get all films for this actor
    const films = database
      .prepare(
        `SELECT f.* FROM films f
         JOIN film_actor fa ON f.film_id = fa.film_id
         WHERE fa.actor_id = ?
         ORDER BY f.title ASC`
      )
      .all(id) as Film[];

    res.json({
      success: true,
      data: films
    });
  } catch (error) {
    next(error);
  }
};