import { Request, Response, NextFunction } from "express";
import { pool } from "../config/database.js";
import { getFilmPoster } from "../services/tmdbService.js";

function parseFilm(f: any) {
  return {
    ...f,
    rental_rate:      Number(f.rental_rate),
    replacement_cost: Number(f.replacement_cost),
    length:           Number(f.length),
    release_year:     Number(f.release_year),
    rental_count:     Number(f.rental_count ?? 0),
    total_rentals:    Number(f.total_rentals ?? 0),
    total_copies:     Number(f.total_copies ?? 0),
    rented_copies:    Number(f.rented_copies ?? 0),
    available_copies: Number(f.available_copies ?? 0),
  };
}

// GET /api/films/top5
export const getTopFilms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [films] = await pool.query(`
      SELECT f.film_id, f.title, f.description, f.release_year,
        f.rental_rate, f.length, f.rating,
        c.name AS category,
        COUNT(r.rental_id) AS rental_count
      FROM film f
      LEFT JOIN inventory i ON f.film_id = i.film_id
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id
      LEFT JOIN film_category fc ON f.film_id = fc.film_id
      LEFT JOIN category c ON fc.category_id = c.category_id
      GROUP BY f.film_id
      ORDER BY rental_count DESC
      LIMIT 5
    `);

    const filmsWithImages = (films as any[]).map((f) => ({
      ...parseFilm(f),
      image_url: getFilmPoster(f.category),
    }));

    res.json({ success: true, count: filmsWithImages.length, data: filmsWithImages });
  } catch (error) {
    next(error);
  }
};

// GET /api/films
export const getAllFilms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page   = parseInt(req.query.page  as string) || 1;
    const limit  = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM film") as any;

    const [films] = await pool.query(`
      SELECT f.film_id, f.title, f.description, f.release_year,
        f.rental_rate, f.rental_duration, f.length, f.rating, f.replacement_cost,
        c.name AS category
      FROM film f
      LEFT JOIN film_category fc ON f.film_id = fc.film_id
      LEFT JOIN category c ON fc.category_id = c.category_id
      ORDER BY f.title ASC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      success: true,
      data: (films as any[]).map((f) => ({ ...parseFilm(f), image_url: getFilmPoster(f.category) })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/films/search
export const searchFilms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, type } = req.query;

    if (!search) {
      res.status(400).json({ success: false, error: "Search term required" });
      return;
    }

    const term = `%${search}%`;
    let films;

    if (type === "actor") {
      [films] = await pool.query(`
        SELECT DISTINCT f.film_id, f.title, f.description, f.release_year,
          f.rental_rate, f.length, f.rating, c.name AS category
        FROM film f
        JOIN film_actor fa ON f.film_id = fa.film_id
        JOIN actor a ON fa.actor_id = a.actor_id
        LEFT JOIN film_category fc ON f.film_id = fc.film_id
        LEFT JOIN category c ON fc.category_id = c.category_id
        WHERE a.first_name LIKE ? OR a.last_name LIKE ?
        ORDER BY f.title ASC
      `, [term, term]);
    } else if (type === "genre") {
      [films] = await pool.query(`
        SELECT DISTINCT f.film_id, f.title, f.description, f.release_year,
          f.rental_rate, f.length, f.rating, c.name AS category
        FROM film f
        LEFT JOIN film_category fc ON f.film_id = fc.film_id
        LEFT JOIN category c ON fc.category_id = c.category_id
        WHERE c.name LIKE ?
        ORDER BY f.title ASC
      `, [term]);
    } else {
      [films] = await pool.query(`
        SELECT DISTINCT f.film_id, f.title, f.description, f.release_year,
          f.rental_rate, f.length, f.rating, c.name AS category
        FROM film f
        LEFT JOIN film_category fc ON f.film_id = fc.film_id
        LEFT JOIN category c ON fc.category_id = c.category_id
        WHERE f.title LIKE ?
        ORDER BY f.title ASC
      `, [term]);
    }

    res.json({
      success: true,
      data: (films as any[]).map((f) => ({ ...parseFilm(f), image_url: getFilmPoster(f.category) }))
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/films/:id
export const getFilmById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT f.*, c.name AS category, l.name AS language,
        COUNT(DISTINCT r.rental_id) AS rental_count,
        (SELECT COUNT(*) FROM inventory i2 WHERE i2.film_id = f.film_id) AS total_copies,
        (SELECT COUNT(*) FROM inventory i3
          JOIN rental r2 ON i3.inventory_id = r2.inventory_id
          WHERE i3.film_id = f.film_id AND r2.return_date IS NULL) AS rented_copies,
        (SELECT COUNT(*) FROM inventory i4 WHERE i4.film_id = f.film_id) -
        (SELECT COUNT(*) FROM inventory i5
          JOIN rental r3 ON i5.inventory_id = r3.inventory_id
          WHERE i5.film_id = f.film_id AND r3.return_date IS NULL) AS available_copies
      FROM film f
      LEFT JOIN film_category fc ON f.film_id = fc.film_id
      LEFT JOIN category c ON fc.category_id = c.category_id
      LEFT JOIN language l ON f.language_id = l.language_id
      LEFT JOIN inventory i ON f.film_id = i.film_id
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id
      WHERE f.film_id = ?
      GROUP BY f.film_id
    `, [id]) as any[];

    if (!rows[0]) {
      res.status(404).json({ success: false, error: "Film not found" });
      return;
    }

    const [actors] = await pool.query(`
      SELECT a.actor_id, a.first_name, a.last_name
      FROM actor a
      JOIN film_actor fa ON a.actor_id = fa.actor_id
      WHERE fa.film_id = ?
      ORDER BY a.last_name, a.first_name
    `, [id]);

    res.json({
      success: true,
      data: { ...parseFilm(rows[0]), actors, image_url: getFilmPoster(rows[0].category) }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/films/:id/rent
export const rentFilm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { customer_id, staff_id = 1, store_id = 1 } = req.body;

    if (!customer_id) {
      res.status(400).json({ success: false, error: "customer_id es requerido" });
      return;
    }

    const [customer] = await pool.query(
      "SELECT customer_id FROM customer WHERE customer_id = ?", [customer_id]
    ) as any[];
    if (!customer[0]) {
      res.status(404).json({ success: false, error: "Cliente no encontrado" });
      return;
    }

    const [available] = await pool.query(`
      SELECT i.inventory_id FROM inventory i
      WHERE i.film_id = ? AND i.store_id = ?
        AND i.inventory_id NOT IN (
          SELECT inventory_id FROM rental WHERE return_date IS NULL
        )
      LIMIT 1
    `, [id, store_id]) as any[];

    if (!available[0]) {
      res.status(409).json({ success: false, error: "No available copies" });
      return;
    }

    const [film] = await pool.query(
      "SELECT rental_rate FROM film WHERE film_id = ?", [id]
    ) as any[];

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(`
        INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id)
        VALUES (NOW(), ?, ?, ?)
      `, [available[0].inventory_id, customer_id, staff_id]) as any;

      await conn.query(`
        INSERT INTO payment (customer_id, staff_id, rental_id, amount, payment_date)
        VALUES (?, ?, ?, ?, NOW())
      `, [customer_id, staff_id, result.insertId, film[0].rental_rate]);

      await conn.commit();
      res.status(201).json({
        success: true,
        message: "Película rentada exitosamente",
        data: { rental_id: result.insertId }
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    next(error);
  }
};