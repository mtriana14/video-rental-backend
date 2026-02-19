import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

// GET /api/customers?page=1&limit=10
export const getAllCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page  = parseInt(req.query.page  as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM customer'
    ) as any;

    const [customers] = await pool.query(
      'SELECT customer_id, first_name, last_name, email, active, create_date FROM customer ORDER BY customer_id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    res.json({
      data: customers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/customers/search?search=
export const searchCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query;

    if (!search) {
      res.status(400).json({ success: false, error: 'Se requiere un término de búsqueda' });
      return;
    }

    const isNum = !isNaN(Number(search));
    let customers;

    if (isNum) {
      [customers] = await pool.query(
        'SELECT customer_id, first_name, last_name, email, active FROM customer WHERE customer_id = ?',
        [Number(search)]
      );
    } else {
      const term = `%${search}%`;
      [customers] = await pool.query(
        `SELECT customer_id, first_name, last_name, email, active 
         FROM customer 
         WHERE first_name LIKE ? OR last_name LIKE ?
         ORDER BY last_name, first_name`,
        [term, term]
      );
    }

    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

// GET /api/customers/:id
export const getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT customer_id, first_name, last_name, email, active, create_date FROM customer WHERE customer_id = ?',
      [id]
    ) as any[];

    if (!rows[0]) {
      res.status(404).json({ success: false, error: 'Cliente no encontrado' });
      return;
    } 

    

    // Historial de rentas
    const [rentals] = await pool.query(
      `SELECT 
        r.rental_id,
        r.rental_date,
        r.return_date,
        f.film_id,
        f.title,
        f.rental_rate,
        CASE WHEN r.return_date IS NULL THEN 'active' ELSE 'returned' END AS status
       FROM rental r
       JOIN inventory i ON r.inventory_id = i.inventory_id
       JOIN film f ON i.film_id = f.film_id
       WHERE r.customer_id = ?
       ORDER BY r.rental_date DESC`,
      [id]
    );
    const parsedRentals = (rentals as any[]).map(r => ({
  ...r,
  rental_rate: Number(r.rental_rate ?? 0),
}));
    res.json({ success: true, data: { ...rows[0], rentals } });
  } catch (error) {
    next(error);
  }
};

// POST /api/customers
export const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { first_name, last_name, email } = req.body;

    if (!first_name || !last_name || !email) {
      res.status(400).json({ success: false, error: 'first_name, last_name y email son requeridos' });
      return;
    }

    // Verificar email duplicado
    const [existing] = await pool.query(
      'SELECT customer_id FROM customer WHERE email = ?', [email]
    ) as any[];

    if (existing[0]) {
      res.status(400).json({ success: false, error: 'El email ya está registrado' });
      return;
    }

    const [result] = await pool.query(
      `INSERT INTO customer (store_id, first_name, last_name, email, address_id, active, create_date)
       VALUES (1, ?, ?, ?, 1, 1, NOW())`,
      [first_name.trim(), last_name.trim(), email]
    ) as any;

    const [newCustomer] = await pool.query(
      'SELECT customer_id, first_name, last_name, email, active FROM customer WHERE customer_id = ?',
      [result.insertId]
    ) as any[];

    res.status(201).json({ success: true, message: 'Cliente creado exitosamente', data: newCustomer[0] });
  } catch (error) {
    next(error);
  }
};

// PUT /api/customers/:id
export const updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, active } = req.body;

    const [rows] = await pool.query(
      'SELECT customer_id FROM customer WHERE customer_id = ?', [id]
    ) as any[];

    if (!rows[0]) {
      res.status(404).json({ success: false, error: 'Cliente no encontrado' });
      return;
    }

    if (email) {
      const [dup] = await pool.query(
        'SELECT customer_id FROM customer WHERE email = ? AND customer_id != ?', [email, id]
      ) as any[];
      if (dup[0]) {
        res.status(400).json({ success: false, error: 'El email ya está registrado' });
        return;
      }
    }

    await pool.query(
      `UPDATE customer SET
        first_name = COALESCE(?, first_name),
        last_name  = COALESCE(?, last_name),
        email      = COALESCE(?, email),
        active     = COALESCE(?, active)
       WHERE customer_id = ?`,
      [first_name ?? null, last_name ?? null, email ?? null, active ?? null, id]
    );

    const [updated] = await pool.query(
      'SELECT customer_id, first_name, last_name, email, active FROM customer WHERE customer_id = ?', [id]
    ) as any[];

    res.json({ success: true, message: 'Cliente actualizado exitosamente', data: updated[0] });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/customers/:id
export const deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT customer_id FROM customer WHERE customer_id = ?', [id]
    ) as any[];

    if (!rows[0]) {
      res.status(404).json({ success: false, error: 'Cliente no encontrado' });
      return;
    }

    // Verificar rentas activas
    const [active] = await pool.query(
      'SELECT COUNT(*) as count FROM rental WHERE customer_id = ? AND return_date IS NULL', [id]
    ) as any[];

    if (active[0].count > 0) {
      res.status(400).json({ success: false, error: `No se puede eliminar: tiene ${active[0].count} renta(s) activa(s)` });
      return;
    }

    await pool.query('DELETE FROM customer WHERE customer_id = ?', [id]);

    res.json({ success: true, message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};