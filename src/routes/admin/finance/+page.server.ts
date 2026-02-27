import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const prisma = await db();

	const applications = await prisma.financeApplication.findMany({
		orderBy: { createdAt: 'desc' },
		take: 50
	});

	return {
		applications: applications.map((a) => ({
			id: a.id,
			firstName: a.firstName,
			lastName: a.lastName,
			email: a.email,
			phone: a.phone,
			status: a.status,
			vehicleInterest: a.vehicleInterest,
			createdAt: a.createdAt.toISOString()
		}))
	};
};

export const actions: Actions = {
	updateStatus: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const status = formData.get('status')?.toString();
		if (!id || !status) return fail(400);

		const prisma = await db();
		await prisma.financeApplication.update({ where: { id }, data: { status } });
		return { updated: true };
	}
};
