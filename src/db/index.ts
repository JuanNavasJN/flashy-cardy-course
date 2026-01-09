import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { decksTable, cardsTable, userProgressTable } from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });