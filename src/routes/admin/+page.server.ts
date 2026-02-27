import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const prisma = await db();

	const now = new Date();
	const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	const [
		totalVehicles,
		activeVehicles,
		newLeadsToday,
		totalLeads,
		appointmentsToday,
		soldThisMonth,
		recentLeads,
		leadsByStatus
	] = await Promise.all([
		prisma.vehicle.count(),
		prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
		prisma.lead.count({ where: { createdAt: { gte: startOfDay } } }),
		prisma.lead.count(),
		prisma.appointment.count({ where: { date: { gte: startOfDay } } }),
		prisma.vehicle.count({ where: { status: 'SOLD', updatedAt: { gte: startOfMonth } } }),
		prisma.lead.findMany({
			take: 10,
			orderBy: { createdAt: 'desc' },
			include: { vehicle: { select: { year: true, make: true, model: true } } }
		}),
		prisma.lead.groupBy({
			by: ['status'],
			_count: { id: true }
		})
	]);

	const pipeline = Object.fromEntries(
		leadsByStatus.map((s) => [s.status, s._count.id])
	);

	return {
		stats: {
			totalVehicles,
			activeVehicles,
			newLeadsToday,
			totalLeads,
			appointmentsToday,
			soldThisMonth
		},
		pipeline,
		recentLeads: recentLeads.map((l) => ({
			id: l.id,
			name: `${l.firstName} ${l.lastName ?? ''}`.trim(),
			email: l.email,
			phone: l.phone,
			status: l.status,
			source: l.source,
			vehicle: l.vehicle ? `${l.vehicle.year} ${l.vehicle.make} ${l.vehicle.model}` : null,
			createdAt: l.createdAt.toISOString()
		}))
	};
};
