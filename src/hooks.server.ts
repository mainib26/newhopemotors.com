import { redirect, type Handle } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';

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
			const prisma = await db();
			const dbUser = await prisma.user.findUnique({
				where: { email: session.user.email },
				select: { id: true, email: true, name: true, role: true, isActive: true }
			});

			if (dbUser && dbUser.isActive) {
				event.locals.user = {
					id: dbUser.id,
					email: dbUser.email,
					name: dbUser.name,
					role: dbUser.role as 'ADMIN' | 'SALES' | 'VIEWER'
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
