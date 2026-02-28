import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const prisma = await db();
	const pages = await prisma.page.findMany({ orderBy: { updatedAt: 'desc' } });

	return {
		pages: pages.map((p) => ({
			id: p.id,
			title: p.title,
			slug: p.slug,
			published: Boolean(p.publishedAt),
			updatedAt: p.updatedAt.toISOString()
		}))
	};
};
