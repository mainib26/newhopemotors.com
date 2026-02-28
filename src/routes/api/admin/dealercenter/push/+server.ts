import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireRole } from '$lib/server/auth';
import { pushUnsentLeads } from '$lib/server/dealercenter/push';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user || !requireRole(locals.user.role, 'ADMIN')) {
		throw error(403, 'Admin access required');
	}

	const result = await pushUnsentLeads();
	return json(result);
};
