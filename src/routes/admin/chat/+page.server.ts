import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const prisma = await db();

	const conversations = await prisma.chatConversation.findMany({
		orderBy: { createdAt: 'desc' },
		include: {
			lead: { select: { firstName: true, lastName: true } },
			_count: { select: { messages: true } }
		},
		take: 50
	});

	return {
		conversations: conversations.map((c) => ({
			id: c.id,
			sessionId: c.sessionId,
			leadName: c.lead ? `${c.lead.firstName} ${c.lead.lastName ?? ''}`.trim() : null,
			messageCount: c._count.messages,
			createdAt: c.createdAt.toISOString()
		}))
	};
};
