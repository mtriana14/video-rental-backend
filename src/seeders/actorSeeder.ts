import db from '../config/database.js';

export const seedActors = () => {
  const database = db.getDatabase();

  const actors = [
    { first_name: 'Tim', last_name: 'Robbins', birth_date: '1958-10-16' },
    { first_name: 'Morgan', last_name: 'Freeman', birth_date: '1937-06-01' },
    { first_name: 'Marlon', last_name: 'Brando', birth_date: '1924-04-03' },
    { first_name: 'Al', last_name: 'Pacino', birth_date: '1940-04-25' },
    { first_name: 'Christian', last_name: 'Bale', birth_date: '1974-01-30' },
    { first_name: 'Heath', last_name: 'Ledger', birth_date: '1979-04-04' },
    { first_name: 'John', last_name: 'Travolta', birth_date: '1954-02-18' },
    { first_name: 'Samuel L.', last_name: 'Jackson', birth_date: '1948-12-21' },
    { first_name: 'Tom', last_name: 'Hanks', birth_date: '1956-07-09' },
    { first_name: 'Leonardo', last_name: 'DiCaprio', birth_date: '1974-11-11' },
    { first_name: 'Keanu', last_name: 'Reeves', birth_date: '1964-09-02' },
    { first_name: 'Robert', last_name: 'De Niro', birth_date: '1943-08-17' },
    { first_name: 'Matthew', last_name: 'McConaughey', birth_date: '1969-11-04' },
    { first_name: 'Jodie', last_name: 'Foster', birth_date: '1962-11-19' },
    { first_name: 'Anthony', last_name: 'Hopkins', birth_date: '1937-12-31' }
  ];

  const insertActor = database.prepare(
    `INSERT INTO actors (first_name, last_name, birth_date)
     VALUES (?, ?, ?)`
  );

  const insertMany = database.transaction((actors) => {
    for (const actor of actors) {
      insertActor.run(actor.first_name, actor.last_name, actor.birth_date);
    }
  });

  insertMany(actors);
  console.log(`✅ ${actors.length} actores insertados`);
};