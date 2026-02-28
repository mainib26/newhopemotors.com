import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireRole } from '$lib/server/auth';
import { deleteAdminVehicle } from '$lib/server/admin-vehicles';

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user || !requireRole(locals.user.role, 'ADMIN')) {
    throw error(403, 'Unauthorized');
  }

  await deleteAdminVehicle(params.id);
  return json({ success: true });
};
