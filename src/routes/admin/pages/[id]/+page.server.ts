import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params }) => {
	const prisma = await db();
	const page = await prisma.page.findUnique({ where: { id: params.id } });
	if (!page) throw error(404, 'Page not found');

	return {
		page: {
			...page,
			createdAt: page.createdAt.toISOString(),
			updatedAt: page.updatedAt.toISOString()
		}
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim();
		const content = formData.get('content')?.toString() ?? '';
		const metaTitle = formData.get('metaTitle')?.toString().trim() || null;
		const metaDescription = formData.get('metaDescription')?.toString().trim() || null;
		const published = formData.get('published') === 'on';

		if (!title) return fail(400, { error: 'Title is required' });

		const prisma = await db();
		const existing = await prisma.page.findUnique({ where: { id: params.id }, select: { publishedAt: true } });
		if (!existing) {
			return fail(404, { error: 'Page not found' });
		}

		const publishedAt = published ? existing.publishedAt ?? new Date() : null;
		await prisma.page.update({
			where: { id: params.id },
			data: { title, content, metaTitle, metaDescription, publishedAt }
		});

		return { success: true };
	}
};
