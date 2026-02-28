import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const prisma = await db();

	const vehicle = await prisma.vehicle.findUnique({
		where: { slug: params.slug },
		include: {
			photos: { orderBy: { sortOrder: 'asc' } }
		}
	});

	if (!vehicle) {
		throw error(404, 'Vehicle not found');
	}

	// If sold for more than 30 days, redirect to inventory
	if (vehicle.status === 'SOLD' && vehicle.soldAt) {
		const daysSinceSold = (Date.now() - vehicle.soldAt.getTime()) / (1000 * 60 * 60 * 24);
		if (daysSinceSold > 30) {
			return { redirect: '/inventory' };
		}
	}

	// Find similar vehicles (same body type or make, different vehicle)
	const similar = await prisma.vehicle.findMany({
		where: {
			status: 'ACTIVE',
			id: { not: vehicle.id },
			OR: [{ bodyType: vehicle.bodyType }, { make: vehicle.make }]
		},
		include: {
			photos: { where: { isPrimary: true }, take: 1 }
		},
		take: 4
	});

	return {
		vehicle: {
			id: vehicle.id,
			vin: vehicle.vin,
			stockNumber: vehicle.stockNumber,
			year: vehicle.year,
			make: vehicle.make,
			model: vehicle.model,
			trim: vehicle.trim,
			bodyType: vehicle.bodyType,
			exteriorColor: vehicle.exteriorColor,
			interiorColor: vehicle.interiorColor,
			mileage: vehicle.mileage,
			engine: vehicle.engine,
			transmission: vehicle.transmission,
			drivetrain: vehicle.drivetrain,
			price: vehicle.price,
			internetPrice: vehicle.internetPrice,
			condition: vehicle.condition,
			status: vehicle.status,
			description: vehicle.description,
			features: vehicle.features as string[],
			carfaxUrl: vehicle.carfaxUrl,
			autoCheckUrl: vehicle.autoCheckUrl,
			slug: vehicle.slug,
			photos: vehicle.photos.map((p) => ({
				id: p.id,
				url: p.url,
				alt: p.alt,
				isPrimary: p.isPrimary
			}))
		},
		similar: similar.map((v: any) => ({
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
		}))
	};
};
