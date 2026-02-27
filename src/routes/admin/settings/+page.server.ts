import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { requireRole, hashPassword } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	const prisma = await db();

	const users = await prisma.user.findMany({
		select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
		orderBy: { createdAt: 'asc' }
	});

	return {
		users: users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })),
		isAdmin: locals.user?.role === 'ADMIN'
	};
};

export const actions: Actions = {
	createUser: async ({ request, locals }) => {
		if (!requireRole(locals.user?.role ?? '', 'ADMIN')) {
			return fail(403, { userError: 'Admin access required' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim() ?? '';
		const email = formData.get('email')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const role = formData.get('role')?.toString() ?? 'VIEWER';

		if (!name || !email || !password) {
			return fail(400, { userError: 'All fields are required' });
		}

		const prisma = await db();

		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) return fail(400, { userError: 'Email already in use' });

		const passwordHash = await hashPassword(password);
		await prisma.user.create({
			data: { name, email, passwordHash, role }
		});

		return { userCreated: true };
	},

	toggleUser: async ({ request, locals }) => {
		if (!requireRole(locals.user?.role ?? '', 'ADMIN')) {
			return fail(403);
		}

		const formData = await request.formData();
		const userId = formData.get('userId')?.toString();
		const active = formData.get('active') === 'true';
		if (!userId) return fail(400);

		const prisma = await db();
		await prisma.user.update({ where: { id: userId }, data: { active } });
		return { userToggled: true };
	}
};
