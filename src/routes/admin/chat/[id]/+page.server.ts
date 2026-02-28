import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params }) => {
	const prisma = await db();

	const conversation = await prisma.chatConversation.findUnique({
		where: { id: params.id },
		include: {
			messages: { orderBy: { createdAt: 'asc' } },
			lead: { select: { id: true, firstName: true, lastName: true } }
		}
	});

	if (!conversation) throw error(404, 'Conversation not found');

	return {
		conversation: {
			id: conversation.id,
			sessionId: conversation.sessionId,
			leadName: conversation.lead ? `${conversation.lead.firstName} ${conversation.lead.lastName ?? ''}`.trim() : null,
			leadId: conversation.leadId,
			createdAt: conversation.createdAt.toISOString(),
			messages: conversation.messages.map((m) => ({
				id: m.id,
				role: m.role,
				content: m.content,
				createdAt: m.createdAt.toISOString()
			}))
		}
	};
};
