import express from 'express';
import {
  getAllCustomers,
  searchCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';

const router = express.Router();

// GET /api/customers - Obtener todos los clientes (con paginación)
router.get('/', getAllCustomers);

// GET /api/customers/search?search=john - Buscar clientes
router.get('/search', searchCustomers);

// GET /api/customers/:id - Obtener un cliente por ID
router.get('/:id', getCustomerById);

// POST /api/customers - Crear un nuevo cliente
router.post('/', createCustomer);

// PUT /api/customers/:id - Actualizar un cliente
router.put('/:id', updateCustomer);

// DELETE /api/customers/:id - Eliminar un cliente
router.delete('/:id', deleteCustomer);

export default router;