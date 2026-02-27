import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	const prisma = await db();

	const vehicles = await prisma.vehicle.findMany({
		where: { status: 'ACTIVE' },
		select: { slug: true, updatedAt: true }
	});

	const staticPages = [
		{ url: '', priority: '1.0', changefreq: 'daily' },
		{ url: '/inventory', priority: '0.9', changefreq: 'daily' },
		{ url: '/finance', priority: '0.7', changefreq: 'monthly' },
		{ url: '/about', priority: '0.6', changefreq: 'monthly' },
		{ url: '/contact', priority: '0.6', changefreq: 'monthly' }
	];

	const baseUrl = 'https://newhopemotors.com';

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map((p) => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${vehicles.map((v) => `  <url>
    <loc>${baseUrl}/vehicle/${v.slug}</loc>
    <lastmod>${v.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'max-age=3600' }
	});
};
