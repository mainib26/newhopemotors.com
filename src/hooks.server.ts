import { redirect, type Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session');

	if (sessionToken) {
		event.locals.user = await validateSession(sessionToken);
	} else {
		event.locals.user = null;
	}

	// Protect all /admin routes except login
	if (event.url.pathname.startsWith('/admin') && !event.url.pathname.startsWith('/admin/login')) {
		if (!event.locals.user) {
			throw redirect(302, '/admin/login');
		}
	}

	return resolve(event);
};
