-- Tabla de películas
 
CREATE TABLE IF NOT EXISTS films (
    film_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_year INTEGER,
    rental_rate DECIMAL(4,2) DEFAULT 2.99,
    length INTEGER,
    rating VARCHAR(10),
    genre VARCHAR(50),
    rental_count INTEGER DEFAULT 0,
    available_copies INTEGER DEFAULT 1,
    image_url TEXT,  -- NUEVA COLUMNA
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de actores
CREATE TABLE IF NOT EXISTS actors (
    actor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación películas-actores
CREATE TABLE IF NOT EXISTS film_actor (
    film_id INTEGER,
    actor_id INTEGER,
    PRIMARY KEY (film_id, actor_id),
    FOREIGN KEY (film_id) REFERENCES films(film_id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES actors(actor_id) ON DELETE CASCADE
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de rentas
CREATE TABLE IF NOT EXISTS rentals (
    rental_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    film_id INTEGER NOT NULL,
    rental_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    return_date DATETIME,
    status VARCHAR(20) DEFAULT 'rented',
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (film_id) REFERENCES films(film_id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_films_title ON films(title);
CREATE INDEX IF NOT EXISTS idx_films_genre ON films(genre);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_rentals_customer ON rentals(customer_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);