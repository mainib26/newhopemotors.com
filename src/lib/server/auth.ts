import { db } from './db';

const SALT_LENGTH = 16;
const ITERATIONS = 100000;
const KEY_LENGTH = 32;

function bufferToHex(buffer: ArrayBuffer): string {
	return Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function hexToBuffer(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
	}
	return bytes;
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
		'deriveBits'
	]);
	const derivedBits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
		keyMaterial,
		KEY_LENGTH * 8
	);
	return `${bufferToHex(salt.buffer)}:${bufferToHex(derivedBits)}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const [saltHex, hashHex] = storedHash.split(':');
	if (!saltHex || !hashHex) return false;

	const salt = hexToBuffer(saltHex);
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
		'deriveBits'
	]);
	const derivedBits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
		keyMaterial,
		KEY_LENGTH * 8
	);
	return bufferToHex(derivedBits) === hashHex;
}

export function generateSessionToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return bufferToHex(bytes.buffer);
}

export async function createSession(userId: string): Promise<string> {
	const prisma = await db();
	const token = generateSessionToken();
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

	await prisma.session.create({
		data: { userId, token, expiresAt }
	});

	return token;
}

export async function validateSession(token: string) {
	if (!token) return null;

	const prisma = await db();
	const session = await prisma.session.findUnique({
		where: { token },
		include: { user: true }
	});

	if (!session) return null;
	if (session.expiresAt < new Date()) {
		await prisma.session.delete({ where: { id: session.id } });
		return null;
	}

	return {
		id: session.user.id,
		email: session.user.email,
		name: session.user.name,
		role: session.user.role as 'ADMIN' | 'SALES' | 'VIEWER'
	};
}

export async function deleteSession(token: string): Promise<void> {
	const prisma = await db();
	await prisma.session.deleteMany({ where: { token } });
}

export function requireRole(userRole: string, requiredRole: 'ADMIN' | 'SALES' | 'VIEWER'): boolean {
	const hierarchy = { ADMIN: 3, SALES: 2, VIEWER: 1 };
	return (hierarchy[userRole as keyof typeof hierarchy] || 0) >= hierarchy[requiredRole];
}
