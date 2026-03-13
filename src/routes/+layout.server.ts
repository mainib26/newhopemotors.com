import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	if (code) {
		await locals.supabase.auth.exchangeCodeForSession(code);
		throw redirect(302, '/admin/reset-password');
	}

	return {
		supabaseUrl: env.SUPABASE_URL!,
		supabaseAnonKey: env.SUPABASE_ANON_KEY!
	};
};
