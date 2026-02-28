import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ url }) => {
	const prisma = await db();

	const status = url.searchParams.get('status') ?? '';
	const search = url.searchParams.get('q') ?? '';
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
	const perPage = 20;

	const where: any = {};
	if (status) where.status = status;
	if (search) {
		where.OR = [
			{ make: { contains: search, mode: 'insensitive' } },
			{ model: { contains: search, mode: 'insensitive' } },
			{ vin: { contains: search, mode: 'insensitive' } },
			{ stockNumber: { contains: search, mode: 'insensitive' } }
		];
	}

	const [vehicles, total] = await Promise.all([
		prisma.vehicle.findMany({
			where,
			include: { photos: { where: { isPrimary: true }, take: 1 } },
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * perPage,
			take: perPage
		}),
		prisma.vehicle.count({ where })
	]);

	return {
		vehicles: vehicles.map((v) => ({
			id: v.id,
			stockNumber: v.stockNumber,
			year: v.year,
			make: v.make,
			model: v.model,
			trim: v.trim,
			price: v.price,
			status: v.status,
			mileage: v.mileage,
			photo: v.photos[0]?.url ?? null,
			daysOnLot: Math.floor((Date.now() - v.createdAt.getTime()) / 86400000)
		})),
		total,
		page,
		totalPages: Math.ceil(total / perPage),
		filters: { status, search }
	};
};
