import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { requireRole } from '$lib/server/auth';
import { getSupabaseAdminClient, updateSupabaseUserActiveState } from '$lib/server/supabase';
import type { UserRole } from '@prisma/client';

const USER_ROLES: UserRole[] = ['ADMIN', 'SALES', 'VIEWER'];
const isUserRole = (value: string): value is UserRole => USER_ROLES.includes(value as UserRole);

export const load: PageServerLoad = async ({ locals }) => {
	const prisma = await db();

	const users = await prisma.user.findMany({
		select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
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
		const roleValue = formData.get('role')?.toString() ?? 'VIEWER';

		if (!name || !email || !password || !isUserRole(roleValue)) {
			return fail(400, { userError: 'All fields are required' });
		}

		const prisma = await db();

		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) return fail(400, { userError: 'Email already in use' });

		const supabaseAdmin = getSupabaseAdminClient();
		const { data: supabaseData, error: supabaseError } = await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: { name, role: roleValue }
		});
		if (supabaseError) {
			return fail(400, { userError: supabaseError.message });
		}

		await prisma.user.create({
			data: { name, email, passwordHash: 'supabase-managed', role: roleValue, supabaseId: supabaseData?.user?.id ?? null }
		});

		return { userCreated: true };
	},

	toggleUser: async ({ request, locals }) => {
		if (!requireRole(locals.user?.role ?? '', 'ADMIN')) {
			return fail(403);
		}

		const formData = await request.formData();
		const userId = formData.get('userId')?.toString();
		const isActive = formData.get('isActive') === 'true';
		if (!userId) return fail(400);

		const prisma = await db();
		const user = await prisma.user.update({ where: { id: userId }, data: { isActive }, select: { email: true, supabaseId: true } });
		await updateSupabaseUserActiveState(user.email, user.supabaseId, isActive);
		return { userToggled: true };
	}
};
