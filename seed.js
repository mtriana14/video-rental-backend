import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'database/video_rental.db');
const SCHEMA_PATH = join(__dirname, 'database/schema.sql');

const db = new Database(DB_PATH);

console.log(' Iniciando seeders...\n');

// Crear/actualizar schema primero
console.log(' Creando tablas...');
const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schema);
console.log(' Tablas creadas\n');

// Limpiar tablas
console.log('  Limpiando datos existentes...');
db.exec('DELETE FROM rentals');
db.exec('DELETE FROM film_actor');
db.exec('DELETE FROM customers');
db.exec('DELETE FROM actors');
db.exec('DELETE FROM films');
console.log(' Datos limpiados\n');

// Insertar películas
console.log('📝 Insertando películas...');
const insertFilm = db.prepare(
  `INSERT INTO films (title, description, release_year, rental_rate, length, rating, genre, available_copies, rental_count, image_url)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const films = [
  [
    'The Shawshank Redemption', 
    'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', 
    1994, 3.99, 142, 'R', 'Drama', 5, 245,
    'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'
  ],
  [
    'The Godfather', 
    'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', 
    1972, 4.99, 175, 'R', 'Crime', 4, 312,
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8F9hpABISwNl4sXh8a2lpL-EoQ7EUkDYicQ&s'
  ],
  [
    'The Dark Knight', 
    'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.', 
    2008, 3.99, 152, 'PG-13', 'Action', 6, 428,
    'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg'
  ],
  [
    'Pulp Fiction', 
    'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.', 
    1994, 3.99, 154, 'R', 'Crime', 3, 389,
    'https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'
  ],
  [
    'Forrest Gump', 
    'The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man with an IQ of 75.', 
    1994, 2.99, 142, 'PG-13', 'Drama', 5, 401,
    'https://m.media-amazon.com/images/M/MV5BNDYwNzVjMTItZmU5YS00YjQ5LTljYjgtMjY2NDVmYWMyNWFmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'
  ],
  [
    'Inception', 
    'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.', 
    2010, 3.99, 148, 'PG-13', 'Sci-Fi', 7, 356,
    'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg'
  ],
  [
    'The Matrix', 
    'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.', 
    1999, 2.99, 136, 'R', 'Sci-Fi', 4, 298,
    'https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'
  ],
  [
    'Goodfellas', 
    'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.', 
    1990, 3.99, 146, 'R', 'Crime', 3, 267,
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv8vWAYlcIjedSW900L6rttnJrZ3XmR_qBRA&s'
  ],
  [
    'Interstellar', 
    'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', 
    2014, 4.99, 169, 'PG-13', 'Sci-Fi', 5, 334,
    'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'
  ],
  [
    'The Silence of the Lambs', 
    'A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.', 
    1991, 3.99, 118, 'R', 'Thriller', 4, 289,
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTA0riD_c5HzEmIZg0ij29P-jhWjkYkEblcg&s'
  ]
];

const insertFilms = db.transaction(() => {
  for (const film of films) {
    insertFilm.run(...film);
  }
});

insertFilms();
console.log(` ${films.length} películas insertadas`);

// Insertar actores
console.log(' Insertando actores...');
const insertActor = db.prepare('INSERT INTO actors (first_name, last_name, birth_date , image_url) VALUES (?, ?, ?, ?)');

const actors = [
  ['Tim', 'Robbins', '1958-10-16', 'https://m.media-amazon.com/images/M/MV5BMTI1OTYxNzAxOF5BMl5BanBnXkFtZTYwNTE5ODI4._V1_FMjpg_UX1000_.jpg'],
  ['Morgan', 'Freeman', '1937-06-01', 'https://m.media-amazon.com/images/M/MV5BMTc0MDMyMzI2OF5BMl5BanBnXkFtZTcwMzM2OTk1MQ@@._V1_FMjpg_UX1000_.jpg'],
  ['Marlon', 'Brando', '1924-04-03', 'https://m.media-amazon.com/images/M/MV5BMTg3MDYyMDE5OF5BMl5BanBnXkFtZTcwNjgyNTEzNA@@._V1_FMjpg_UX1000_.jpg'],
  ['Al', 'Pacino', '1940-04-25', 'https://m.media-amazon.com/images/M/MV5BMTQzMzg1ODAyNl5BMl5BanBnXkFtZTYwMjAxODQ1._V1_FMjpg_UX1000_.jpg'],
  ['Christian', 'Bale', '1974-01-30', 'https://m.media-amazon.com/images/M/MV5BMTkxMzk4MjQ4MF5BMl5BanBnXkFtZTcwMzExODQxOA@@._V1_FMjpg_UX1000_.jpg'],
  ['Heath', 'Ledger', '1979-04-04', 'https://m.media-amazon.com/images/M/MV5BMTI2NTY0NzA4MF5BMl5BanBnXkFtZTYwMjE1MDE0._V1_FMjpg_UX1000_.jpg'],
  ['John', 'Travolta', '1954-02-18', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/John_Travolta_Deauville_2013_2.jpg/250px-John_Travolta_Deauville_2013_2.jpg'],
  ['Samuel L.', 'Jackson', '1948-12-21', 'https://m.media-amazon.com/images/M/MV5BMTQ1NTQwMTYxNl5BMl5BanBnXkFtZTYwMjA1MzY1._V1_FMjpg_UX1000_.jpg'],
  ['Tom', 'Hanks', '1956-07-09', 'https://m.media-amazon.com/images/M/MV5BMTQ2MjMwNDA3Nl5BMl5BanBnXkFtZTcwMTA2NDY3NQ@@._V1_FMjpg_UX1000_.jpg'],
  ['Leonardo', 'DiCaprio', '1974-11-11', 'https://m.media-amazon.com/images/M/MV5BMjI0MTg3MzI0M15BMl5BanBnXkFtZTcwMzQyODU2Mw@@._V1_FMjpg_UX1000_.jpg'],
  ['Keanu', 'Reeves', '1964-09-02', 'https://m.media-amazon.com/images/M/MV5BNjJhMDk0ZTEtZjdhNy00NGYyLTg1YTQtNmRlZTRjNjdlNzJmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'],
  ['Robert', 'De Niro', '1943-08-17', 'https://m.media-amazon.com/images/M/MV5BMjAwNDU3MzcyOV5BMl5BanBnXkFtZTcwMjc0MTIxMw@@._V1_FMjpg_UX1000_.jpg'],
  ['Matthew', 'McConaughey', '1969-11-04', 'https://m.media-amazon.com/images/M/MV5BMTg0MDc3ODUwOV5BMl5BanBnXkFtZTcwMTk2NjY4Nw@@._V1_FMjpg_UX1000_.jpg'],
  ['Jodie', 'Foster', '1962-11-19', 'https://m.media-amazon.com/images/M/MV5BNTc0Nzk3MzEzMV5BMl5BanBnXkFtZTcwMTkwODM1Mw@@._V1_FMjpg_UX1000_.jpg'],
  ['Anthony', 'Hopkins', '1937-12-31', 'https://m.media-amazon.com/images/M/MV5BMTc0NjczNDc1MV5BMl5BanBnXkFtZTYwMDU0Mjg1._V1_FMjpg_UX1000_.jpg']
];

const insertActors = db.transaction(() => {
  for (const actor of actors) {
    insertActor.run(...actor);
  }
});

insertActors();
console.log(`${actors.length} actores insertados`);

// Insertar relaciones película-actor
console.log(' Insertando relaciones película-actor...');
const insertFA = db.prepare('INSERT INTO film_actor (film_id, actor_id) VALUES (?, ?)');

const filmActors = [
  [1, 1], [1, 2], [2, 3], [2, 4], [3, 5], [3, 6],
  [4, 7], [4, 8], [5, 9], [6, 10], [7, 11],
  [8, 12], [9, 13], [10, 14], [10, 15]
];

const insertFAs = db.transaction(() => {
  for (const fa of filmActors) {
    insertFA.run(...fa);
  }
});

insertFAs();
console.log(` ${filmActors.length} relaciones insertadas`);

// Insertar clientes
console.log(' Insertando clientes...');
const insertCustomer = db.prepare('INSERT INTO customers (first_name, last_name, email, phone, address) VALUES (?, ?, ?, ?, ?)');

const customers = [
  ['John', 'Doe', 'john.doe@email.com', '555-0101', '123 Main St, New York, NY 10001'],
  ['Jane', 'Smith', 'jane.smith@email.com', '555-0102', '456 Oak Ave, Los Angeles, CA 90001'],
  ['Michael', 'Johnson', 'michael.j@email.com', '555-0103', '789 Pine Rd, Chicago, IL 60601'],
  ['Emily', 'Williams', 'emily.w@email.com', '555-0104', '321 Elm St, Houston, TX 77001'],
  ['David', 'Brown', 'david.brown@email.com', '555-0105', '654 Maple Dr, Phoenix, AZ 85001'],
  ['Sarah', 'Davis', 'sarah.davis@email.com', '555-0106', '987 Cedar Ln, Philadelphia, PA 19101'],
  ['Robert', 'Miller', 'robert.m@email.com', '555-0107', '147 Birch Ct, San Antonio, TX 78201'],
  ['Lisa', 'Wilson', 'lisa.wilson@email.com', '555-0108', '258 Walnut St, San Diego, CA 92101'],
  ['James', 'Moore', 'james.moore@email.com', '555-0109', '369 Spruce Blvd, Dallas, TX 75201'],
  ['Patricia', 'Taylor', 'patricia.t@email.com', '555-0110', '741 Ash Way, San Jose, CA 95101'],
  ['Christopher', 'Anderson', 'chris.anderson@email.com', '555-0111', '852 Fir St, Austin, TX 73301'],
  ['Jennifer', 'Thomas', 'jennifer.t@email.com', '555-0112', '963 Oak Park, Jacksonville, FL 32099'],
  ['Daniel', 'Jackson', 'daniel.jackson@email.com', '555-0113', '159 Pine Grove, Fort Worth, TX 76101'],
  ['Nancy', 'White', 'nancy.white@email.com', '555-0114', '357 Cedar Ridge, Columbus, OH 43004'],
  ['Matthew', 'Harris', 'matthew.h@email.com', '555-0115', '486 Maple Heights, Charlotte, NC 28201'],
  ['Elizabeth', 'Martin', 'elizabeth.m@email.com', '555-0116', '753 Birch Lane, San Francisco, CA 94102'],
  ['Anthony', 'Thompson', 'anthony.t@email.com', '555-0117', '951 Walnut Creek, Indianapolis, IN 46201'],
  ['Barbara', 'Garcia', 'barbara.garcia@email.com', '555-0118', '842 Elm Avenue, Seattle, WA 98101'],
  ['Mark', 'Martinez', 'mark.martinez@email.com', '555-0119', '264 Spruce Court, Denver, CO 80201'],
  ['Susan', 'Robinson', 'susan.robinson@email.com', '555-0120', '573 Pine Valley, Boston, MA 02101']
];

const insertCustomers = db.transaction(() => {
  for (const customer of customers) {
    insertCustomer.run(...customer);
  }
});

insertCustomers();
console.log(` ${customers.length} clientes insertados`);

// Insertar rentas
console.log(' Insertando rentas...');
const insertRental = db.prepare('INSERT INTO rentals (customer_id, film_id, status, rental_date, return_date) VALUES (?, ?, ?, ?, ?)');

const rentals = [
  [1, 3, 'rented', '2024-01-25 10:30:00', null],
  [2, 6, 'rented', '2024-01-26 14:15:00', null],
  [3, 1, 'rented', '2024-01-27 09:00:00', null],
  [1, 1, 'returned', '2024-01-10 11:00:00', '2024-01-15 16:30:00'],
  [1, 2, 'returned', '2024-01-12 13:20:00', '2024-01-17 10:15:00'],
  [2, 4, 'returned', '2024-01-08 15:45:00', '2024-01-13 14:00:00'],
  [3, 5, 'returned', '2024-01-05 12:30:00', '2024-01-10 11:45:00'],
  [4, 7, 'returned', '2024-01-14 10:00:00', '2024-01-19 15:30:00']
];

const insertRentals = db.transaction(() => {
  for (const rental of rentals) {
    insertRental.run(...rental);
  }
});

insertRentals();
console.log(` ${rentals.length} rentas insertadas`);

// Verificar
const counts = {
  films: db.prepare('SELECT COUNT(*) as count FROM films').get().count,
  actors: db.prepare('SELECT COUNT(*) as count FROM actors').get().count,
  customers: db.prepare('SELECT COUNT(*) as count FROM customers').get().count,
  rentals: db.prepare('SELECT COUNT(*) as count FROM rentals').get().count
};

console.log(' Resumen:');
console.log(`  Películas: ${counts.films}`);
console.log(`  Actores: ${counts.actors}`);
console.log(`  Clientes: ${counts.customers}`);
console.log(`  Rentas: ${counts.rentals}`);
console.log(' Seeders completados!\n');

db.close();