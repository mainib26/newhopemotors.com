import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

function createPrismaClient(connectionString?: string) {
	const pool = new pg.Pool({
		connectionString: connectionString || process.env.DATABASE_URL
	});
	const adapter = new PrismaPg(pool);
	return new PrismaClient({ adapter });
}

// For local development, use DATABASE_URL from env
// In production on Cloudflare, pass the Hyperdrive connection string
let prisma: PrismaClient;

export function getDb(connectionString?: string): PrismaClient {
	if (connectionString) {
		return createPrismaClient(connectionString);
	}
	if (!prisma) {
		prisma = createPrismaClient();
	}
	return prisma;
}
