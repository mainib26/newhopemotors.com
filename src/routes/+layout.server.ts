import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return {
		supabaseUrl: env.SUPABASE_URL!,
		supabaseAnonKey: env.SUPABASE_ANON_KEY!
	};
};
