import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

const PER_PAGE = 12;

export const load: PageServerLoad = async ({ url }) => {
	const prisma = await db();

	// Parse filter params
	const q = url.searchParams.get('q') || '';
	const make = url.searchParams.get('make') || '';
	const bodyType = url.searchParams.get('bodyType') || '';
	const minPrice = Number(url.searchParams.get('minPrice')) || 0;
	const maxPrice = Number(url.searchParams.get('maxPrice')) || 0;
	const minYear = Number(url.searchParams.get('minYear')) || 0;
	const maxYear = Number(url.searchParams.get('maxYear')) || 0;
	const maxMileage = Number(url.searchParams.get('maxMileage')) || 0;
	const sort = url.searchParams.get('sort') || 'newest';
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

	// Build where clause
	const where: any = { status: 'ACTIVE' };

	if (q) {
		where.OR = [
			{ make: { contains: q, mode: 'insensitive' } },
			{ model: { contains: q, mode: 'insensitive' } },
			{ trim: { contains: q, mode: 'insensitive' } },
			{ description: { contains: q, mode: 'insensitive' } }
		];
	}
	if (make) where.make = { equals: make, mode: 'insensitive' };
	if (bodyType) where.bodyType = bodyType;
	if (minPrice) where.price = { ...where.price, gte: minPrice };
	if (maxPrice) where.price = { ...where.price, lte: maxPrice };
	if (minYear) where.year = { ...where.year, gte: minYear };
	if (maxYear) where.year = { ...where.year, lte: maxYear };
	if (maxMileage) where.mileage = { lte: maxMileage };

	// Build orderBy
	const orderByMap: Record<string, any> = {
		newest: { createdAt: 'desc' },
		'price-low': { price: 'asc' },
		'price-high': { price: 'desc' },
		'mileage-low': { mileage: 'asc' },
		'mileage-high': { mileage: 'desc' }
	};
	const orderBy = orderByMap[sort] || orderByMap.newest;

	// Fetch vehicles + count
	const [vehicles, total] = await Promise.all([
		prisma.vehicle.findMany({
			where,
			include: {
				photos: {
					where: { isPrimary: true },
					take: 1
				}
			},
			orderBy,
			skip: (page - 1) * PER_PAGE,
			take: PER_PAGE
		}),
		prisma.vehicle.count({ where })
	]);

	// Get distinct makes and body types for filter dropdowns
	const allVehicles = await prisma.vehicle.findMany({
		where: { status: 'ACTIVE' },
		select: { make: true, bodyType: true },
		distinct: ['make']
	});
	const makes = [...new Set(allVehicles.map((v: any) => v.make))].sort();
	const bodyTypes = [...new Set(allVehicles.map((v: any) => v.bodyType))].sort();

	return {
		vehicles: vehicles.map((v: any) => ({
			id: v.id,
			year: v.year,
			make: v.make,
			model: v.model,
			trim: v.trim,
			price: v.price,
			internetPrice: v.internetPrice,
			mileage: v.mileage,
			bodyType: v.bodyType,
			slug: v.slug,
			exteriorColor: v.exteriorColor,
			photos: v.photos.map((p: any) => ({ url: p.url, alt: p.alt }))
		})),
		total,
		page,
		totalPages: Math.ceil(total / PER_PAGE),
		makes,
		bodyTypes,
		filters: { q, make, bodyType, minPrice, maxPrice, minYear, maxYear, maxMileage, sort }
	};
};
