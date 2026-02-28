import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from '$env/dynamic/private';
import { createRequire } from 'node:module';

type PrismaClientType = import('@prisma/client').PrismaClient;
type PrismaClientConstructor = new (...args: ConstructorParameters<typeof import('@prisma/client').PrismaClient>) => PrismaClientType;

let PrismaClient: PrismaClientConstructor | null = null;

async function loadPrismaClient(): Promise<PrismaClientConstructor> {
	if (!PrismaClient) {
		try {
			// In dev mode, use createRequire to load CJS module
			const require = createRequire(import.meta.url);
			const mod = require('../../generated/prisma/index.js');
			PrismaClient = mod.PrismaClient;
		} catch {
			// Fallback for production build where dynamic import works
			const mod = await import('../../generated/prisma/index.js');
			PrismaClient = (mod as { PrismaClient?: PrismaClientConstructor }).PrismaClient || (mod as any).default?.PrismaClient;
		}
	}
	if (!PrismaClient) {
		throw new Error('Failed to load Prisma client');
	}
	return PrismaClient;
}

export async function getDb(connectionString?: string): Promise<PrismaClientType> {
	const Client = await loadPrismaClient();
	const pool = new pg.Pool({
		connectionString: connectionString || env.DATABASE_URL
	});
	const adapter = new PrismaPg(pool);
	return new Client({ adapter });
}

let cachedDb: PrismaClientType | null = null;

export async function db(connectionString?: string): Promise<PrismaClientType> {
	if (connectionString) {
		return getDb(connectionString);
	}
	if (!cachedDb) {
		cachedDb = await getDb();
	}
	return cachedDb;
}
