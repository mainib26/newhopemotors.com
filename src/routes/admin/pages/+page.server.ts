import type { PageServerLoad } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async () => {
	const { data, error } = await adminClient()
		.from('pages')
		.select('id,title,slug,published_at,updated_at')
		.order('updated_at', { ascending: false });

	if (error) {
		console.error('Failed to load pages', error.message);
	}

	return {
		pages: (data ?? []).map((p) => ({
			id: p.id,
			title: p.title,
			slug: p.slug,
			published: Boolean(p.published_at),
			updatedAt: p.updated_at
		}))
	};
};
