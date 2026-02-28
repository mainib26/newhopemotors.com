import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://newhopemotors.com/sitemap.xml`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain' }
	});
};
