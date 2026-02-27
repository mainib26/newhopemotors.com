import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const prisma = await db();

	const vehicles = await prisma.vehicle.findMany({
		where: { status: 'ACTIVE' },
		include: {
			photos: {
				where: { isPrimary: true },
				take: 1
			}
		},
		orderBy: { createdAt: 'desc' },
		take: 6
	});

	return {
		featuredVehicles: vehicles.map((v) => ({
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
			photos: v.photos.map((p) => ({ url: p.url, alt: p.alt }))
		}))
	};
};
