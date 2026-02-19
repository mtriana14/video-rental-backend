import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';
import { getActorPhoto } from '../services/tmdbService.js';

const defaultImage = "https://t4.ftcdn.net/jpg/07/92/82/33/360_F_792823313_HKek1ZiUoCW06zaITnIkKymOJGw7tIue.jpg";
// GET /api/actors/top5
export const getTopActors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.actor_id,
        a.first_name,
        a.last_name,
        COUNT(DISTINCT fa.film_id) AS film_count,
        COUNT(DISTINCT r.rental_id) AS total_rentals
      FROM actor a
      JOIN film_actor fa ON a.actor_id = fa.actor_id
      JOIN inventory i ON fa.film_id = i.film_id
      JOIN rental r ON i.inventory_id = r.inventory_id
      GROUP BY a.actor_id
      ORDER BY total_rentals DESC
      LIMIT 5
    `);

    const actorsWithImages = await Promise.all(
      (rows as any[]).map(async (actor) => {
        let imageUrl: string | null = null;

        try {
          imageUrl = await getActorPhoto(actor.first_name, actor.last_name);
        } catch (err) {
          console.error("TMDB error:", err);
        }

        return {
          ...actor,
          image_url:
            imageUrl ??
            defaultImage,
        };
      })
    );

    res.json({ success: true, data: actorsWithImages });

  } catch (error) {
    next(error);
  }
};


// GET /api/actors
export const getAllActors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [rows] = await pool.query(`
      SELECT actor_id, first_name, last_name
      FROM actor
      ORDER BY last_name, first_name ASC
    `);

    const actorsWithImages = await Promise.all(
      (rows as any[]).map(async (actor) => {
        let imageUrl: string | null = null;

        try {
          imageUrl = await getActorPhoto(actor.first_name, actor.last_name);
        } catch (err) {
          console.error("TMDB error:", err);
        }

        return {
          ...actor,
          image_url:
            imageUrl ??
            defaultImage,
        };
      })
    );

    res.json({ success: true, data: actorsWithImages });

  } catch (error) {
    next(error);
  }
};


// GET /api/actors/:id
export const getActorById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
 
    const [actors] = await pool.query(
      `
      SELECT 
        a.actor_id,
        a.first_name,
        a.last_name,
        COUNT(DISTINCT fa.film_id) AS film_count,
        COUNT(DISTINCT r.rental_id) AS total_rentals
      FROM actor a
      LEFT JOIN film_actor fa ON a.actor_id = fa.actor_id
      LEFT JOIN inventory i ON fa.film_id = i.film_id
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id
      WHERE a.actor_id = ?
      GROUP BY a.actor_id
    `,
      [id]
    ) as any[];

    if (!actors[0]) {
      res.status(404).json({ success: false, error: "Actor not found" });
      return;
    }

    const actor = actors[0];

   
    const [films] = await pool.query(
      `
      SELECT 
        f.film_id,
        f.title,
        f.release_year,
        COUNT(r.rental_id) AS rental_count
      FROM film_actor fa
      JOIN film f ON fa.film_id = f.film_id
      LEFT JOIN inventory i ON f.film_id = i.film_id
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id
      WHERE fa.actor_id = ?
      GROUP BY f.film_id
      ORDER BY rental_count DESC
      LIMIT 5
    `,
      [id]
    ) as any[];

     

    const filmsWithImages = await Promise.all(
      films.map(async (film: any) => {
        let imageUrl: string | null = null;

        try {
          imageUrl = await getFilmPoster(
            film.title,
            film.release_year
          );
        } catch (err) {
          console.error("TMDB film error:", err);
        }

        return {
          ...film,
          image_url:
            imageUrl ??
            defaultImage,
        };
      })
    );
 
    let actorImage: string | null = null;

    try {
      actorImage = await getActorPhoto(
        actor.first_name,
        actor.last_name
      );
    } catch (err) {
      console.error("TMDB actor error:", err);
    }

    

    res.json({
      success: true,
      data: {
        ...actor,
        image_url:
          actorImage ??
          defaultImage,
        top_films: filmsWithImages,
      },
    });

  } catch (error) {
    next(error);
  }
};



// GET /api/actors/:id/films
export const getActorFilms = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const [films] = await pool.query(`
      SELECT 
        f.film_id,
        f.title,
        f.description,
        f.release_year,
        f.rating,
        f.rental_rate,
        f.length,
        c.name AS category
      FROM film f
      JOIN film_actor fa ON f.film_id = fa.film_id
      LEFT JOIN film_category fc ON f.film_id = fc.film_id
      LEFT JOIN category c ON fc.category_id = c.category_id
      WHERE fa.actor_id = ?
      ORDER BY f.title ASC
    `, [id]);

    const filmsWithImages = await Promise.all(
      (films as any[]).map(async (film) => {
        let imageUrl: string | null = null;

        try {
          imageUrl = await getFilmPoster(film.title, film.release_year);
        } catch (err) {
          console.error("TMDB error:", err);
        }

        return {
          ...film,
          image_url:
            imageUrl ??
            "https://via.placeholder.com/300x300/1f2937/ffffff?text=No+Image",
        };
      })
    );

    res.json({ success: true, data: filmsWithImages });

  } catch (error) {
    next(error);
  }
};
