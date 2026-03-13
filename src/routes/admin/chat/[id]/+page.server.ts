import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';

const adminClient = () => getSupabaseAdminClient();

export const load: PageServerLoad = async ({ params }) => {
	const supabase = adminClient();

	const { data: conversation, error: convoError } = await supabase
		.from('ChatConversations')
		.select('id,sessionId,leadId,createdAt')
		.eq('id', params.id)
		.maybeSingle();

	if (convoError) {
		console.error('Failed to load conversation', convoError.message);
	}
	if (!conversation) throw error(404, 'Conversation not found');

	const { data: messages, error: messageError } = await supabase
		.from('ChatMessages')
		.select('id,role,content,createdAt')
		.eq('conversationId', params.id)
		.order('createdAt', { ascending: true });

	if (messageError) {
		console.error('Failed to load messages', messageError.message);
	}

	const leadNameMap = await fetchLeadNames(conversation.leadId ? [conversation.leadId] : []);

	return {
		conversation: {
			id: conversation.id,
			sessionId: conversation.sessionId,
			leadName: conversation.leadId ? leadNameMap.get(conversation.leadId) ?? null : null,
			leadId: conversation.leadId,
			createdAt: conversation.createdAt,
			messages: (messages ?? []).map((m) => ({
				id: m.id,
				role: m.role,
				content: m.content,
				createdAt: m.createdAt
			}))
		}
	};
};

async function fetchLeadNames(ids: string[]) {
	if (!ids.length) return new Map<string, string>();
	const { data, error } = await adminClient().from('Leads').select('id,firstName,lastName').in('id', ids);
	if (error || !data) {
		console.error('Failed to load lead names', error?.message);
		return new Map();
	}
	return new Map(data.map((lead) => [lead.id, `${lead.firstName} ${lead.lastName ?? ''}`.trim()]));
}
