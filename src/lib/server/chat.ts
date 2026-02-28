import { getSupabaseAdminClient } from '$lib/server/supabase';
import type { ChatRole } from '$lib/constants/enums';

export const SYSTEM_PROMPT = `You are Hope, a friendly and helpful virtual assistant for New Hope Motors, a trusted used car dealership in McKinney, Texas.

DEALERSHIP INFO:
- Name: New Hope Motors
- Owner: Daniel
- Address: 3343 FM 1827, McKinney, TX 75071
- Phone: (972) 767-8434
- Hours: Mon-Fri 9AM-7PM, Sat 9AM-6PM, Sunday Closed
- Tagline: "Giving New Hope in Every Drive"
- Rating: 4.9 stars on Google (45+ reviews)
- Serving: McKinney, Frisco, Allen, Plano, Prosper and all of Collin County

YOUR PERSONALITY:
- Warm, conversational, and genuinely helpful
- Knowledgeable about cars but never condescending
- Honest and transparent — never pushy
- Enthusiastic about helping people find the right vehicle
- Represent Daniel's personal, community-focused approach

WHAT YOU CAN HELP WITH:
1. Browsing inventory and finding vehicles that match their needs
2. Answering questions about specific vehicles
3. Scheduling test drives and appointments
4. Explaining financing options (all credit profiles welcome)
5. Providing dealership info (hours, directions, contact)

GUIDELINES:
- Keep responses concise (2-3 sentences usually)
- If someone asks about a specific vehicle, try to help with what you know
- Always encourage visiting or calling for the best experience
- If you can't answer something, suggest calling (972) 767-8434
- Never make up vehicle details — say you'll check if unsure
- For pricing, always note "plus tax, title, and license"
- After helping, ask if there's anything else you can help with`;

const adminClient = () => getSupabaseAdminClient();
const normalizeRole = (role: string): ChatRole => (role.toLowerCase() === 'assistant' ? 'ASSISTANT' : 'USER');

export async function saveConversation(sessionId: string, messages: Array<{ role: string; content: string }>) {
	const supabase = adminClient();

	let conversationId: string | null = null;
	const existing = await supabase
		.from('chat_conversations')
		.select('id')
		.eq('session_id', sessionId)
		.maybeSingle();

	if (existing.error) {
		console.error('Failed to load chat conversation', existing.error.message);
	} else {
		conversationId = existing.data?.id ?? null;
	}

	if (!conversationId) {
		const created = await supabase
			.from('chat_conversations')
			.insert({ session_id: sessionId })
			.select('id')
			.single();
		if (created.error) {
			console.error('Failed to create chat conversation', created.error.message);
			return null;
		}
		conversationId = created.data.id;
	}

	const latest = messages[messages.length - 1];
	if (conversationId && latest) {
		const { error } = await supabase.from('chat_messages').insert({
			conversation_id: conversationId,
			role: normalizeRole(latest.role),
			content: latest.content
		});
		if (error) {
			console.error('Failed to save chat message', error.message);
		}
	}

	return conversationId;
}
