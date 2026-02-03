import db from '../config/database.js';

export const seedRentals = () => {
  const database = db.getDatabase();

  const rentals = [
    // Rentas activas
    { customer_id: 1, film_id: 3, status: 'rented', rental_date: '2024-01-25 10:30:00', return_date: null },
    { customer_id: 2, film_id: 6, status: 'rented', rental_date: '2024-01-26 14:15:00', return_date: null },
    { customer_id: 3, film_id: 1, status: 'rented', rental_date: '2024-01-27 09:00:00', return_date: null },

    // Rentas devueltas
    { customer_id: 1, film_id: 1, status: 'returned', rental_date: '2024-01-10 11:00:00', return_date: '2024-01-15 16:30:00' },
    { customer_id: 1, film_id: 2, status: 'returned', rental_date: '2024-01-12 13:20:00', return_date: '2024-01-17 10:15:00' },
    { customer_id: 2, film_id: 4, status: 'returned', rental_date: '2024-01-08 15:45:00', return_date: '2024-01-13 14:00:00' },
    { customer_id: 3, film_id: 5, status: 'returned', rental_date: '2024-01-05 12:30:00', return_date: '2024-01-10 11:45:00' },
    { customer_id: 4, film_id: 7, status: 'returned', rental_date: '2024-01-14 10:00:00', return_date: '2024-01-19 15:30:00' },
    { customer_id: 5, film_id: 8, status: 'returned', rental_date: '2024-01-16 14:30:00', return_date: '2024-01-21 13:00:00' },
    { customer_id: 6, film_id: 9, status: 'returned', rental_date: '2024-01-11 09:15:00', return_date: '2024-01-16 10:30:00' }
  ];

  const insertRental = database.prepare(
    `INSERT INTO rentals (customer_id, film_id, status, rental_date, return_date)
     VALUES (?, ?, ?, ?, ?)`
  );

  const insertMany = database.transaction((rentals) => {
    for (const rental of rentals) {
      insertRental.run(
        rental.customer_id,
        rental.film_id,
        rental.status,
        rental.rental_date,
        rental.return_date
      );
    }
  });

  insertMany(rentals);
  console.log(`✅ ${rentals.length} rentas insertadas`);
};