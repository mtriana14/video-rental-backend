import db from '../config/database.js';
import { seedFilms } from './filmSeeder.js';
import { seedActors } from './actorSeeder.js';
import { seedFilmActors } from './filmActorSeeder.js';
import { seedCustomers } from './customerSeeder.js';
import { seedRentals } from './rentalSeeder.js';

export const runSeeders = async () => {
  try {
    console.log('🌱 Iniciando seeders...\n');

    db.connect();

    // Limpiar tablas en orden (por las foreign keys)
    const database = db.getDatabase();
    database.exec('DELETE FROM rentals');
    database.exec('DELETE FROM film_actor');
    database.exec('DELETE FROM customers');
    database.exec('DELETE FROM actors');
    database.exec('DELETE FROM films');
    console.log('🗑️  Tablas limpiadas\n');

    // Ejecutar seeders en orden
    seedFilms();
    seedActors();
    seedFilmActors();
    seedCustomers();
    seedRentals();

    console.log('\n✨ Seeders ejecutados correctamente');
    db.close();
  } catch (error) {
    console.error('❌ Error ejecutando seeders:', error);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeders();
}