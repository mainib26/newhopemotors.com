import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireRole } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || !requireRole(locals.user.role, 'SALES')) {
		throw error(403, 'Unauthorized');
	}

	const formData = await request.formData();
	const vehicleId = formData.get('vehicleId')?.toString();
	if (!vehicleId) throw error(400, 'Vehicle ID required');

	const files = formData.getAll('photos') as File[];
	if (!files.length) throw error(400, 'No files provided');

	const prisma = await db();

	// Check if vehicle has any photos (to set first as primary)
	const existingCount = await prisma.vehiclePhoto.count({ where: { vehicleId } });

	const photos = [];
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		// For now, store as base64 data URL. In production, upload to Supabase Storage.
		const buffer = await file.arrayBuffer();
		const bytes = new Uint8Array(buffer);
		let binary = '';
		for (let j = 0; j < bytes.length; j++) {
			binary += String.fromCharCode(bytes[j]);
		}
		const base64 = btoa(binary);
		const dataUrl = `data:${file.type};base64,${base64}`;

		photos.push(
			await prisma.vehiclePhoto.create({
				data: {
					vehicleId,
					url: dataUrl,
					alt: `Vehicle photo ${existingCount + i + 1}`,
					sortOrder: existingCount + i,
					isPrimary: existingCount === 0 && i === 0
				}
			})
		);
	}

	return json({ success: true, photos });
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
	if (!locals.user || !requireRole(locals.user.role, 'SALES')) {
		throw error(403, 'Unauthorized');
	}

	const id = url.searchParams.get('id');
	if (!id) throw error(400, 'Photo ID required');

	const prisma = await db();
	const photo = await prisma.vehiclePhoto.findUnique({ where: { id } });
	if (!photo) throw error(404, 'Photo not found');

	await prisma.vehiclePhoto.delete({ where: { id } });

	// If deleted photo was primary, auto-set the first remaining photo as primary
	if (photo.isPrimary) {
		const first = await prisma.vehiclePhoto.findFirst({
			where: { vehicleId: photo.vehicleId },
			orderBy: { sortOrder: 'asc' }
		});
		if (first) {
			await prisma.vehiclePhoto.update({ where: { id: first.id }, data: { isPrimary: true } });
		}
	}

	return json({ success: true });
};

// Reorder photos
export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || !requireRole(locals.user.role, 'SALES')) {
		throw error(403, 'Unauthorized');
	}

	const { order } = await request.json() as { order: string[] };
	if (!Array.isArray(order)) throw error(400, 'Order array required');

	const prisma = await db();
	await Promise.all(
		order.map((id, i) => prisma.vehiclePhoto.update({ where: { id }, data: { sortOrder: i } }))
	);

	return json({ success: true });
};

export const PATCH: RequestHandler = async ({ url, locals }) => {
	if (!locals.user || !requireRole(locals.user.role, 'SALES')) {
		throw error(403, 'Unauthorized');
	}

	const id = url.searchParams.get('id');
	const vehicleId = url.searchParams.get('vehicleId');
	if (!id || !vehicleId) throw error(400, 'Photo ID and Vehicle ID required');

	const prisma = await db();

	// Unset all primaries for this vehicle, then set the new one
	await prisma.vehiclePhoto.updateMany({ where: { vehicleId }, data: { isPrimary: false } });
	await prisma.vehiclePhoto.update({ where: { id }, data: { isPrimary: true } });

	return json({ success: true });
};
