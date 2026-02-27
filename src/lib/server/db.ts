import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let PrismaClient: any;

async function loadPrismaClient() {
	if (!PrismaClient) {
		// Dynamic import to handle CJS/ESM interop
		const mod = await import('../../generated/prisma/index.js');
		PrismaClient = mod.PrismaClient || (mod as any).default?.PrismaClient;
	}
	return PrismaClient;
}

export async function getDb(connectionString?: string) {
	const Client = await loadPrismaClient();
	const pool = new pg.Pool({
		connectionString: connectionString || process.env.DATABASE_URL
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
