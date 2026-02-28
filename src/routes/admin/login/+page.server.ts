import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/admin');
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.', email });
		}

		const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
		if (error) {
			return fail(400, { error: 'Invalid email or password.', email });
		}

		const prisma = await db();
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user || !user.isActive) {
			await locals.supabase.auth.signOut();
			return fail(403, { error: 'Account is inactive or missing access.', email });
		}

		throw redirect(302, '/admin');
	}
};
