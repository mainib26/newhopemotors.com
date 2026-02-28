import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getSupabaseAdminClient, updateSupabaseUserActiveState } from '$lib/server/supabase';
import { requireRole } from '$lib/server/auth';
import { USER_ROLES, type UserRole } from '$lib/constants/enums';

const adminClient = () => getSupabaseAdminClient();
const isUserRole = (value: string): value is UserRole => USER_ROLES.includes(value as UserRole);

export const load: PageServerLoad = async ({ locals }) => {
	const { data, error } = await adminClient()
		.from('users')
		.select('id,name,email,role,is_active,created_at')
		.order('created_at', { ascending: true });

	if (error) {
		console.error('Failed to load users', error.message);
		return { users: [], isAdmin: locals.user?.role === 'ADMIN' };
	}

	return {
		users: (data ?? []).map((u) => ({
			id: u.id,
			name: u.name,
			email: u.email,
			role: u.role as UserRole,
			isActive: u.is_active ?? true,
			createdAt: (u.created_at ?? new Date().toISOString())
		})),
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

		const existing = await adminClient()
			.from('users')
			.select('id')
			.eq('email', email)
			.maybeSingle();

		if (existing.data) {
			return fail(400, { userError: 'Email already in use' });
		}

		const supabaseAdmin = adminClient();
		const { data: supabaseData, error: supabaseError } = await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: { name, role: roleValue }
		});
		if (supabaseError) {
			return fail(400, { userError: supabaseError.message });
		}

		const { error: insertError } = await adminClient()
			.from('users')
			.insert({
				name,
				email,
				role: roleValue,
				is_active: true,
				supabase_id: supabaseData?.user?.id ?? null
			});

		if (insertError) {
			return fail(400, { userError: insertError.message });
		}

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

		const { data, error } = await adminClient()
			.from('users')
			.update({ is_active: isActive })
			.eq('id', userId)
			.select('email,supabase_id')
			.single();

		if (error || !data) {
			return fail(400, { userError: error?.message ?? 'Failed to update user' });
		}

		await updateSupabaseUserActiveState(data.email, data.supabase_id ?? null, isActive);
		return { userToggled: true };
	}
};
