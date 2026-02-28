import type { PageServerLoad } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async () => {
	const supabase = adminClient();

	const conversationsRes = await supabase
		.from('chat_conversations')
		.select('id,session_id,lead_id,created_at')
		.order('created_at', { ascending: false })
		.limit(50);

	if (conversationsRes.error) {
		console.error('Failed to load chat conversations', conversationsRes.error.message);
	}

	const conversationIds = (conversationsRes.data ?? []).map((c) => c.id);
	const leadIds = Array.from(new Set((conversationsRes.data ?? []).map((c) => c.lead_id).filter(Boolean))) as string[];
	const [messageCounts, leadMap] = await Promise.all([
		fetchMessageCounts(conversationIds),
		fetchLeadNames(leadIds)
	]);

	return {
		conversations: (conversationsRes.data ?? []).map((c) => ({
			id: c.id,
			sessionId: c.session_id,
			leadName: c.lead_id ? leadMap.get(c.lead_id) ?? null : null,
			messageCount: messageCounts.get(c.id) ?? 0,
			createdAt: c.created_at
		}))
	};
};

async function fetchMessageCounts(ids: string[]) {
	if (!ids.length) return new Map<string, number>();
	const { data, error } = await adminClient()
		.from('chat_messages')
		.select('conversation_id')
		.in('conversation_id', ids);
	if (error || !data) {
		console.error('Failed to count chat messages', error?.message);
		return new Map();
	}
	const counts = new Map<string, number>();
	for (const row of data) {
		counts.set(row.conversation_id, (counts.get(row.conversation_id) ?? 0) + 1);
	}
	return counts;
}

async function fetchLeadNames(ids: string[]) {
	if (!ids.length) return new Map<string, string>();
	const { data, error } = await adminClient().from('leads').select('id,first_name,last_name').in('id', ids);
	if (error || !data) {
		console.error('Failed to load lead names', error?.message);
		return new Map();
	}
	return new Map(data.map((lead) => [lead.id, `${lead.first_name} ${lead.last_name ?? ''}`.trim()]));
}
