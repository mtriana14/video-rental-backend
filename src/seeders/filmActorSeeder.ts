import db from '../config/database.js';

export const seedFilmActors = () => {
  const database = db.getDatabase();

  // Relaciones película-actor (film_id, actor_id)
  const filmActors = [
    // The Shawshank Redemption (1)
    { film_id: 1, actor_id: 1 }, // Tim Robbins
    { film_id: 1, actor_id: 2 }, // Morgan Freeman

    // The Godfather (2)
    { film_id: 2, actor_id: 3 }, // Marlon Brando
    { film_id: 2, actor_id: 4 }, // Al Pacino

    // The Dark Knight (3)
    { film_id: 3, actor_id: 5 }, // Christian Bale
    { film_id: 3, actor_id: 6 }, // Heath Ledger

    // Pulp Fiction (4)
    { film_id: 4, actor_id: 7 }, // John Travolta
    { film_id: 4, actor_id: 8 }, // Samuel L. Jackson

    // Forrest Gump (5)
    { film_id: 5, actor_id: 9 }, // Tom Hanks

    // Inception (6)
    { film_id: 6, actor_id: 10 }, // Leonardo DiCaprio

    // The Matrix (7)
    { film_id: 7, actor_id: 11 }, // Keanu Reeves

    // Goodfellas (8)
    { film_id: 8, actor_id: 12 }, // Robert De Niro

    // Interstellar (9)
    { film_id: 9, actor_id: 13 }, // Matthew McConaughey

    // The Silence of the Lambs (10)
    { film_id: 10, actor_id: 14 }, // Jodie Foster
    { film_id: 10, actor_id: 15 }  // Anthony Hopkins
  ];

  const insertFilmActor = database.prepare(
    `INSERT INTO film_actor (film_id, actor_id) VALUES (?, ?)`
  );

  const insertMany = database.transaction((filmActors) => {
    for (const fa of filmActors) {
      insertFilmActor.run(fa.film_id, fa.actor_id);
    }
  });

  insertMany(filmActors);
  console.log(`✅ ${filmActors.length} relaciones película-actor insertadas`);
};