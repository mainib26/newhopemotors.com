import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: { session } } = await locals.supabase.auth.getSession();
	return { hasSession: !!session };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const password = formData.get('password')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters.' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match.' });
		}

		const { error } = await locals.supabase.auth.updateUser({ password });

		if (error) {
			return fail(400, { error: error.message });
		}

		await locals.supabase.auth.signOut();
		throw redirect(302, '/admin/login?reset=success');
	}
};
