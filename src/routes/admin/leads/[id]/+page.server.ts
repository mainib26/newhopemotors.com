import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params }) => {
	const prisma = await db();
	const lead = await prisma.lead.findUnique({
		where: { id: params.id },
		include: {
			vehicle: { select: { id: true, year: true, make: true, model: true, trim: true, price: true } },
			assignedTo: { select: { id: true, name: true } },
			notes: {
				orderBy: { createdAt: 'desc' },
				include: { author: { select: { name: true } } }
			},
			appointments: {
				orderBy: { date: 'desc' },
				include: { vehicle: { select: { year: true, make: true, model: true } } }
			}
		}
	});

	if (!lead) throw error(404, 'Lead not found');

	const users = await prisma.user.findMany({
		where: { active: true },
		select: { id: true, name: true }
	});

	return {
		lead: {
			...lead,
			createdAt: lead.createdAt.toISOString(),
			updatedAt: lead.updatedAt.toISOString(),
			notes: lead.notes.map((n) => ({
				...n,
				createdAt: n.createdAt.toISOString()
			})),
			appointments: lead.appointments.map((a) => ({
				...a,
				date: a.date.toISOString(),
				createdAt: a.createdAt.toISOString(),
				updatedAt: a.updatedAt.toISOString()
			}))
		},
		users
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, params }) => {
		const formData = await request.formData();
		const status = formData.get('status')?.toString();
		if (!status) return fail(400, { error: 'Status required' });

		const prisma = await db();
		await prisma.lead.update({ where: { id: params.id }, data: { status } });
		return { updated: true };
	},

	assign: async ({ request, params }) => {
		const formData = await request.formData();
		const userId = formData.get('userId')?.toString() || null;

		const prisma = await db();
		await prisma.lead.update({ where: { id: params.id }, data: { assignedToId: userId } });
		return { updated: true };
	},

	addNote: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const content = formData.get('content')?.toString().trim();
		if (!content) return fail(400, { noteError: 'Note cannot be empty' });

		const prisma = await db();
		await prisma.leadNote.create({
			data: {
				leadId: params.id,
				authorId: locals.user!.id,
				content
			}
		});
		return { noteAdded: true };
	}
};
