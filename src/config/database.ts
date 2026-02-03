import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DB_PATH || join(__dirname, '../../database/video_rental.db');
const SCHEMA_PATH = join(__dirname, '../../database/schema.sql');

class DatabaseManager {
  private db: Database.Database | null = null;

  connect(): void {
    try {
      this.db = new Database(DB_PATH);
      console.log('✅ Conectado a SQLite');
      this.initializeSchema();
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error);
      throw error;
    }
  }

  private initializeSchema(): void {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
      this.db.exec(schema);
      console.log('✅ Schema inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar schema:', error);
      throw error;
    }
  }

  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('✅ Conexión a la base de datos cerrada');
    }
  }
}

export default new DatabaseManager();