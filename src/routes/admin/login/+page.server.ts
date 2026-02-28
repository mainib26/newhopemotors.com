import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/admin');
	}
};

const adminClient = () => getSupabaseAdminClient();

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

		const { data: user, error: userError } = await adminClient()
			.from('users')
			.select('id,is_active')
			.eq('email', email)
			.maybeSingle();

		if (userError || !user || user.is_active === false) {
			await locals.supabase.auth.signOut();
			return fail(403, { error: 'Account is inactive or missing access.', email });
		}

		throw redirect(302, '/admin');
	}
};
