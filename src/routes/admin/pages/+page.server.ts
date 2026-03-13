import type { PageServerLoad } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async () => {
	const { data, error } = await adminClient()
		.from('Page')
		.select('id,title,slug,publishedAt,updatedAt')
		.order('updatedAt', { ascending: false });

	if (error) {
		console.error('Failed to load pages', error.message);
	}

	return {
		pages: (data ?? []).map((p) => ({
			id: p.id,
			title: p.title,
			slug: p.slug,
			published: Boolean(p.publishedAt),
			updatedAt: p.updatedAt
		}))
	};
};
