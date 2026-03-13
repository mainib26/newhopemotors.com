import type { PageServerLoad } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async () => {
	const supabase = adminClient();

	const conversationsRes = await supabase
		.from('ChatConversations')
		.select('id,sessionId,leadId,createdAt')
		.order('createdAt', { ascending: false })
		.limit(50);

	if (conversationsRes.error) {
		console.error('Failed to load chat conversations', conversationsRes.error.message);
	}

	const conversationIds = (conversationsRes.data ?? []).map((c) => c.id);
	const leadIds = Array.from(new Set((conversationsRes.data ?? []).map((c) => c.leadId).filter(Boolean))) as string[];
	const [messageCounts, leadMap] = await Promise.all([
		fetchMessageCounts(conversationIds),
		fetchLeadNames(leadIds)
	]);

	return {
		conversations: (conversationsRes.data ?? []).map((c) => ({
			id: c.id,
			sessionId: c.sessionId,
			leadName: c.leadId ? leadMap.get(c.leadId) ?? null : null,
			messageCount: messageCounts.get(c.id) ?? 0,
			createdAt: c.createdAt
		}))
	};
};

async function fetchMessageCounts(ids: string[]) {
	if (!ids.length) return new Map<string, number>();
	const { data, error } = await adminClient()
		.from('ChatMessages')
		.select('conversationId')
		.in('conversationId', ids);
	if (error || !data) {
		console.error('Failed to count chat messages', error?.message);
		return new Map();
	}
	const counts = new Map<string, number>();
	for (const row of data) {
		counts.set(row.conversationId, (counts.get(row.conversationId) ?? 0) + 1);
	}
	return counts;
}

async function fetchLeadNames(ids: string[]) {
	if (!ids.length) return new Map<string, string>();
	const { data, error } = await adminClient().from('Leads').select('id,firstName,lastName').in('id', ids);
	if (error || !data) {
		console.error('Failed to load lead names', error?.message);
		return new Map();
	}
	return new Map(data.map((lead) => [lead.id, `${lead.firstName} ${lead.lastName ?? ''}`.trim()]));
}
