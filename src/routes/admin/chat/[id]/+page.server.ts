import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async ({ params }) => {
	const supabase = adminClient();

	const { data: conversation, error: convoError } = await supabase
		.from('chat_conversations')
		.select('id,session_id,lead_id,created_at')
		.eq('id', params.id)
		.maybeSingle();

	if (convoError) {
		console.error('Failed to load conversation', convoError.message);
	}
	if (!conversation) throw error(404, 'Conversation not found');

	const { data: messages, error: messageError } = await supabase
		.from('chat_messages')
		.select('id,role,content,created_at')
		.eq('conversation_id', params.id)
		.order('created_at', { ascending: true });

	if (messageError) {
		console.error('Failed to load messages', messageError.message);
	}

	const leadNameMap = await fetchLeadNames(conversation.lead_id ? [conversation.lead_id] : []);

	return {
		conversation: {
			id: conversation.id,
			sessionId: conversation.session_id,
			leadName: conversation.lead_id ? leadNameMap.get(conversation.lead_id) ?? null : null,
			leadId: conversation.lead_id,
			createdAt: conversation.created_at,
			messages: (messages ?? []).map((m) => ({
				id: m.id,
				role: m.role,
				content: m.content,
				createdAt: m.created_at
			}))
		}
	};
};

async function fetchLeadNames(ids: string[]) {
	if (!ids.length) return new Map<string, string>();
	const { data, error } = await adminClient().from('leads').select('id,first_name,last_name').in('id', ids);
	if (error || !data) {
		console.error('Failed to load lead names', error?.message);
		return new Map();
	}
	return new Map(data.map((lead) => [lead.id, `${lead.first_name} ${lead.last_name ?? ''}`.trim()]));
}
