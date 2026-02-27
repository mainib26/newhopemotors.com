import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { verifyPassword, createSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/admin');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.', email });
		}

		const prisma = await db();
		const user = await prisma.user.findUnique({ where: { email } });

		if (!user || !user.isActive) {
			return fail(400, { error: 'Invalid email or password.', email });
		}

		const valid = await verifyPassword(password, user.passwordHash);
		if (!valid) {
			return fail(400, { error: 'Invalid email or password.', email });
		}

		const token = await createSession(user.id);

		cookies.set('session', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: 7 * 24 * 60 * 60 // 7 days
		});

		throw redirect(302, '/admin');
	}
};
