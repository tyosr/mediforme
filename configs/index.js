import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../configs/schema';

let db = null;

if (process.env.DATABASE_URL) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
  } catch (error) {
    console.error("Erreur de connexion à la base :", error);
  }
} else {
  console.warn("DATABASE_URL non défini");
}

export { db };
