import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { deleteSession } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const token = cookies.get('session');
		if (token) {
			await deleteSession(token);
		}
		cookies.delete('session', { path: '/' });
		throw redirect(302, '/admin/login');
	}
};
