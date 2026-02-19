import db from '../config/database.js';

export const seedFilms = () => {
  const database = db.getDatabase();

  const films = [
    {
      title: 'The Shawshank Redemption',
      description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      release_year: 1994,
      rental_rate: 3.99,
      length: 142,
      rating: 'R',
      genre: 'Drama',
      available_copies: 5,
      rental_count: 245
    },
    {
      title: 'The Godfather',
      description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      release_year: 1972,
      rental_rate: 4.99,
      length: 175,
      rating: 'R',
      genre: 'Crime',
      available_copies: 4,
      rental_count: 312
    },
    {
      title: 'The Dark Knight',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
      release_year: 2008,
      rental_rate: 3.99,
      length: 152,
      rating: 'PG-13',
      genre: 'Action',
      available_copies: 6,
      rental_count: 428
    },
    {
      title: 'Pulp Fiction',
      description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
      release_year: 1994,
      rental_rate: 3.99,
      length: 154,
      rating: 'R',
      genre: 'Crime',
      available_copies: 3,
      rental_count: 389
    },
    {
      title: 'Forrest Gump',
      description: 'The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man with an IQ of 75.',
      release_year: 1994,
      rental_rate: 2.99,
      length: 142,
      rating: 'PG-13',
      genre: 'Drama',
      available_copies: 5,
      rental_count: 401
    },
    {
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
      release_year: 2010,
      rental_rate: 3.99,
      length: 148,
      rating: 'PG-13',
      genre: 'Sci-Fi',
      available_copies: 7,
      rental_count: 356
    },
    {
      title: 'The Matrix',
      description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
      release_year: 1999,
      rental_rate: 2.99,
      length: 136,
      rating: 'R',
      genre: 'Sci-Fi',
      available_copies: 4,
      rental_count: 298
    },
    {
      title: 'Goodfellas',
      description: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.',
      release_year: 1990,
      rental_rate: 3.99,
      length: 146,
      rating: 'R',
      genre: 'Crime',
      available_copies: 3,
      rental_count: 267
    },
    {
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      release_year: 2014,
      rental_rate: 4.99,
      length: 169,
      rating: 'PG-13',
      genre: 'Sci-Fi',
      available_copies: 5,
      rental_count: 334
    },
    {
      title: 'The Silence of the Lambs',
      description: 'A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.',
      release_year: 1991,
      rental_rate: 3.99,
      length: 118,
      rating: 'R',
      genre: 'Thriller',
      available_copies: 4,
      rental_count: 289
    }
  ];

  const insertFilm = database.prepare(
    `INSERT INTO films (title, description, release_year, rental_rate, length, rating, genre, available_copies, rental_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertMany = database.transaction((films) => {
    for (const film of films) {
      insertFilm.run(
        film.title,
        film.description,
        film.release_year,
        film.rental_rate,
        film.length,
        film.rating,
        film.genre,
        film.available_copies,
        film.rental_count
      );
    }
  });

  insertMany(films);
  console.log(`✅ ${films.length} películas insertadas`);
};