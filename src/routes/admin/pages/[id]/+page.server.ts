import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async ({ params }) => {
	const { data, error: loadError } = await adminClient()
		.from('pages')
		.select('id,slug,title,content,meta_title,meta_description,published_at,created_at,updated_at')
		.eq('id', params.id)
		.maybeSingle();

	if (loadError) {
		console.error('Failed to load page', loadError.message);
	}
	if (!data) throw error(404, 'Page not found');

	return {
		page: {
			id: data.id,
			slug: data.slug,
			title: data.title,
			content: data.content,
			metaTitle: data.meta_title,
			metaDescription: data.meta_description,
			published: Boolean(data.published_at),
			createdAt: data.created_at,
			updatedAt: data.updated_at
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

		const supabase = adminClient();
		const { data: existing, error: fetchError } = await supabase
			.from('pages')
			.select('published_at')
			.eq('id', params.id)
			.maybeSingle();

		if (fetchError || !existing) {
			return fail(404, { error: 'Page not found' });
		}

		const publishedAt = published ? existing.published_at ?? new Date().toISOString() : null;

		const { error: updateError } = await supabase
			.from('pages')
			.update({
				title,
				content,
				meta_title: metaTitle,
				meta_description: metaDescription,
				published_at: publishedAt
			})
			.eq('id', params.id);

		if (updateError) {
			return fail(400, { error: updateError.message });
		}

		return { success: true };
	}
};
