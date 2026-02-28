import { redirect, type Handle } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/private';
import { getSupabaseAdminClient } from '$lib/server/supabase';
import type { UserRole } from '$lib/constants/enums';

const adminClient = () => getSupabaseAdminClient();

type AdminUser = {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	isActive: boolean;
};

async function fetchUserByEmail(email: string): Promise<AdminUser | null> {
	const { data, error } = await adminClient()
		.from('users')
		.select('id,email,name,role,is_active')
		.eq('email', email)
		.maybeSingle();

	if (error) {
		console.error('Failed to load admin user', error.message);
		return null;
	}

	if (!data) return null;

	return {
		id: data.id,
		email: data.email,
		name: data.name,
		role: (data.role ?? 'VIEWER') as UserRole,
		isActive: data.is_active ?? true
	};
}

export const handle: Handle = async ({ event, resolve }) => {
	const supabaseUrl = env.SUPABASE_URL;
	const supabaseAnonKey = env.SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
	}

	event.locals.supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookies) => {
				cookies.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { path: '/', ...options });
				});
			}
		}
	});

	const {
		data: { session }
	} = await event.locals.supabase.auth.getSession();

	event.locals.session = session ?? null;

	if (session?.user?.email) {
		if (session.user.app_metadata?.disabled) {
			event.locals.user = null;
			await event.locals.supabase.auth.signOut();
		} else {
			const adminUser = await fetchUserByEmail(session.user.email);

			if (adminUser && adminUser.isActive) {
				event.locals.user = {
					id: adminUser.id,
					email: adminUser.email,
					name: adminUser.name,
					role: adminUser.role
				};
			} else {
				event.locals.user = null;
				await event.locals.supabase.auth.signOut();
			}
		}
	} else {
		event.locals.user = null;
	}

	if (event.url.pathname.startsWith('/admin') && !event.url.pathname.startsWith('/admin/login')) {
		if (!event.locals.user) {
			throw redirect(302, '/admin/login');
		}
	}

	return resolve(event);
};
