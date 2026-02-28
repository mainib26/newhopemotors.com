import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireRole } from '$lib/server/auth';
import {
  uploadVehiclePhotos,
  deleteVehiclePhoto,
  reorderVehiclePhotos,
  markPrimaryPhoto
} from '$lib/server/admin-vehicles';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || !requireRole(locals.user.role, 'SALES')) {
    throw error(403, 'Unauthorized');
  }

  const formData = await request.formData();
  const vehicleId = formData.get('vehicleId')?.toString();
  if (!vehicleId) throw error(400, 'Vehicle ID required');

  const files = formData.getAll('photos') as File[];
  if (!files.length) throw error(400, 'No files provided');

  const photos = await uploadVehiclePhotos(vehicleId, files);
  return json({ success: true, photos });
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
  if (!locals.user || !requireRole(locals.user.role, 'SALES')) {
    throw error(403, 'Unauthorized');
  }

  const id = url.searchParams.get('id');
  if (!id) throw error(400, 'Photo ID required');

  await deleteVehiclePhoto(id);
  return json({ success: true });
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || !requireRole(locals.user.role, 'SALES')) {
    throw error(403, 'Unauthorized');
  }

  const { order } = (await request.json()) as { order: string[] };
  if (!Array.isArray(order)) throw error(400, 'Order array required');

  await reorderVehiclePhotos(order);
  return json({ success: true });
};

export const PATCH: RequestHandler = async ({ url, locals }) => {
  if (!locals.user || !requireRole(locals.user.role, 'SALES')) {
    throw error(403, 'Unauthorized');
  }

  const id = url.searchParams.get('id');
  const vehicleId = url.searchParams.get('vehicleId');
  if (!id || !vehicleId) throw error(400, 'Photo ID and Vehicle ID required');

  await markPrimaryPhoto(id, vehicleId);
  return json({ success: true });
};
