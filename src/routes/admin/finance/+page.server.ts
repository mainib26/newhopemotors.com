import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import type { FinanceStatus } from '@prisma/client';

const FINANCE_STATUSES: FinanceStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'DENIED'];
const isFinanceStatus = (value: string): value is FinanceStatus => FINANCE_STATUSES.includes(value as FinanceStatus);

export const load: PageServerLoad = async () => {
	const prisma = await db();

	const applications = await prisma.financeApplication.findMany({
		orderBy: { createdAt: 'desc' },
		take: 50,
		include: { vehicle: { select: { year: true, make: true, model: true } } }
	});

	return {
		applications: applications.map((a) => ({
			id: a.id,
			firstName: a.firstName,
			lastName: a.lastName,
			email: a.email,
			phone: a.phone,
			status: a.status,
			vehicleInterest: a.vehicle ? `${a.vehicle.year} ${a.vehicle.make} ${a.vehicle.model}` : null,
			createdAt: a.createdAt.toISOString()
		}))
	};
};

export const actions: Actions = {
	updateStatus: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const statusValue = formData.get('status')?.toString() ?? '';
		if (!id || !isFinanceStatus(statusValue)) return fail(400);

		const prisma = await db();
		await prisma.financeApplication.update({ where: { id }, data: { status: statusValue } });
		return { updated: true };
	}
};
