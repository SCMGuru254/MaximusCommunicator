import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './db';

// This will automatically run needed migrations on the database
console.log('Running migrations...');
migrate(db, { migrationsFolder: './migrations' });
console.log('Migrations complete!');
