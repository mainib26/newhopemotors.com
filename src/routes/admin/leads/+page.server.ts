import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ url }) => {
	const prisma = await db();

	const status = url.searchParams.get('status') ?? '';
	const source = url.searchParams.get('source') ?? '';
	const search = url.searchParams.get('q') ?? '';
	const view = url.searchParams.get('view') ?? 'table';
	const pageNum = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
	const perPage = 25;

	const where: any = {};
	if (status) where.status = status;
	if (source) where.source = source;
	if (search) {
		where.OR = [
			{ firstName: { contains: search, mode: 'insensitive' } },
			{ lastName: { contains: search, mode: 'insensitive' } },
			{ email: { contains: search, mode: 'insensitive' } },
			{ phone: { contains: search, mode: 'insensitive' } }
		];
	}

	const [leads, total, statusCounts] = await Promise.all([
		prisma.lead.findMany({
			where,
			include: {
				vehicle: { select: { year: true, make: true, model: true } },
				assignedTo: { select: { name: true } }
			},
			orderBy: { createdAt: 'desc' },
			skip: (pageNum - 1) * perPage,
			take: perPage
		}),
		prisma.lead.count({ where }),
		prisma.lead.groupBy({ by: ['status'], _count: { id: true } })
	]);

	return {
		leads: leads.map((l) => ({
			id: l.id,
			name: `${l.firstName} ${l.lastName ?? ''}`.trim(),
			email: l.email,
			phone: l.phone,
			status: l.status,
			source: l.source,
			vehicle: l.vehicle ? `${l.vehicle.year} ${l.vehicle.make} ${l.vehicle.model}` : null,
			assignedTo: l.assignedTo?.name ?? null,
			createdAt: l.createdAt.toISOString()
		})),
		total,
		page: pageNum,
		totalPages: Math.ceil(total / perPage),
		statusCounts: Object.fromEntries(statusCounts.map((s) => [s.status, s._count.id])),
		filters: { status, source, search, view }
	};
};
