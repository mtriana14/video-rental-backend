import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

// PATCH /api/rentals/:id/return
export const returnFilm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM rental WHERE rental_id = ?', [id]
    ) as any[];

    if (!rows[0]) {
      res.status(404).json({ success: false, error: 'Rental not found' });
      return;
    }

    if (rows[0].return_date !== null) {
      res.status(400).json({ success: false, error: 'Film already returned' });
      return;
    }

    await pool.query('UPDATE rental SET return_date = NOW() WHERE rental_id = ?', [id]);

    const [updated] = await pool.query(
      'SELECT * FROM rental WHERE rental_id = ?', [id]
    ) as any[];

    res.json({ success: true, message: 'Film returned successfully', data: updated[0] });
  } catch (error) {
    next(error);
  }
};

// GET /api/rentals — todas las rentas
export const getAllRentals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page   = parseInt(req.query.page  as string) || 1;
    const limit  = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string; // 'active' | 'returned'

    let whereClause = '';
    if (status === 'active')   whereClause = 'WHERE r.return_date IS NULL';
    if (status === 'returned') whereClause = 'WHERE r.return_date IS NOT NULL';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM rental r ${whereClause}`
    ) as any;

    const [rentals] = await pool.query(`
      SELECT 
        r.rental_id,
        r.rental_date,
        r.return_date,
        r.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        f.film_id,
        f.title AS film_title,
        f.rental_rate,
        CASE WHEN r.return_date IS NULL THEN 'active' ELSE 'returned' END AS status
      FROM rental r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      JOIN customer c ON r.customer_id = c.customer_id
      ${whereClause}
      ORDER BY r.rental_date DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      success: true,
      data: rentals,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/rentals/:id — detalle de una renta
export const getRentalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        r.rental_id,
        r.rental_date,
        r.return_date,
        r.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.email AS customer_email,
        f.film_id,
        f.title AS film_title,
        f.rental_rate,
        f.rental_duration,
        p.amount,
        p.payment_date,
        CASE WHEN r.return_date IS NULL THEN 'active' ELSE 'returned' END AS status
      FROM rental r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      JOIN customer c ON r.customer_id = c.customer_id
      LEFT JOIN payment p ON r.rental_id = p.rental_id
      WHERE r.rental_id = ?
    `, [id]) as any[];

    if (!rows[0]) {
      res.status(404).json({ success: false, error: 'Rental not found' });
      return;
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// GET /api/rentals/customer/:customerId — rentas de un cliente
export const getCustomerRentals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerId } = req.params;
    const status = req.query.status as string;

    let whereClause = 'WHERE r.customer_id = ?';
    if (status === 'active')   whereClause += ' AND r.return_date IS NULL';
    if (status === 'returned') whereClause += ' AND r.return_date IS NOT NULL';

    const [rentals] = await pool.query(`
      SELECT 
        r.rental_id,
        r.rental_date,
        r.return_date,
        f.film_id,
        f.title AS film_title,
        f.rental_rate,
        p.amount,
        CASE WHEN r.return_date IS NULL THEN 'active' ELSE 'returned' END AS status
      FROM rental r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      LEFT JOIN payment p ON r.rental_id = p.rental_id
      ${whereClause}
      ORDER BY r.rental_date DESC
    `, [customerId]);

    res.json({ success: true, data: rentals });
  } catch (error) {
    next(error);
  }
};