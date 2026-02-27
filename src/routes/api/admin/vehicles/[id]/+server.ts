import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireRole } from '$lib/server/auth';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || !requireRole(locals.user.role, 'ADMIN')) {
		throw error(403, 'Unauthorized');
	}

	const prisma = await db();
	await prisma.vehiclePhoto.deleteMany({ where: { vehicleId: params.id } });
	await prisma.vehicle.delete({ where: { id: params.id } });

	return json({ success: true });
};
