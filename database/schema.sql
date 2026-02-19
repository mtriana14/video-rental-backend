-- Sakila Sample Database Schema - SQLite Version
-- Adapted from MySQL original

PRAGMA foreign_keys = ON;

-- Drop tables if exist (in order respecting FK constraints)
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS rental;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS film_actor;
DROP TABLE IF EXISTS film_category;
DROP TABLE IF EXISTS film_text;
DROP TABLE IF EXISTS film;
DROP TABLE IF EXISTS language;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS actor;
DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS store;
DROP TABLE IF EXISTS address;
DROP TABLE IF EXISTS city;
DROP TABLE IF EXISTS country;

-- -----------------------------------------------------
-- Table: country
-- -----------------------------------------------------
CREATE TABLE country (
  country_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  country      VARCHAR(50) NOT NULL,
  last_update  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table: city
-- -----------------------------------------------------
CREATE TABLE city (
  city_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  city        VARCHAR(50) NOT NULL,
  country_id  INTEGER NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (country_id) REFERENCES country (country_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table: address
-- -----------------------------------------------------
CREATE TABLE address (
  address_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  address     VARCHAR(50) NOT NULL,
  address2    VARCHAR(50) DEFAULT NULL,
  district    VARCHAR(20) NOT NULL,
  city_id     INTEGER NOT NULL,
  postal_code VARCHAR(10) DEFAULT NULL,
  phone       VARCHAR(20) NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES city (city_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table: language
-- -----------------------------------------------------
CREATE TABLE language (
  language_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name        CHAR(20) NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table: category
-- -----------------------------------------------------
CREATE TABLE category (
  category_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name        VARCHAR(25) NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table: actor
-- -----------------------------------------------------
CREATE TABLE actor (
  actor_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name  VARCHAR(45) NOT NULL,
  last_name   VARCHAR(45) NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table: store (sin FK circular con staff, se agrega después)
-- -----------------------------------------------------
CREATE TABLE store (
  store_id         INTEGER PRIMARY KEY AUTOINCREMENT,
  manager_staff_id INTEGER NOT NULL,
  address_id       INTEGER NOT NULL,
  last_update      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (address_id) REFERENCES address (address_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table: staff
-- -----------------------------------------------------
CREATE TABLE staff (
  staff_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name  VARCHAR(45) NOT NULL,
  last_name   VARCHAR(45) NOT NULL,
  address_id  INTEGER NOT NULL,
  picture     BLOB DEFAULT NULL,
  email       VARCHAR(50) DEFAULT NULL,
  store_id    INTEGER NOT NULL,
  active      INTEGER NOT NULL DEFAULT 1,  -- SQLite usa INTEGER en vez de BOOLEAN
  username    VARCHAR(16) NOT NULL,
  password    VARCHAR(40) DEFAULT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (address_id) REFERENCES address (address_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (store_id)   REFERENCES store (store_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table: customer
-- -----------------------------------------------------
CREATE TABLE customer (
  customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id    INTEGER NOT NULL,
  first_name  VARCHAR(45) NOT NULL,
  last_name   VARCHAR(45) NOT NULL,
  email       VARCHAR(50) DEFAULT NULL,
  address_id  INTEGER NOT NULL,
  active      INTEGER NOT NULL DEFAULT 1,
  create_date DATETIME NOT NULL,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (address_id) REFERENCES address (address_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (store_id)   REFERENCES store (store_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table: film
-- -----------------------------------------------------
CREATE TABLE film (
  film_id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title                VARCHAR(128) NOT NULL,
  description          TEXT DEFAULT NULL,
  release_year         INTEGER DEFAULT NULL,
  language_id          INTEGER NOT NULL,
  original_language_id INTEGER DEFAULT NULL,
  rental_duration      INTEGER NOT NULL DEFAULT 3,
  rental_rate          DECIMAL(4,2) NOT NULL DEFAULT 4.99,
  length               INTEGER DEFAULT NULL,
  replacement_cost     DECIMAL(5,2) NOT NULL DEFAULT 19.99,
  rating               VARCHAR(10) DEFAULT 'G', -- SQLite no tiene ENUM, usamos CHECK
  special_features     TEXT DEFAULT NULL,        -- SQLite no tiene SET, guardamos como texto
  last_update          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (language_id)          REFERENCES language (language_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (original_language_id) REFERENCES language (language_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CHECK (rating IN ('G','PG','PG-13','R','NC-17'))
);

-- -----------------------------------------------------
-- Table: film_actor
-- -----------------------------------------------------
CREATE TABLE film_actor (
  actor_id    INTEGER NOT NULL,
  film_id     INTEGER NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (actor_id, film_id),
  FOREIGN KEY (actor_id) REFERENCES actor (actor_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (film_id)  REFERENCES film (film_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table: film_category
-- -----------------------------------------------------
CREATE TABLE film_category (
  film_id     INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (film_id, category_id),
  FOREIGN KEY (film_id)     REFERENCES film (film_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table: film_text (para búsqueda full-text)
-- -----------------------------------------------------
CREATE TABLE film_text (
  film_id     INTEGER NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  PRIMARY KEY (film_id)
);

-- -----------------------------------------------------
-- Table: inventory
-- -----------------------------------------------------
CREATE TABLE inventory (
  inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
  film_id      INTEGER NOT NULL,
  store_id     INTEGER NOT NULL,
  last_update  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (film_id)  REFERENCES film (film_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (store_id) REFERENCES store (store_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table: rental
-- -----------------------------------------------------
CREATE TABLE rental (
  rental_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  rental_date  DATETIME NOT NULL,
  inventory_id INTEGER NOT NULL,
  customer_id  INTEGER NOT NULL,
  return_date  DATETIME DEFAULT NULL,
  staff_id     INTEGER NOT NULL,
  last_update  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (rental_date, inventory_id, customer_id),
  FOREIGN KEY (inventory_id) REFERENCES inventory (inventory_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (customer_id)  REFERENCES customer (customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (staff_id)     REFERENCES staff (staff_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table: payment
-- -----------------------------------------------------
CREATE TABLE payment (
  payment_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id  INTEGER NOT NULL,
  staff_id     INTEGER NOT NULL,
  rental_id    INTEGER DEFAULT NULL,
  amount       DECIMAL(5,2) NOT NULL,
  payment_date DATETIME NOT NULL,
  last_update  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer (customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (staff_id)    REFERENCES staff (staff_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (rental_id)   REFERENCES rental (rental_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Índices para mejorar performance
-- -----------------------------------------------------
CREATE INDEX idx_actor_last_name       ON actor (last_name);
CREATE INDEX idx_fk_city_id            ON address (city_id);
CREATE INDEX idx_fk_country_id         ON city (country_id);
CREATE INDEX idx_fk_address_id_cust    ON customer (address_id);
CREATE INDEX idx_fk_store_id_cust      ON customer (store_id);
CREATE INDEX idx_last_name_cust        ON customer (last_name);
CREATE INDEX idx_title                 ON film (title);
CREATE INDEX idx_fk_language_id        ON film (language_id);
CREATE INDEX idx_fk_film_id_actor      ON film_actor (film_id);
CREATE INDEX idx_fk_film_id_inv        ON inventory (film_id);
CREATE INDEX idx_store_id_film_id      ON inventory (store_id, film_id);
CREATE INDEX idx_fk_inventory_id       ON rental (inventory_id);
CREATE INDEX idx_fk_customer_id_rental ON rental (customer_id);
CREATE INDEX idx_fk_staff_id_rental    ON rental (staff_id);
CREATE INDEX idx_fk_customer_id_pay    ON payment (customer_id);
CREATE INDEX idx_fk_staff_id_pay       ON payment (staff_id);