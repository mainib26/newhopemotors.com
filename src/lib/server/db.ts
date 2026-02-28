import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from '$env/dynamic/private';
import { createRequire } from 'node:module';

let PrismaClient: any;

async function loadPrismaClient() {
	if (!PrismaClient) {
		try {
			// In dev mode, use createRequire to load CJS module
			const require = createRequire(import.meta.url);
			const mod = require('../../generated/prisma/index.js');
			PrismaClient = mod.PrismaClient;
		} catch {
			// Fallback for production build where dynamic import works
			const mod = await import('../../generated/prisma/index.js');
			PrismaClient = mod.PrismaClient || (mod as any).default?.PrismaClient;
		}
	}
	return PrismaClient;
}

export async function getDb(connectionString?: string) {
	const Client = await loadPrismaClient();
	const pool = new pg.Pool({
		connectionString: connectionString || env.DATABASE_URL
	});
	const adapter = new PrismaPg(pool);
	return new Client({ adapter });
}

let cachedDb: any;

export async function db(connectionString?: string) {
	if (connectionString) {
		return getDb(connectionString);
	}
	if (!cachedDb) {
		cachedDb = await getDb();
	}
	return cachedDb;
}
