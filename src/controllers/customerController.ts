import { Request, Response, NextFunction } from "express";
import db from "../config/database.js";
import { Customer, PaginatedResponse } from "../types/index.js";

// Obtener todos los clientes con paginación
export const getAllCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const database = db.getDatabase();

    // Contar total de clientes
    const countResult = database
      .prepare("SELECT COUNT(*) as total FROM customers")
      .get() as { total: number };
    const total = countResult.total;

    // Obtener clientes paginados
    const customers = database
      .prepare(
        "SELECT * FROM customers ORDER BY customer_id DESC LIMIT ? OFFSET ?",
      )
      .all(limit, offset) as Customer[];

    const response: PaginatedResponse<Customer> = {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Buscar clientes por ID, nombre o apellido
export const searchCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { search } = req.query;

    if (!search) {
      res
        .status(400)
        .json({ success: false, error: "Se requiere un término de búsqueda" });
      return;
    }

    const database = db.getDatabase();
    const searchTerm = `%${search}%`;

    const customers = database
      .prepare(
        `SELECT * FROM customers 
         WHERE customer_id LIKE ? 
         OR first_name LIKE ? 
         OR last_name LIKE ?
         ORDER BY customer_id DESC`,
      )
      .all(searchTerm, searchTerm, searchTerm) as Customer[];

    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

// Obtener un cliente por ID con historial de rentas
export const getCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const database = db.getDatabase();

    // Obtener cliente
    const customer = database
      .prepare("SELECT * FROM customers WHERE customer_id = ?")
      .get(id) as Customer | undefined;

    if (!customer) {
      res.status(404).json({ success: false, error: "Cliente no encontrado" });
      return;
    }

    // Obtener historial de rentas del cliente
    const rentals = database
      .prepare(
        `SELECT r.*, f.title, f.rental_rate 
         FROM rentals r
         JOIN films f ON r.film_id = f.film_id
         WHERE r.customer_id = ?
         ORDER BY r.rental_date DESC`,
      )
      .all(id);

    res.json({
      success: true,
      data: {
        ...customer,
        rentals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo cliente
export const createCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { first_name, last_name, email, phone, address } = req.body;

    // Validación básica
    if (!first_name || !last_name || !email) {
      res.status(400).json({
        success: false,
        error: "Los campos first_name, last_name y email son requeridos",
      });
      return;
    }

    const database = db.getDatabase();

    // Verificar si el email ya existe
    const existingCustomer = database
      .prepare("SELECT * FROM customers WHERE email = ?")
      .get(email);

    if (existingCustomer) {
      res
        .status(400)
        .json({ success: false, error: "El email ya está registrado" });
      return;
    }

    // Insertar nuevo cliente
    const result = database
      .prepare(
        `INSERT INTO customers (first_name, last_name, email, phone, address) 
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(first_name, last_name, email, phone || null, address || null);

    // Obtener el cliente creado
    const newCustomer = database
      .prepare("SELECT * FROM customers WHERE customer_id = ?")
      .get(result.lastInsertRowid) as Customer;

    res.status(201).json({
      success: true,
      message: "Cliente creado exitosamente",
      data: newCustomer,
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un cliente
export const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, address, active } = req.body;

    const database = db.getDatabase();

    // Verificar que el cliente existe
    const customer = database
      .prepare("SELECT * FROM customers WHERE customer_id = ?")
      .get(id);

    if (!customer) {
      res.status(404).json({ success: false, error: "Cliente no encontrado" });
      return;
    }

    // Si se está actualizando el email, verificar que no exista
    if (email) {
      const existingCustomer = database
        .prepare("SELECT * FROM customers WHERE email = ? AND customer_id != ?")
        .get(email, id);

      if (existingCustomer) {
        res
          .status(400)
          .json({ success: false, error: "El email ya está registrado" });
        return;
      }
    }

    // Actualizar cliente
    database
      .prepare(
        `UPDATE customers 
         SET first_name = COALESCE(?, first_name),
             last_name = COALESCE(?, last_name),
             email = COALESCE(?, email),
             phone = COALESCE(?, phone),
             address = COALESCE(?, address),
             active = COALESCE(?, active)
         WHERE customer_id = ?`,
      )
      .run(first_name, last_name, email, phone, address, active, id);

    // Obtener cliente actualizado
    const updatedCustomer = database
      .prepare("SELECT * FROM customers WHERE customer_id = ?")
      .get(id) as Customer;

    res.json({
      success: true,
      message: "Cliente actualizado exitosamente",
      data: updatedCustomer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    console.log("deleteCustomer");
    const { id } = req.params;
    console.log(id);
    const database = db.getDatabase();

    // Verificar que el cliente existe
    const customer = database
      .prepare("SELECT * FROM customers WHERE customer_id = ?")
      .get(id);

    if (!customer) {
      res.status(404).json({ success: false, error: "Cliente no encontrado" });
      return;
    }

    const activeRentals = database
      .prepare(
        "SELECT COUNT(*) as count FROM rentals WHERE customer_id = ? AND status = 'rented'",
      )
      .get(id) as { count: number };

    if (activeRentals.count > 0) {
      res.status(400).json({
        success: false,
        error: "No se puede eliminar el cliente porque tiene rentas activas",
      });
      return;
    }

    // Eliminar cliente
    database.prepare("DELETE FROM customers WHERE customer_id = ?").run(id);

    res.json({
      success: true,
      message: "Cliente eliminado exitosamente",
    });
  } catch (error) {
    next(error);
  }
};
